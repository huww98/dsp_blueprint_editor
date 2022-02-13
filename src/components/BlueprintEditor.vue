<template>
	<div class="editor-root" ref="root"></div>
</template>

<script lang="ts">
import { Group, LineSegments, InstancedMesh, LineBasicMaterial, MeshStandardMaterial, CylinderGeometry, Matrix4, DirectionalLight } from 'three';
import { SphereLatitudeGridGeometry, SphereLongitudeGridGeometry } from '@/SphereGridGeometry';
import { BlueprintBuilding } from '@/blueprint/parser';
import { findPosForAreas, gridAreas, calcBuildingTrans, PositionedBlueprint } from '@/blueprint/planet';
import { beltColorMap, isBelt } from '@/data/items';

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

function buildBuildings(R: number, pos: PositionedBlueprint, buildings: BlueprintBuilding[]) {
	const allBuildings = new Group();
	const rScale = new Matrix4().makeScale(R, R, R);
	{
		const belts = buildings.filter(b => isBelt(b.itemId));
		const thickness = 0.1;
		const geometry = new CylinderGeometry(0.3, 0.3, thickness, 32);
		const material = new MeshStandardMaterial({ metalness: 0, roughness: 1 });
		const mesh = new InstancedMesh(geometry, material, belts.length);
		const offset = new Matrix4().makeRotationX(Math.PI / 2);
		offset.premultiply(new Matrix4().makeTranslation(0, 0, thickness / 2));
		for (let i = 0; i < belts.length; i++) {
			const trans = calcBuildingTrans(pos, belts[i])[0];
			trans.multiply(offset);
			trans.premultiply(rScale);
			mesh.setMatrixAt(i, trans);
			mesh.setColorAt(i, beltColorMap.get(belts[i].itemId)!);
		}
		mesh.instanceMatrix.needsUpdate = true;
		mesh.instanceColor!.needsUpdate = true;
		allBuildings.add(mesh);
	}
	return allBuildings;
}

const R = 1.;
const SEGMENT = 200;

</script>

<script setup lang="ts">
import { ref, onMounted, Ref, onUnmounted, defineProps } from 'vue'
import { Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, Mesh, AmbientLight } from 'three';
import { BlueprintData } from '@/blueprint/parser';
import { PlanetMapControls } from '@/PlanetMapControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const FREEVIEW = false;

const props = defineProps<{
  blueprintData: BlueprintData;
}>();

const scene = new Scene();
scene.add(new AmbientLight(0xffffff, 0.1));
const dirLight = new DirectionalLight(0xffffff, 1);
scene.add(dirLight);
{
	const geometry = new SphereGeometry(R, SEGMENT, SEGMENT / 2);
	const material = new MeshStandardMaterial( { color: 0xb0b0b0 } );
	const planet = new Mesh(geometry, material);
	scene.add(planet);
}
scene.add(buildPlanetGrid(R * 1.0001, SEGMENT));

const pos = findPosForAreas(props.blueprintData.areas, SEGMENT);
scene.add(buildBuildings(R, pos, props.blueprintData.buildings));

const root: Ref<HTMLDivElement | null> = ref(null);

onMounted(() => {
	const rootEl = root.value!;
	const camera = new PerspectiveCamera(90, rootEl.clientWidth / rootEl.clientHeight, 0.02, 100);
	const renderer = new WebGLRenderer({ antialias: true });

	let controls: PlanetMapControls | OrbitControls;
	if (FREEVIEW) {
		controls = new OrbitControls(camera, renderer.domElement);
	} else {
		controls = new PlanetMapControls(camera, renderer.domElement);
		controls.listenToKeyEvents(window)
		controls.minDistance = R * 1.05;
		controls.maxDistance = R * 5;
	}

	rootEl.appendChild(renderer.domElement);

	camera.position.z = 1.5;
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
	function animate() {
		if (!mounted)
			return;
		requestAnimationFrame(animate);
		controls.update();
		dirLight.position.copy(camera.position);
		renderer.render(scene, camera);
	}
	animate();

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
	height: 100vh;
	width: 100vw;
}
</style>
