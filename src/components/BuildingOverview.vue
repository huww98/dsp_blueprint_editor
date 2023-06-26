<template>
    <h2>包含设施 <small>共{{ total }}个</small></h2>
    <BuildingIcon v-for="[itemId, count] in buildingCounter" :key="itemId" :icon-id="itemIconId(itemId)" :alt="itemName(itemId)" :count="count"/>
</template>

<script lang="ts" setup>
import { commandQueueKey } from '@/define';
import { computed, inject } from 'vue';
import BuildingIcon from './BuildingIcon.vue';
import { itemIconId } from '@/data/icons';
import { itemsMap } from '@/data';

const commandQueue = inject(commandQueueKey)!.value!;

const total = computed(() => {
    return commandQueue.data.buildings.length;
});

const buildingCounter = computed(() => {
    const counter = new Map<number, number>();
    for (const b of commandQueue.data.buildings) {
        const count = counter.get(b.itemId) ?? 0;
        counter.set(b.itemId, count + 1);
    }
    return counter;
});

function itemName(itemId: number) {
    return itemsMap.get(itemId)?.name;
}
</script>
