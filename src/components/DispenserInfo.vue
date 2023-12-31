<template>
    <div class="building-params">
        <div>
            <label>{{ playerModeLabel }}</label>
            <span class="v">{{ truth(p.playerMode !== DispenserPlayerMode.NONE) }}</span>
        </div>
        <div v-if="p.playerMode === DispenserPlayerMode.RECYCLE">
            <label>{{ t('不限回收类型') }}</label>
            <span class="v">{{ truth(props.building.filterId < 0) }}</span>
        </div>
        <div>
            <label>{{ storageModeLabel }}</label>
            <span class="v">{{ truth(p.storageMode !== DispenserStorageMode.NONE) }}</span>
        </div>
        <div>
            <label>{{ t('自动补充提示') }}</label>
            <span class="v">{{ truth(p.courierAutoReplenish) }}</span>
        </div>
        <WorkEnergyParam :per-tick="p.workEnergyPerTick"/>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BlueprintBuilding, DispenserParameters, DispenserPlayerMode, DispenserStorageMode } from '@/blueprint/parser';
import { truth } from '@/utils';
import WorkEnergyParam from './WorkEnergyParam.vue';

const { t } = useI18n();

const props = defineProps<{
    building: BlueprintBuilding,
}>();

const p = computed(() => props.building.parameters as DispenserParameters);

const playerModeLabel = computed(() => {
    switch (p.value.playerMode) {
        case DispenserPlayerMode.NONE:
            return t('向玩家配送模式0');
        case DispenserPlayerMode.SUPPLY:
            return t('向玩家配送模式1');
        case DispenserPlayerMode.RECYCLE:
            return t('向玩家配送模式2');
        case DispenserPlayerMode.BOTH:
            return t('向玩家配送模式3');
        default:
            return '??';
    }
})

const storageModeLabel = computed(() => {
    switch (p.value.storageMode) {
        case DispenserStorageMode.NONE:
            return t('向箱子配送模式0');
        case DispenserStorageMode.SUPPLY:
            return t('向箱子配送模式1');
        case DispenserStorageMode.DEMAND:
            return t('向箱子配送模式2');
        default:
            return '??';
    }
})
</script>

<style lang="scss">
.fleet-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 2px;
    grid-auto-flow: column;

    .icon {
        display: block;
        padding: 2px;
        background: #FFFFFF40;
    }
}
</style>
