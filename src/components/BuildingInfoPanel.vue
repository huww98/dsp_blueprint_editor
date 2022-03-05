<template>
    <h2>{{ buildingItem.name }}<small>#{{ building.index }}</small></h2>
    <Recipe v-if="building.recipeId > 0" :recipeId="building.recipeId" />

    <SplitterInfo v-if="splitterInfo" :info="splitterInfo" :building="building" />
    <div v-else-if="filterItem">
        过滤器：<Icon :icon-id="itemIconId(filterItem.id)" :alt="filterItem.name" />{{ filterItem.name }}
    </div>
    <StationInfo v-if="isStation(building.itemId)" :building="building" />
    <div v-if="isLab(building.itemId)">
        矩阵研究站模式：{{ LabModeText }}
    </div>
    <div v-if="accModeText !== undefined">
        增产效果：{{ accModeText }}
    </div>
    <div v-if="beltParams">
        <Icon :icon-id="beltParams.iconId" />{{ beltParams.count }}
    </div>
    <div v-if="isInserter(building.itemId)">
        分拣长度：{{ inserterParams.length }}
    </div>
    <div class="building-params" v-if="isStorage(building.itemId)">
        <div><label>自动化容量限制</label><span class="v">{{storageParams.automationLimit}}</span></div>
    </div>
    <div class="tank-io" v-if="isTank(building.itemId)">
        <div :class="{opened: tankParams.output}">输出</div>
        <div :class="{opened: tankParams.input }">输入</div>
    </div>
</template>

<script lang="ts">
import { ResearchMode, AcceleratorMode, BlueprintBuilding, BeltParameters, InserterParameters, StorageParameters } from '@/blueprint/parser';

const labModeTexts = new Map([
    [ResearchMode.None, '未选择模式'],
    [ResearchMode.Compose, '矩阵合成'],
    [ResearchMode.Research, '科研模式'],
]);

const accModeTexts = new Map([
    [AcceleratorMode.ExtraOutput, '额外产出'],
    [AcceleratorMode.Accelerate, '生产加速'],
]);
</script>

<script lang="ts" setup>
import { computed, defineAsyncComponent, defineProps } from 'vue';

import { LabParamerters, AssembleParamerters, TankParameters } from '@/blueprint/parser';
import { BuildingInfo } from '@/blueprint/buildingInfo';
import { itemIconId } from '@/data/icons';
import { isLab, allAssemblers, isBelt, isStation, itemsMap, isInserter, isStorage, isTank } from '@/data/items';

import Recipe from './Recipe.vue';
import Icon from './Icon.vue';
import StationInfo from './StationInfo.vue';
const SplitterInfo = defineAsyncComponent(() => import(/* webpackChunkName: "renderer" */'./SpitterInfo.vue'));

const props = defineProps<{
    building: BlueprintBuilding,
    info: BuildingInfo,
}>();

const buildingItem = computed(() => {
    return itemsMap.get(props.building.itemId)!;
})
const filterItem = computed(() => {
    if (props.building.filterId <= 0)
        return null;
    return itemsMap.get(props.building.filterId)!;
})

const LabModeText = computed(() => {
    const mode = (props.building.parameters as LabParamerters).researchMode;
    return labModeTexts.get(mode)!;
})
const accModeText = computed(() => {
    const itemId = props.building.itemId
    if (isLab(itemId) && (props.building!.parameters as LabParamerters).researchMode === ResearchMode.Compose ||
        allAssemblers.has(itemId)) {
        const mode = (props.building!.parameters as AssembleParamerters).acceleratorMode;
        return accModeTexts.get(mode)!;
    }
    return undefined;
})

const splitterInfo = computed(() => {
    return props.info.splitterInfo.get(props.building.index)!
})

const beltParams = computed(() => {
    if (isBelt(props.building.itemId) && props.building.parameters)
        return props.building.parameters as BeltParameters;
    return null;
})

const inserterParams = computed(() => {
    return props.building.parameters as InserterParameters;
})
const storageParams = computed(() => {
    return props.building.parameters as StorageParameters;
})
const tankParams = computed(() => {
    return props.building.parameters as TankParameters;
})
</script>

<style lang="scss">
.building-params {
    >div {
        display: flex;
        flex-direction: row;
    }
    label {
        display: inline-block;
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

    div {
        flex: auto;
        width: 50px;
        padding: 2px 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        background: #B2B2B2;
        &::after {
            content: '关';
        }
        &.opened {
            background: #4A8BA8;
            &::after {
                content: '开';
            }
        }
    }
}
</style>
