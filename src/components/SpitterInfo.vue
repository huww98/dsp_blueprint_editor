<template>
    <div class="splitter-pannel">
        <svg viewBox="-125 -125 250 250" xmlns="http://www.w3.org/2000/svg">
            <circle cx=0 cy=0 r=50 stroke="currentcolor" fill="#0006" stroke-width=".5" opacity="0.6" />
            <template v-for="(s, i) in props.info.slots" :key="i" >
                <g v-if="s.dir !== IODir.None" :opacity="params.priority[i] ? 1 : 0.5">
                    <path d="M-5 -55l5 10 5 -10z" :fill="color(i)"
                        :transform="`rotate(${yaw[i]})` + (s.dir === IODir.Input ? '' : 'rotate(180 0 -50)')"/>
                    <g :transform="circleTrans[i]">
                        <template v-if="s.dir === IODir.Output && params.priority[i]">
                            <circle cx=0 cy=0 r=16 fill="none" :stroke="color(i)" stroke-width="3"/>
                            <image v-if="props.building.filterId > 0"
                                :href="filterIcon" width=24 height=24 x=-12 y=-12></image>
                            <text v-else fill="currentcolor" x=0 y=0 textLength="24"
                                font-size="8" text-anchor="middle" dominant-baseline="middle">
                                过滤器
                            </text>
                        </template>
                        <circle v-else cx=0 cy=0 r=12 :fill="color(i)"/>
                    </g>
                </g>
            </template>
        </svg>
        <div class="model" ref="glRoot"></div>
    </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref, watch, watchEffect } from 'vue';
import { SplitterInfo } from '@/blueprint/buildingInfo';
import { BlueprintBuilding, IODir, SplitterParameters } from "@/blueprint/parser";
import { itemsMap } from '@/data';
import { AmbientLight, BoxGeometry, Camera, DirectionalLight, Matrix4, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { attachRenderer } from '@/utils';

const props = defineProps<{
    info: SplitterInfo,
    building: BlueprintBuilding,
    model: Matrix4,
    camera: Camera,
    cameraPosVersion: number,
}>();

const color = (i: number) => {
    return props.info.slots[i].dir === IODir.Input ? '#AFFFFF' : '#FCE88F';
}

const posFromCamera = computed(() => {
    const pos = new Matrix4();
    props.cameraPosVersion;
    pos.multiplyMatrices(props.camera.matrixWorldInverse, props.model);
    return pos;
});

const offset = new Vector2();
const pos = new Vector3();
const defaultR = 90;
const offsetR = 16;
const circlePos = (i: number) => {
    const singleLine = props.building.modelIndex === 39
    let deg;
    let r = defaultR;
    if (singleLine) {
        deg = Math.floor(i / 2) * 180.0;
    } else {
        deg = 90 * i;
        r -= offsetR
    }
    const rad = (deg + props.building.yaw[0]) / 180.0 * Math.PI;
    const c = new Vector2(Math.sin(rad), -Math.cos(rad)).multiplyScalar(r);

    if (singleLine) {
        pos.setFromMatrixPosition(posFromCamera.value);
        const up = i % 2 === 1 ? 1 : -1;
        offset.set(pos.x, -pos.y).normalize().multiplyScalar(offsetR * up);
        c.add(offset);
    }
    return c;
}
const circlePoses = computed(() => {
    const ps = new Array<Vector2>(4);
    for (let i = 0; i < ps.length; i++) {
        ps[i] = circlePos(i);
    }
    return ps;
})
const circleTrans = computed(() => circlePoses.value.map(p => `translate(${p.x} ${p.y})`))
const yaw = computed(() => circlePoses.value.map(p => Math.atan2(p.y, p.x) / Math.PI * 180 + 90))

const filterIcon = ref('');
watchEffect(async () => {
    filterIcon.value = '';
    if (props.building.filterId <= 0)
        return;
    const name = itemsMap.get(props.building.filterId)!.icon;
    filterIcon.value = (await import(/* webpackMode: "eager" */`@/assets/icons/item_recipe/${name}.png`)).default;
});

const camera = new PerspectiveCamera(50.0);
const renderer = new WebGLRenderer({ antialias: true });
renderer.setClearAlpha(0.0);
const glRoot = ref<HTMLElement | null>(null);
attachRenderer(glRoot, renderer)

const scene = new Scene();
const geometry = new BoxGeometry(1.0, 1.0, 1.0);
const material = new MeshStandardMaterial({
    color: 0xFFFFFF,
    opacity: 0.5,
    transparent: true,
    depthWrite: false,
});
const model = new Mesh(geometry, material);
model.matrixAutoUpdate = false;
const dirLight = new DirectionalLight();
dirLight.position.set(0, 0, 1);
dirLight.target = model;
const envLight = new AmbientLight(0xFFFFFF, 0.3);
scene.add(model, dirLight, envLight);

let animationFrame: null | number = null;
const updateModel = () => {
    animationFrame = null;
    pos.setFromMatrixPosition(posFromCamera.value);
    pos.normalize().multiplyScalar(8.0);
    model.matrix.copy(posFromCamera.value);
    model.matrix.setPosition(pos);
    camera.lookAt(pos);
    renderer.render(scene, camera);
}

watch(posFromCamera, () => {
    if (animationFrame === null) {
        animationFrame = requestAnimationFrame(updateModel);
    }
}, { immediate: true });

const params = computed(() => props.building.parameters as SplitterParameters);
</script>

<style lang="scss">
.splitter-pannel {
    position: relative;

    svg {
        inset: 0;
        display: block;
    }
    .model {
        position: absolute;
        inset: 30%;
    }
}
</style>
