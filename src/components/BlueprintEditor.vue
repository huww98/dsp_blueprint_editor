<template>
	<div class="editor-root" ref="root" tabindex="-1"></div>
</template>

<script lang="ts">
import {
	Group, LineSegments, InstancedMesh, WebGLRenderer,
	LineBasicMaterial, MeshStandardMaterial, MeshLambertMaterial, CylinderGeometry, BoxGeometry,
	Matrix4, DirectionalLight, Vector3, Object3D, Color, Ray, Sphere, Vector2, Mesh,
} from 'three';
import { SphereLatitudeGridGeometry, SphereLongitudeGridGeometry } from '@/SphereGridGeometry';
import { BeltParameters, BlueprintBuilding } from '@/blueprint/parser';
import { findPosForAreas, gridAreas, calcBuildingTrans } from '@/blueprint/planet';
import { buildingMeta, noIconBuildings } from '@/data/building';
import { isBelt, isInserter } from '@/data/items';
import { itemIconId, recipeIconId } from '@/data/icons';
import { IconTexture } from '@/iconTexture';
import { Icons } from '@/icons';
import { IconSubscript } from '@/iconSubscript';
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

	public modelRef: { mesh: InstancedMesh, instance: number }[] = [];

    public dispose() {
        this.traverse(o => {
            if (o instanceof Mesh) {
                (o as Mesh).geometry.dispose();
            }
            if (o instanceof InstancedMesh) {
                o.dispose();
            }
        });
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
				const b = belts[i];
				trans.copy(transforms[b.index][0]);
				trans.multiply(offset);
				mesh.setMatrixAt(i, trans);
				mesh.setColorAt(i, buildingMeta.get(b.modelIndex)!.color);
				allBuildings.modelRef[b.index] = { mesh, instance: i };
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

				const color = buildingMeta.get(b1.modelIndex)!.color;
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
			const b = inserters[i];

			const len = inserterTrans(transforms[b.index], trans);
			const color = buildingMeta.get(b.modelIndex)!.color;
			addCargo(trans, color, len);

			trans.multiply(temp.makeScale(1., 1., len));
			trans.multiply(offset);
			mesh.setMatrixAt(i, trans);
			mesh.setColorAt(i, color);
			allBuildings.modelRef[b.index] = { mesh, instance: i };
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
			const meta = buildingMeta.get(b.modelIndex);
			if (meta === undefined)
				continue
			trans.multiplyMatrices(transforms[b.index][0], meta.unitBoxTrans);
			mesh.setMatrixAt(i, trans);
			mesh.setColorAt(i, meta.color);
			allBuildings.modelRef[b.index] = { mesh, instance: i };
		}
		mesh.instanceMatrix.needsUpdate = true;
		mesh.instanceColor!.needsUpdate = true;
		return [mesh];
	}
	const buildIcons = (iconBuildings: BlueprintBuilding[], iconBelts: BlueprintBuilding[], iconInsterters: BlueprintBuilding[]) => {
		let count = iconBuildings.length + iconBelts.length + iconInsterters.length;
		if (count === 0)
			return [];
		let subscripts = new Map<BlueprintBuilding, string>();
		for (const b of iconBelts) {
			if (b.parameters === null)
				continue;
			const p = b.parameters as BeltParameters;
			if (p.count === 0)
				continue;
			let s;
			if (p.count >= 100000)
				s = Math.floor(p.count / 1000).toFixed(0) + 'k';
			else
				s = p.count.toFixed(0);
			subscripts.set(b, s);
		}

		const iconTexture = new IconTexture(renderer);
		const mesh = new Icons(iconTexture.texture, count);
		mesh.renderOrder = 10;

		let subscriptsMesh: null | IconSubscript = null;
		if (subscripts.size > 0) {
			let numChars = 0;
			for (const s of subscripts.values()) {
				numChars += s.length;
			}
			subscriptsMesh = new IconSubscript(numChars);
			subscriptsMesh.renderOrder = 11;
		}
		const trans = new Matrix4();
		const pos = new Vector3();

		let base = 0;
		let subscriptIdx = 0;
		const beltIconScale = new Vector2(1.1, 1.1);
		const beltIconTrans = new Matrix4().makeTranslation(0., 0., 0.5);
		for (let i = 0; i < iconBelts.length; i++) {
			const b = iconBelts[i];
			trans.multiplyMatrices(transforms[b.index][0], beltIconTrans);
			const idx = i + base;
			const iconId = iconTexture.requestIcon((b.parameters as BeltParameters).iconId);
			pos.setFromMatrixPosition(trans);
			mesh.setIcon(idx, iconId, pos, beltIconScale);

			const sub = subscripts.get(b);
			if (sub !== undefined) {
				subscriptsMesh!.setText(subscriptIdx, pos, beltIconScale, sub);
				subscriptIdx += sub.length;
			}
		}
		base += iconBelts.length;

		const inserterIconScale = new Vector2(0.8, 0.8);
		const inserterIconTrans = new Matrix4().makeTranslation(0., 0., inserterHeight);
		for (let i = 0; i < iconInsterters.length; i++) {
			const b = iconInsterters[i];
			trans.multiplyMatrices(transforms[b.index][0], inserterIconTrans);
			const idx = i + base;
			const iconId = iconTexture.requestIcon(itemIconId(b.filterId));
			mesh.setIcon(idx, iconId, pos.setFromMatrixPosition(trans), inserterIconScale);
		}
		base += iconInsterters.length

		const buildingIconScale3 = new Vector3();
		const buildingIconScale = new Vector2();
		for (let i = 0; i < iconBuildings.length; i++) {
			const b = iconBuildings[i];
			const meta = buildingMeta.get(b.modelIndex);
			if (meta === undefined)
				continue
			const idx = i + base;
			trans.multiplyMatrices(transforms[b.index][0], meta.iconTrans);
			const iconId = iconTexture.requestIcon(b.recipeId > 0 ? recipeIconId(b.recipeId) : itemIconId(b.itemId));
			buildingIconScale3.setFromMatrixScale(trans);
			buildingIconScale.set(buildingIconScale3.x, buildingIconScale3.y);
			mesh.setIcon(idx, iconId, pos.setFromMatrixPosition(trans), buildingIconScale);
		}
		base += iconBuildings.length;

		const result: Object3D[] = [mesh];
		mesh.needsUpdate();
		if (subscriptsMesh !== null) {
			subscriptsMesh.needsUpdate();
			result.push(subscriptsMesh);
		}
		return result;
	}

	const belts = buildings.filter(b => isBelt(b.itemId));
	const inserters = buildings.filter(b => isInserter(b.itemId));

	const allBuildings = new AllBuildings();
	allBuildings.modelRef = new Array(buildings.length);
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
	const iconBelts = belts.filter(b => b.parameters && (b.parameters as BeltParameters).iconId > 0);
	const iconInsterters = inserters.filter(b => b.filterId > 0);
	const icons = buildIcons(iconBuildings, iconBelts, iconInsterters)
	if (icons.length)
		allBuildings.add(...icons);

	return allBuildings;
}

