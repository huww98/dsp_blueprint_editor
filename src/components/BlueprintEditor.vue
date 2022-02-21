<template>
	<div class="editor-root" ref="root" tabindex="-1"></div>
</template>

<script lang="ts">
import {
	Group, LineSegments, InstancedMesh, WebGLRenderer,
	LineBasicMaterial, MeshStandardMaterial, MeshLambertMaterial, CylinderGeometry, BoxGeometry,
	Matrix4, DirectionalLight, Vector3, Object3D, Color, Ray, Sphere,
} from 'three';
import { SphereLatitudeGridGeometry, SphereLongitudeGridGeometry } from '@/SphereGridGeometry';
import { BlueprintBuilding, IODir, StationParameters } from '@/blueprint/parser';
import { findPosForAreas, gridAreas, calcBuildingTrans } from '@/blueprint/planet';
import { buildingMeta, isBelt, isInserter, isStation, noIconBuildings, stationSlotTrans } from '@/data/building';
import { IconTexture } from '@/iconTexture';
import { Icons } from '@/icons';
import { Cargos } from '@/cargos';
import { BVH } from '@/bvh';

function buildPlanetGrid(radius = 1, segment = 200) {
	const allGrids = new Group();
	const material = new LineBasicMaterial( { color: 0xf0f0f0, depthWrite: false } );

	const latitudeGeometry = new SphereLatitudeGridGeometry({
		radius,
		widthSegments: segment,
		heightSegments: segment / 2
	});
	allGrids.add(new LineSegments(latitudeGeometry, material));

	const radPerSeg = 2 * Math.PI / segment;
	for (const {minLatitudeSeg, latitudeSeg, longitudeSeg} of gridAreas(segment)) {
		const geometry = new SphereLongitudeGridGeometry({
			radius,
			widthSegments: longitudeSeg, heightSegments: Math.abs(latitudeSeg),
			phiStart: 0, phiLength: Math.PI * 2,
			thetaStart: (minLatitudeSeg + segment / 4) * radPerSeg, thetaLength: latitudeSeg * radPerSeg,
		});
		allGrids.add(new LineSegments(geometry, material));
	}
	return allGrids;
}

class AllBuildings extends Object3D {

	private _cargos: Cargos | null = null;
	public get cargos() {
		return this._cargos;
	}
	public set cargos(c: Cargos | null) {
		if (this._cargos)
			this.remove(this._cargos);
		this._cargos = c;
		if (c)
			this.add(c);
	}

}

const pos1 = new Vector3();
const pos2 = new Vector3();
const dir = new Vector3();
const inserterHeight = 0.3;
function inserterTrans(transforms: Matrix4[], trans: Matrix4) {
	pos1.setFromMatrixPosition(transforms[0]);
	dir.copy(pos1).normalize().multiplyScalar(inserterHeight);
	pos1.add(dir);

	pos2.setFromMatrixPosition(transforms[1]);
	dir.copy(pos2).normalize().multiplyScalar(inserterHeight);
	pos2.add(dir);

	trans.setPosition(pos1.x, pos1.y, pos1.z);
	trans.lookAt(pos1, pos2, pos1);
	return dir.subVectors(pos1, pos2).length();
}

