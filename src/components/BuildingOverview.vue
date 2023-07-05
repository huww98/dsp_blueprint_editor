<template>
    <h2>{{t('包含设施')}}</h2>
    <p>{{ t('共{total}个', {total}) }}</p>
    <div class="overview-icons">
        <BuildingIcon v-for="[itemId, count] in buildingCounter" :key="itemId" :icon-id="itemIconId(itemId)" :alt="itemName(itemId)" :count="count"/>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';

import { commandQueueKey } from '@/define';
import BuildingIcon from './BuildingIcon.vue';
import { itemIconId } from '@/data/icons';
import { itemName } from '@/i18n';

const { t } = useI18n();

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
</script>

<style>
.overview-icons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
</style>

<i18n>
{
    "zh": {
        "共{total}个": "共{total}个",
    },
    "en": {
        "共{total}个": "{total} in total",
    },
    "fr": {
        "共{total}个": "{total} au total",
    }
}
</i18n>
