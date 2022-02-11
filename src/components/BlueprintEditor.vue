<template>
	<div class="editor-root" ref="root"></div>
</template>

<script lang="ts">
import { SphereLatitudeGridGeometry, SphereLongitudeGridGeometry } from '@/SphereGridGeometry';
import { gridAreas } from '@/blueprint/planet';
import { Group, LineSegments, LineBasicMaterial } from 'three';

function buildPlanetGrid(radius = 1, segment = 200) {
	const allGrids = new Group();
	const material = new LineBasicMaterial( { color: 0xf0f0f0 } );

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

const R = 1.;
const SEGMENT = 200;

</script>

<script setup lang="ts">
import { ref, onMounted, Ref, onUnmounted } from 'vue'
import { Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
import { PlanetMapControls } from '@/PlanetMapControls';


const scene = new Scene();
{
	const geometry = new SphereGeometry(R, SEGMENT, SEGMENT / 2);
	const material = new MeshBasicMaterial( { color: 0xb0b0b0 } );
	const planet = new Mesh(geometry, material);
	scene.add(planet);
}
scene.add(buildPlanetGrid(R * 1.001, SEGMENT));

const root: Ref<HTMLDivElement | null> = ref(null);

onMounted(() => {
	const rootEl = root.value!;
	const camera = new PerspectiveCamera(75, rootEl.clientWidth / rootEl.clientHeight, 0.05, 100);
	const renderer = new WebGLRenderer({ antialias: true });

	const controls = new PlanetMapControls(camera, renderer.domElement);
	controls.listenToKeyEvents(window)
	controls.minDistance = R * 1.1;
	controls.maxDistance = R * 5;

	rootEl.appendChild(renderer.domElement);

	camera.position.z = 2;
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
