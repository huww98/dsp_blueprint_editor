<template>
    <svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx=0 cy=0 r=50 stroke="currentcolor" fill="#0006" stroke-width=".5" opacity="0.6" />
        <template v-for="(s, i) in props.info.slots" :key="i" >
            <g v-if="s.dir !== IODir.None" :transform="`rotate(${yaw(i)})`" :opacity="params.priority[i] ? 1 : 0.5">
                <path d="M-5 -55l5 10 5 -10z" :fill="color(i)"
                      :transform="s.dir === IODir.Input ? '' : 'rotate(180 0 -50)'"/>
                <template v-if="s.dir === IODir.Output && params.priority[i]">
                    <circle cx=0 cy=-80 r=16 fill="none" :stroke="color(i)" stroke-width="3"/>
                    <image v-if="props.building.filterId > 0"
                           :href="filterIcon" width=24 height=24 x=-12 y=-92
                           :transform="`rotate(${-yaw(i)} 0 -80)`"></image>
                    <text v-else fill="currentcolor" x=0 y=-80 textLength="24"
                          font-size="8" text-anchor="middle" dominant-baseline="middle"
                          :transform="`rotate(${-yaw(i)} 0 -80)`">
                        过滤器
                    </text>
                </template>
                <circle v-else cx=0 cy=-80 r=12 :fill="color(i)"/>
            </g>
        </template>
    </svg>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref, watchEffect } from 'vue';
import { SplitterInfo } from '@/blueprint/buildingInfo';
import { BlueprintBuilding, IODir, SplitterParameters } from "@/blueprint/parser";
import { itemsMap } from '@/data';

const props = defineProps<{
    info: SplitterInfo,
    building: BlueprintBuilding,
}>();

const color = (i: number) => {
    return props.info.slots[i].dir === IODir.Input ? '#AFFFFF' : '#FCE88F';
}

const yaw = (i: number) => {
    return 90 * i + props.building.yaw[0];
}

const filterIcon = ref('');
watchEffect(async () => {
    filterIcon.value = '';
    if (props.building.filterId <= 0)
        return;
    const name = itemsMap.get(props.building.filterId)!.icon;
    filterIcon.value = (await import(/* webpackMode: "eager" */`@/assets/icons/item_recipe/${name}.png`)).default;
});

const params = computed(() => props.building.parameters as SplitterParameters);
</script>