function buildBuildings(transforms: Matrix4[][], buildings: BlueprintBuilding[], renderer: WebGLRenderer) {
	const buildBelts = (belts: BlueprintBuilding[]) => {
		const thickness = 0.1;
		const material = new MeshLambertMaterial();
		const objects: Object3D[] = [];
		{
			const geometry = new CylinderGeometry(0.32, 0.32, thickness, 8);
			const mesh = new InstancedMesh(geometry, material, belts.length);
			const offset = new Matrix4().makeRotationX(Math.PI / 2);
			offset.premultiply(new Matrix4().makeTranslation(0, 0, thickness / 2));
			const trans = new Matrix4();
			for (let i = 0; i < belts.length; i++) {
				trans.copy(transforms[belts[i].index][0]);
				trans.multiply(offset);
				mesh.setMatrixAt(i, trans);
				mesh.setColorAt(i, buildingMeta.get(belts[i].itemId)!.color);
			}
			mesh.instanceMatrix.needsUpdate = true;
			mesh.instanceColor!.needsUpdate = true;
			objects.push(mesh);
		}
		const linkThickness = 0.6 * thickness;
		{ // links
			const geometry = new BoxGeometry(0.15, linkThickness, 1.0);
			const mesh = new InstancedMesh(geometry, material, belts.length);
			let numLinks = 0;
			const offset = new Matrix4().makeTranslation(0, linkThickness / 2, -0.5);
			const pos1 = new Vector3();
			const pos2 = new Vector3();
			const dir = new Vector3();
			const temp = new Matrix4();
			const trans = new Matrix4();
			for (let i = 0; i < belts.length; i++) {
				const b1 = belts[i];
				if (b1.outputObjIdx < 0)
					continue;
				pos1.setFromMatrixPosition(transforms[b1.index][0]);
				pos2.setFromMatrixPosition(transforms[b1.outputObjIdx][0]);
				const len = dir.subVectors(pos1, pos2).length();
				trans.identity();
				trans.lookAt(pos1, pos2, pos1);
				trans.premultiply(temp.makeTranslation(pos1.x, pos1.y, pos1.z));

				const color = buildingMeta.get(b1.itemId)!.color;
				addCargo(trans, color, len);

				trans.multiply(temp.makeScale(1., 1., len));
				trans.multiply(offset);
				mesh.setMatrixAt(numLinks, trans);
				mesh.setColorAt(numLinks, color);
				numLinks++;
			}
			if (numLinks) {
				mesh.count = numLinks;
				mesh.instanceMatrix.needsUpdate = true;
				mesh.instanceColor!.needsUpdate = true;
				objects.push(mesh);
			}
		}
		return objects;
	}
	const buildInserters = (inserters: BlueprintBuilding[]) => {
		const inserterThickness = 0.06;
		const geometry = new BoxGeometry(0.15, inserterThickness, 1.0);
		const material = new MeshLambertMaterial();
		const mesh = new InstancedMesh(geometry, material, inserters.length);
		const offset = new Matrix4().makeTranslation(0, 0, -0.5);
		const temp = new Matrix4();
		const trans = new Matrix4();
		for (let i = 0; i < inserters.length; i++) {
			const b1 = inserters[i];

			const len = inserterTrans(transforms[b1.index], trans);
			const color = buildingMeta.get(b1.itemId)!.color;
			addCargo(trans, color, len);

			trans.multiply(temp.makeScale(1., 1., len));
			trans.multiply(offset);
			mesh.setMatrixAt(i, trans);
			mesh.setColorAt(i, color);
		}
		mesh.instanceMatrix.needsUpdate = true;
		mesh.instanceColor!.needsUpdate = true;
		return [mesh];
	}
	const buildBoxes = (boxes: BlueprintBuilding[]) => {
		const geometry = new BoxGeometry(1.0, 1.0, 1.0);
		const material = new MeshLambertMaterial();
		const mesh = new InstancedMesh(geometry, material, boxes.length);
		const trans = new Matrix4();
		for (let i = 0; i < boxes.length; i++) {
			const b = boxes[i];
			const meta = buildingMeta.get(b.itemId);
			if (meta === undefined)
				continue
			trans.multiplyMatrices(transforms[b.index][0], meta.unitBoxTrans);
			mesh.setMatrixAt(i, trans);
			mesh.setColorAt(i, meta.color);
		}
		mesh.instanceMatrix.needsUpdate = true;
		mesh.instanceColor!.needsUpdate = true;
		return [mesh];
	}
	const buildIcons = (iconBuildings: BlueprintBuilding[], iconInsterters: BlueprintBuilding[], stations: BlueprintBuilding[]) => {
		let count = iconBuildings.length + iconInsterters.length;
		for (const b of stations) {
			if (b.parameters === null)
				continue;
			for (const s of (b.parameters as StationParameters).slots) {
				if (s.storageIdx > 0 && s.dir !== IODir.None)
					count++;
			}
		}
		if (count === 0)
			return [];

		const iconTexture = new IconTexture(renderer);
		const mesh = new Icons(iconTexture.texture, count);
		const trans = new Matrix4();
		const iconIds = new Int32Array(count);
		const inserterIconTrans = new Matrix4().makeScale(0.9, 0.9, 1.);
		inserterIconTrans.premultiply(new Matrix4().makeTranslation(0., 0., inserterHeight));
		for (let i = 0; i < iconInsterters.length; i++) {
			const b = iconInsterters[i];
			trans.multiplyMatrices(transforms[b.index][0], inserterIconTrans);
			mesh.setMatrixAt(i, trans);
			iconIds[i] = iconTexture.requestItemIcon(b.filterId);
		}
		let base = iconInsterters.length;
		for (let i = 0; i < iconBuildings.length; i++) {
			const b = iconBuildings[i];
			const meta = buildingMeta.get(b.itemId);
			if (meta === undefined)
				continue
			const idx = i + base;
			trans.multiplyMatrices(transforms[b.index][0], meta.iconTrans);
			mesh.setMatrixAt(idx, trans);
			const iconId = b.recipeId > 0 ? iconTexture.requestRecipeIcon(b.recipeId) : iconTexture.requestItemIcon(b.itemId);
			iconIds[idx] = iconId;
		}
		base += iconBuildings.length;

		const stationIconTrans = new Matrix4().makeScale(0.9, 0.9, 1.);
		stationIconTrans.premultiply(new Matrix4().makeTranslation(0., 0., 0.4));
		for (let i = 0; i < stations.length; i++) {
			const b = stations[i];
			if (b.parameters === null)
				continue;
			const p = b.parameters as StationParameters
			for (let j = 0; j < p.slots.length; j++) {
				const s = p.slots[j];
				if (s.storageIdx <= 0 || s.dir === IODir.None)
					continue;
				trans.multiplyMatrices(stationSlotTrans[j], stationIconTrans);
				trans.premultiply(transforms[b.index][0]);
				mesh.setMatrixAt(base, trans);
				iconIds[base] = iconTexture.requestItemIcon(p.storage[s.storageIdx - 1].itemId);
				base++;
			}
		}

		mesh.setIconIds(iconIds);
		mesh.instanceMatrix.needsUpdate = true;
		return [mesh];
	}

	const belts = buildings.filter(b => isBelt(b.itemId));
	const inserters = buildings.filter(b => isInserter(b.itemId));

	const allBuildings = new AllBuildings();
	const cargosMesh = new Cargos(belts.length + inserters.length);
	let numCargos = 0;
	const addCargo = (trans: Matrix4, color: Color, distance: number) => {
		cargosMesh.setMatrixAt(numCargos, trans);
		cargosMesh.setColorAt(numCargos, color);
		cargosMesh.setCargoDistanceAt(numCargos, distance);
		numCargos++;
	}

	if (belts.length)
		allBuildings.add(...buildBelts(belts));

	if (inserters.length)
		allBuildings.add(...buildInserters(inserters));

	if (numCargos) {
		cargosMesh.count = numCargos;
		cargosMesh.instanceMatrix.needsUpdate = true;
		cargosMesh.instanceColor!.needsUpdate = true;
		cargosMesh.geometry.cargoDistance.needsUpdate = true;
		allBuildings.cargos = cargosMesh;
	}

	const boxes = buildings.filter(b => !isInserter(b.itemId) && !isBelt(b.itemId));
	if (boxes.length)
		allBuildings.add(...buildBoxes(boxes));

	const iconBuildings = boxes.filter(b => !noIconBuildings.has(b.itemId));
	const iconInsterters = inserters.filter(b => b.filterId > 0);
	const stations = boxes.filter(b => isStation(b.itemId));
	const icons = buildIcons(iconBuildings, iconInsterters, stations)
	if (icons.length)
		allBuildings.add(...icons);

	return allBuildings;
}

