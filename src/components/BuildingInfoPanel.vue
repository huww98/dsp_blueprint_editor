<template>
    <h2>{{ t(buildingItem.name) }} <small>#{{ building.index }}</small></h2>
    <BuildingRecipe v-if="building.recipeId > 0" :recipeId="building.recipeId" />

    <SplitterInfo v-if="isSplitter(building.itemId)" :building="building" />
    <StationInfo v-if="isStation(building.itemId)" :building="building" />
    <MonitorInfo v-if="isMonitor(building.itemId)" :building="building" />
    <div class="building-params">
        <div v-if="filterItem">
            <label>{{ t('过滤器') }}</label>
            <span class="v" style="align-self: center;"><BuildingIcon :icon-id="itemIconId(filterItem.id)" :alt="t(filterItem.name)" /></span>
        </div>
        <div v-if="isLab(building.itemId)">
            <label>{{ t('模式') }}</label>
            <span class="v">{{ LabModeText }}</span>
        </div>
        <div v-if="accModeText !== undefined">
            <label>{{ t('增产剂效果简') }}</label>
            <span class="v">{{ accModeText }}</span>
        </div>
        <div v-if="isInserter(building.itemId)">
            <label>{{ t('分拣长度') }}</label>
            <span class="v">{{ inserterParams.length }}</span>
        </div>
        <div v-if="isStorage(building.itemId)">
            <label>{{ t('自动化容量限制') }}</label>
            <span class="v">{{ capacityForAutomation }}</span>
        </div>
        <div v-if="isEjector(building.itemId)">
            <label>{{ t('送入轨道') }}</label>
            <span class="v">{{ ejectorParams.orbitId === 0 ? t('不选轨道') : ejectorParams.orbitId }}</span>
        </div>
        <div v-if="isEnergyExchanger(building.itemId)">
            <label>{{ t('模式') }}</label>
            <span class="v">{{ energyExchangerMode }}</span>
        </div>
        <div v-if="isRayReciver(building.itemId)">
            <label>{{ t('模式') }}</label>
            <span class="v">{{ powerGenParams.productId > 0 ? t('光子生成') : t('直接发电') }}</span>
        </div>
    </div>
    <div v-if="beltParams">
        <BuildingIcon :icon-id="beltParams.iconId" />{{ beltParams.count }}
    </div>
    <div class="tank-io" v-if="isTank(building.itemId)">
        <SwitchDSP :opened="tankParams.output">{{ t('储液罐输出') }}</SwitchDSP>
        <SwitchDSP :opened="tankParams.input">{{ t('储液罐输入') }}</SwitchDSP>
    </div>
</template>

<script lang="ts">
import { ResearchMode, AcceleratorMode, EnergyExchangerMode } from '@/blueprint/parser';

const labModeTexts = new Map([
    [ResearchMode.None, '选择模式'],
    [ResearchMode.Compose, '矩阵合成'],
    [ResearchMode.Research, '科研模式'],
]);

const accModeTexts = new Map([
    [AcceleratorMode.ExtraOutput, '额外产出'],
    [AcceleratorMode.Accelerate, '加速生产'],
]);

const energyExchangerModeTexts = new Map([
    [EnergyExchangerMode.Discharge, '放电'],
    [EnergyExchangerMode.StandBy, '待机'],
    [EnergyExchangerMode.Charge, '充电'],
]);
</script>

<script lang="ts" setup>
import { computed, defineAsyncComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
    LabParamerters, AssembleParamerters, TankParameters, BlueprintBuilding,
    BeltParameters, InserterParameters, StorageParameters, EjectorParameters,
    EnergyExchangerParameters, PowerGeneratorParameters,
} from '@/blueprint/parser';
import { itemIconId } from '@/data/icons';
import {
    isLab, allAssemblers, isBelt, isStation, itemsMap, isInserter, isStorage, isTank,
    isEjector, isEnergyExchanger, isRayReciver, isMonitor, isSplitter
} from '@/data/items';
import { commandQueueKey } from '@/define';

import BuildingRecipe from './BuildingRecipe.vue';
import BuildingIcon from './BuildingIcon.vue';
import StationInfo from './StationInfo.vue';
import MonitorInfo from './MonitorInfo.vue';
import SwitchDSP from './SwitchDSP.vue';
const SplitterInfo = defineAsyncComponent(() => import(/* webpackChunkName: "renderer" */'./SpitterInfo.vue'));

const { t } = useI18n();

const commandQueue = inject(commandQueueKey)!.value!;

const props = defineProps<{
    building: BlueprintBuilding,
}>();

const buildingItem = computed(() => {
    return itemsMap.get(props.building.itemId)!;
})
const filterVersion = ref(0);
const filterItem = computed(() => {
    filterVersion.value;
    if (props.building.filterId <= 0)
        return null;
    return itemsMap.get(props.building.filterId)!;
})
commandQueue.updater.updateSorterIcon.onMounted(b => {
    if (b === props.building)
        filterVersion.value++;
});

const LabModeText = computed(() => {
    const mode = (props.building.parameters as LabParamerters).researchMode;
    return t(labModeTexts.get(mode)!);
})
const accModeText = computed(() => {
    const itemId = props.building.itemId
    if (isLab(itemId) && (props.building!.parameters as LabParamerters).researchMode === ResearchMode.Compose ||
        allAssemblers.has(itemId)) {
        const mode = (props.building!.parameters as AssembleParamerters).acceleratorMode;
        return t(accModeTexts.get(mode)!);
    }
    return undefined;
})

const beltVersion = ref(0);
const beltParams = computed(() => {
    beltVersion.value;
    if (isBelt(props.building.itemId) && props.building.parameters)
        return props.building.parameters as BeltParameters;
    return null;
});
commandQueue.updater.updateBeltIcon.onMounted(b => {
    if (b === props.building)
        beltVersion.value++;
});

const inserterParams = computed(() => props.building.parameters as InserterParameters);
const tankParams = computed(() => props.building.parameters as TankParameters);
const ejectorParams = computed(() => props.building.parameters as EjectorParameters);
const powerGenParams = computed(() => props.building.parameters as PowerGeneratorParameters);
const energyExchangerMode = computed(() => {
    const mode = (props.building.parameters as EnergyExchangerParameters).mode;
    return t(energyExchangerModeTexts.get(mode)!);
});
const capacityForAutomation = computed(() => {
    const itemId = props.building.itemId;
    const capacity = itemId === 2101 ? 30 : 60;
    const limit = (props.building.parameters as StorageParameters).automationLimit;
    return capacity - limit;
});
</script>

<style lang="scss">
.building-params {
    margin-bottom: 20px;
    h3 {
        margin-bottom: 0;
    }

    >div, .p {
        display: flex;
        flex-direction: row;
        margin-top: 4px;
    }
    .r {
        gap: 10px;
    }
    .p {
        gap: 5px;
    }
    label {
        display: inline-block;
        font-weight: bold;
    }
    .v {
        display: inline-block;
        text-align: right;
        flex: auto;
    }
}

.tank-io {
    display: flex;
    flex-direction: row;
    gap: 6px;

    .switch {
        flex: 1 50px;
    }
}
</style>

<i18n>
{
    "zh": {
        "模式": "模式",
        "送入轨道": "送入轨道"
    },
    "en": {
        "模式": "Mode",
        "送入轨道": "Orbit"
    },
    "fr": {
        "模式": "Mode",
        "送入轨道": "Orbit"
    }
}
</i18n>
