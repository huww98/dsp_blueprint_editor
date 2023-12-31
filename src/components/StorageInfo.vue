<template>
    <div v-if="p.type === StorageType.FILTERED" class="storage-grid" :class="'capacity-' + capacity">
        <div v-for="(g, i) in p.grids" :key="i" :class="{ban: i >= capacityForAutomation}">
            <BuildingIcon v-if="g.filter > 0" :icon-id="itemIconId(g.filter)" />
        </div>
    </div>
    <div class="building-params">
        <div>
            <label>{{ t('自动化容量限制') }}</label>
            <span class="v">{{ capacityForAutomation }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BlueprintBuilding, StorageParameters, StorageType } from '@/blueprint/parser';
import BuildingIcon from './BuildingIcon.vue';
import { itemIconId } from '@/data/icons';

const { t } = useI18n();

const props = defineProps<{
    building: BlueprintBuilding,
}>();

const capacity = computed(() => {
    const itemId = props.building.itemId;
    return itemId === 2101 ? 30 : 60;
});
const p = computed(() => props.building.parameters as StorageParameters);
const capacityForAutomation = computed(() => {
    const limit = p.value.automationLimit;
    return capacity.value - limit;
});
</script>

<style lang="scss">
.storage-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    width: 100%;
    background: #FFFFFF40;

    &.capacity-30 {
        grid-template-rows: repeat(3, 1fr);
    }
    &.capacity-60 {
        grid-template-rows: repeat(6, 1fr);
    }

    .ban {
        background: #80000080;
    }
    .icon {
        display: block;
        width: 100%;
    }
}
</style>