function buildBVH(transforms: Matrix4[][], buildings: BlueprintBuilding[]) {
	const temp = new Matrix4();
	const inserterOffset = new Matrix4().makeTranslation(0, 0, -0.5);

	const selectBoxes = buildings.map((b, i) => {
		const meta = buildingMeta.get(b.itemId)!;
		const box = new Matrix4();
		if (isInserter(b.itemId)) {
			const len = inserterTrans(transforms[i], box);
			box.multiply(temp.makeScale(0.5, 0.5, len));
			box.multiply(inserterOffset);
		} else {
			box.multiplyMatrices(transforms[i][0], meta.selectUnitBoxTrans);
		}
		return box;
	});
	return new BVH(selectBoxes);
}

const R = 200.2;
const SEGMENT = 200;

</script>

<script setup lang="ts">
import { ref, onMounted, Ref, onUnmounted, defineProps, defineEmits, watchEffect } from 'vue'
import { Scene, PerspectiveCamera, SphereGeometry, Mesh, AmbientLight } from 'three';
import { BlueprintData } from '@/blueprint/parser';
import { PlanetMapControls } from '@/PlanetMapControls';

const props = defineProps<{
  blueprintData: BlueprintData | null,
  selectedBuildingIndex: number | null,
}>();

const emit = defineEmits<{
  (e: 'update:selectedBuildingIndex', index: number | null): void
}>()