function buildBVH(transforms: Matrix4[][], buildings: BlueprintBuilding[]) {
	const temp = new Matrix4();
	const inserterOffset = new Matrix4().makeTranslation(0, 0, -0.5);

	const selectBoxes = buildings.map((b, i) => {
		const meta = buildingMeta.get(b.modelIndex)!;
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
import { ref, onMounted, Ref, onUnmounted, watchEffect, computed } from 'vue'
import { Scene, PerspectiveCamera, SphereGeometry, AmbientLight } from 'three';
import { BlueprintData } from '@/blueprint/parser';
import { PlanetMapControls } from '@/PlanetMapControls';
import { attachCamera, attachRenderer } from '@/utils';

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
const renderer = new WebGLRenderer({ antialias: true });
attachRenderer(root, renderer);

const camera = new PerspectiveCamera(90);
camera.near = 0.5;
camera.far = 3000;
camera.position.z = 1.5 * R;
attachCamera(root, camera);

const b = computed(() => {
	if (!props.blueprintData)
		return null;
	const d = props.blueprintData
	const pos = findPosForAreas(d.areas, SEGMENT);
	const transforms = d.buildings.map(b => calcBuildingTrans(R, pos, b));
	const buildings = buildBuildings(transforms, d.buildings, renderer)
	const bvh = buildBVH(transforms, d.buildings);
	return { buildings, bvh };
});

watchEffect(onCleanUp => {
	if (b.value !== null) {
		const buildings = b.value.buildings
		scene.add(buildings);
		onCleanUp(() => {
            scene.remove(buildings);
            buildings.dispose();
        });
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
		if (b.value === null || props.selectedBuildingIndex === null) {
			scene.remove(selectBox);
			return;
		}
		selectBox.matrix.copy(b.value.bvh.boxes[props.selectedBuildingIndex]);
		scene.add(selectBox);
	})
}

onMounted(() => {
	const rootEl = root.value!;

	let controls = new PlanetMapControls(camera, renderer.domElement);
	controls.listenToKeyEvents(rootEl);
	controls.minDistance = R * 1.04;
	controls.maxDistance = R * 4;
	controls.targetRadius = R;
	onUnmounted(() => controls.dispose());
	controls.update();

	const ray = new Ray();
	const planetSphere = new Sphere(new Vector3(), R);
	const v = new Vector3();
	const onClick = (e: MouseEvent) => {
		const pick = () => {
			if (b.value === null)
				return null;
			ray.origin.setFromMatrixPosition(camera.matrixWorld);
			const rect = renderer.domElement.getBoundingClientRect();
			ray.direction.x = ((e.clientX - rect.left) / rect.width ) * 2 - 1;
			ray.direction.y = -((e.clientY - rect.top) / rect.height ) * 2 + 1;
			ray.direction.z = .5;
			ray.direction.unproject(camera).sub(ray.origin).normalize();
			const intersects = b.value.bvh.raycast(ray)
			if (intersects.length === 0)
				return null;

			const intersectPlanet = ray.intersectSphere(planetSphere, v);
			if (intersectPlanet !== null && intersectPlanet.distanceToSquared(ray.origin) < intersects[0].distanceSquared)
				intersects.length = 0;

			return intersects.length === 0 ? null : intersects[0].index
		}
		emit('update:selectedBuildingIndex', pick());
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
		if (b.value?.buildings.cargos)
			b.value.buildings.cargos.cargoMove = (time % 1000) / 1000;
		lastTimeStamp = time;
		requestAnimationFrame(animate);
		const cameraUpdated = controls.update();
		dirLight.position.copy(camera.position);
		renderer.render(scene, camera);
		if (cameraUpdated) {
			cameraPosVersion.value++;
		}
	}
	requestAnimationFrame(animate);
});

const selectBoxes = computed(() => b.value?.bvh.boxes);
const cameraPosVersion = ref(0);
const getModel = (index: number) => {
	if (b.value === null)
		return null
	const ref = b.value.buildings.modelRef[index]
	const m = new Matrix4();
	ref.mesh.getMatrixAt(ref.instance, m)
	return m;
}
defineExpose({
	selectBoxes,
	camera,
	cameraPosVersion,
	getModel,
});
</script>

<style lang="scss">
.editor-root {
	width: 100%;
	height: 100%;
}
</style>
