<template>
	<div class="editor-root" ref="root" tabindex="-1"></div>
</template>

<script lang="ts">
import {
	Group, LineSegments, InstancedMesh, WebGLRenderer,
	LineBasicMaterial, MeshStandardMaterial, MeshLambertMaterial, CylinderGeometry, BoxGeometry,
	Matrix4, DirectionalLight, Vector3, Object3D,
} from 'three';
import { SphereLatitudeGridGeometry, SphereLongitudeGridGeometry } from '@/SphereGridGeometry';
import { BlueprintBuilding } from '@/blueprint/parser';
import { findPosForAreas, gridAreas, calcBuildingTrans, PositionedBlueprint } from '@/blueprint/planet';
import { beltColorMap, buildingMeta, isBelt, isInserter, noIconBuildings } from '@/data/items';
import { IconTexture } from '@/iconTexture';
import { Icons } from '@/icons';

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

function buildBuildings(R: number, pos: PositionedBlueprint, buildings: BlueprintBuilding[], renderer: WebGLRenderer) {
	const transforms = buildings.map(b => calcBuildingTrans(R, pos, b));
	const buildBelts = (belts: BlueprintBuilding[]) => {
		if (!belts)
			return [];
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
				mesh.setColorAt(i, beltColorMap.get(belts[i].itemId)!);
			}
			mesh.instanceMatrix.needsUpdate = true;
			mesh.instanceColor!.needsUpdate = true;
			objects.push(mesh);
		}
		const linkThickness = 0.6 * thickness;
		{ // links
			const geometry = new BoxGeometry(0.2, linkThickness, 1.0);
			const mesh = new InstancedMesh(geometry, material, belts.length);
			let numLinks = 0;
			const offset = new Matrix4().makeTranslation(0, linkThickness / 2, -0.5);
			const pos1 = new Vector3();
			const pos2 = new Vector3();
			const dir = new Vector3();
			const scale = new Vector3();
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
				scale.setFromMatrixScale(transforms[b1.index][0]);
				trans.multiply(temp.makeScale(scale.x, scale.y, len));
				trans.multiply(offset);
				trans.premultiply(temp.makeTranslation(pos1.x, pos1.y, pos1.z));
				mesh.setMatrixAt(numLinks, trans);
				mesh.setColorAt(numLinks, beltColorMap.get(b1.itemId)!);
				numLinks++;
			}
			if (numLinks) {
				mesh.count = numLinks;
				mesh.instanceMatrix.needsUpdate = true;
				mesh.instanceColor!.needsUpdate = true;
				allBuildings.add(mesh);
			}
		}
		return objects;
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
	const buildIcons = (iconBuildings: BlueprintBuilding[]) => {
		const iconTexture = new IconTexture(renderer);
		const mesh = new Icons(iconTexture.texture, iconBuildings.length);
		const trans = new Matrix4();
		const iconIds: number[] = []
		for (let i = 0; i < iconBuildings.length; i++) {
			const b = iconBuildings[i];
			const meta = buildingMeta.get(b.itemId);
			if (meta === undefined)
				continue
			trans.multiplyMatrices(transforms[b.index][0], meta.iconTrans);
			mesh.setMatrixAt(i, trans);
			const iconId = b.recipeId > 0 ? iconTexture.requestRecipeIcon(b.recipeId) : iconTexture.requestItemIcon(b.itemId);
			iconIds.push(iconId);
		}
		mesh.setIconIds(iconIds);
		mesh.instanceMatrix.needsUpdate = true;
		return [mesh];
	}

	const allBuildings = new Group();
	const belts = buildings.filter(b => isBelt(b.itemId));
	if (belts)
		allBuildings.add(...buildBelts(belts));

	const boxes = buildings.filter(b => !isInserter(b.itemId) && !isBelt(b.itemId));
	if (boxes)
		allBuildings.add(...buildBoxes(boxes));

	const iconBuildings = boxes.filter(b => !noIconBuildings.has(b.itemId));
	if (iconBuildings)
		allBuildings.add(...buildIcons(iconBuildings));

	return allBuildings;
}

const R = 200.2;
const SEGMENT = 200;

</script>

<script setup lang="ts">
import { ref, onMounted, Ref, onUnmounted, defineProps, watchEffect } from 'vue'
import { Scene, PerspectiveCamera, SphereGeometry, Mesh, AmbientLight } from 'three';
import { BlueprintData } from '@/blueprint/parser';
import { PlanetMapControls } from '@/PlanetMapControls';

const props = defineProps<{
  blueprintData: BlueprintData | null;
}>();

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

	let buildings: Group | null = null
	watchEffect(() => {
		if (buildings !== null) {
			scene.remove(buildings);
			buildings = null;
		}
		if (props.blueprintData) {
			const pos = findPosForAreas(props.blueprintData.areas, SEGMENT);
			buildings = buildBuildings(R, pos, props.blueprintData.buildings, renderer)
			scene.add(buildings);
		}
	});

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

	let mounted = true;
	let lastTimeStamp : number | null = null
	function animate(time: number) {
		if (!mounted)
			return;
		if (lastTimeStamp) {
			controls.updateTimeDelta((time - lastTimeStamp) / 1000);
		}
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
		window.removeEventListener('resize', onResize);
		mounted = false;
	});
});

</script>

<style lang="scss">
.editor-root {
	width: 100%;
	height: 100%;
}
</style>