const scene = new Scene();
scene.add(new AmbientLight(0xffffff, 0.2));
const dirLight = new DirectionalLight(0xffffff, 1);
scene.add(dirLight);
{
	const geometry = new SphereGeometry(R, SEGMENT, SEGMENT / 2);
	const material = new MeshStandardMaterial( { color: 0xb0b0b0 } );
	const planet = new Mesh(geometry, material);
	scene.add(planet);
}
scene.add(buildPlanetGrid(R * 1.0001, SEGMENT));

const root: Ref<HTMLDivElement | null> = ref(null);

onMounted(() => {
	const rootEl = root.value!;
	const camera = new PerspectiveCamera(90, rootEl.clientWidth / rootEl.clientHeight, 1, 10000);
	const renderer = new WebGLRenderer({ antialias: true });

	let buildings: AllBuildings | null = null;
	let bvh: BVH | null = null;
	watchEffect(() => {
		if (buildings !== null) {
			scene.remove(buildings);
			buildings = null;
			bvh = null;
		}
		if (props.blueprintData) {
			const d = props.blueprintData
			const pos = findPosForAreas(d.areas, SEGMENT);
			const transforms = d.buildings.map(b => calcBuildingTrans(R, pos, b));
			buildings = buildBuildings(transforms, d.buildings, renderer)
			scene.add(buildings);

			bvh = buildBVH(transforms, d.buildings);
		}
	});

	{
		const geometry = new BoxGeometry(1., 1., 1.);
		const material = new MeshStandardMaterial({
			color: 0x0074E8,
			opacity: 0.5,
			transparent: true,
			depthWrite: false,
		});
		const selectBox = new Mesh(geometry, material);
		selectBox.matrixAutoUpdate = false;
		watchEffect(() => {
			if (props.blueprintData === null || props.selectedBuildingIndex === null) {
				scene.remove(selectBox);
				return;
			}
			selectBox.matrix.copy(bvh!.boxes[props.selectedBuildingIndex]);
			scene.add(selectBox);
		})
	}

	let controls = new PlanetMapControls(camera, renderer.domElement);
	controls.listenToKeyEvents(rootEl);
	controls.minDistance = R * 1.05;
	controls.maxDistance = R * 5;
	controls.targetRadius = R;

	rootEl.appendChild(renderer.domElement);

	camera.position.z = 1.5 * R;
	controls.update();

	const onResize = () => {
		camera.aspect = rootEl.clientWidth / rootEl.clientHeight;
		camera.updateProjectionMatrix();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(rootEl.clientWidth, rootEl.clientHeight);
	}
	onResize();
	window.addEventListener('resize', onResize);
	onUnmounted(() => { window.removeEventListener('resize', onResize); });

	const ray = new Ray();
	const planetSphere = new Sphere(new Vector3(), R);
	const v = new Vector3();
	const onClick = (e: MouseEvent) => {
		if (bvh === null) {
			emit('update:selectedBuildingIndex', null);
			return;
		}
		ray.origin.setFromMatrixPosition(camera.matrixWorld);
		ray.direction.x = (e.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		ray.direction.y = -(e.clientY / renderer.domElement.clientHeight ) * 2 + 1;
		ray.direction.z = 1.;
		ray.direction.unproject(camera).sub(ray.origin).normalize();
		const intersects = bvh.raycast(ray)
		if (intersects.length === 0) {
			emit('update:selectedBuildingIndex', null);
			return;
		}

		const intersectPlanet = ray.intersectSphere(planetSphere, v);
		if (intersectPlanet !== null && intersectPlanet.distanceToSquared(ray.origin) < intersects[0].distanceSquared)
			intersects.length = 0;

		emit('update:selectedBuildingIndex', intersects.length === 0 ? null : intersects[0].index);
	}
	renderer.domElement.addEventListener('click', onClick);
	onUnmounted(() => renderer.domElement.removeEventListener('click', onClick));

	let mounted = true;
	onUnmounted(() => { mounted = false; });
	let lastTimeStamp : number | null = null
	function animate(time: number) {
		if (!mounted)
			return;
		if (lastTimeStamp) {
			controls.updateTimeDelta((time - lastTimeStamp) / 1000);
		}
		if (buildings?.cargos)
			buildings.cargos.cargoMove = (time % 1000) / 1000;
		lastTimeStamp = time;
		requestAnimationFrame(animate);
		controls.update();
		dirLight.position.copy(camera.position);
		renderer.render(scene, camera);
	}
	requestAnimationFrame(animate);

	onUnmounted(() => {
		controls.dispose();
		renderer.dispose();
	});
});

</script>

<style lang="scss">
.editor-root {
	width: 100%;
	height: 100%;
}
</style>
