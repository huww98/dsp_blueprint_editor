<template>
    <h2>{{ buildingItem.name }}<small>#{{ building.index }}</small></h2>
    <div v-if="buildingHeight != null" id="item-height">
        <div>
            <label for="item-height-input">高度</label>
            <div>
                <button @click="updateItemHeightStep(-1)">降低1</button>
                <button @click="updateItemHeightStep(-0.5)">降低0.5</button>
                <button @click="updateItemHeightStep(0.5)">升高0.5</button>
                <button @click="updateItemHeightStep(1)">升高1</button>
            </div>
        </div>
        <input id="item-height-input" :value="buildingHeight" @change="updateItemHeightManual" type="text"/>
    </div>
    <BuildingRecipe v-if="building.recipeId > 0" :recipeId="building.recipeId" />

    <SplitterInfo v-if="isSplitter(building.itemId)" :building="building" />
    <div v-else-if="filterItem">
        过滤器：<BuildingIcon :icon-id="itemIconId(filterItem.id)" :alt="filterItem.name" />{{ filterItem.name }}
    </div>
    <StationInfo v-if="isStation(building.itemId)" :building="building" @change="emit('change')" />
    <MonitorInfo v-if="isMonitor(building.itemId)" :building="building" />
    <div v-if="isLab(building.itemId)">
        矩阵研究站模式：{{ LabModeText }}
    </div>
    <div v-if="accModeText !== undefined">
        增产效果：{{ accModeText }}
    </div>
    <div v-if="beltParams">
        <BuildingIcon :icon-id="beltParams.iconId" />{{ beltParams.count }}
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
    <div class="building-params" v-if="isEjector(building.itemId)">
        <div><label>太阳帆送入轨道</label><span class="v">{{ejectorParams.orbitId === 0 ? '无' : ejectorParams.orbitId}}</span></div>
    </div>
    <div class="building-params" v-if="isEnergyExchanger(building.itemId)">
        <div><label>能量枢纽模式</label><span class="v">{{energyExchangerMode}}</span></div>
    </div>
    <div class="building-params" v-if="isRayReciver(building.itemId)">
        <div><label>射线接收站模式</label><span class="v">{{powerGenParams.productId > 0 ? '光子生成' : '直接发电'}}</span></div>
    </div>
</template>

<script lang="ts">
import { ResearchMode, AcceleratorMode, EnergyExchangerMode } from '@/blueprint/parser';

const labModeTexts = new Map([
    [ResearchMode.None, '未选择模式'],
    [ResearchMode.Compose, '矩阵合成'],
    [ResearchMode.Research, '科研模式'],
]);

const accModeTexts = new Map([
    [AcceleratorMode.ExtraOutput, '额外产出'],
    [AcceleratorMode.Accelerate, '生产加速'],
]);

const energyExchangerModeTexts = new Map([
    [EnergyExchangerMode.Discharge, '放电'],
    [EnergyExchangerMode.StandBy, '待机'],
    [EnergyExchangerMode.Charge, '充电'],
]);
</script>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue';

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

import BuildingRecipe from './BuildingRecipe.vue';
import BuildingIcon from './BuildingIcon.vue';
import StationInfo from './StationInfo.vue';
import MonitorInfo from './MonitorInfo.vue';
const SplitterInfo = defineAsyncComponent(() => import(/* webpackChunkName: "renderer" */'./SpitterInfo.vue'));

const props = defineProps<{
    building: BlueprintBuilding,
}>();
const emit = defineEmits<{
    (event: 'change'): void,
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

const beltParams = computed(() => {
    if (isBelt(props.building.itemId) && props.building.parameters)
        return props.building.parameters as BeltParameters;
    return null;
})

const inserterParams = computed(() => props.building.parameters as InserterParameters);
const storageParams = computed(() => props.building.parameters as StorageParameters);
const tankParams = computed(() => props.building.parameters as TankParameters);
const ejectorParams = computed(() => props.building.parameters as EjectorParameters);
const powerGenParams = computed(() => props.building.parameters as PowerGeneratorParameters);
const energyExchangerMode = computed(() => {
    const mode = (props.building.parameters as EnergyExchangerParameters).mode;
    return energyExchangerModeTexts.get(mode)!;
});

/**
 * 计算：建筑（当前为传送带）高度
 * TODO 此处需要考虑是否有必要四舍五入为一位小数以及锁定上下浮动精度为0.5
 *      Here we need consider whether it is necessary to `Math.round(x * 10) / 10` and set float step = 0.5
 * */
const buildingHeight = computed(() => {
    console.log(props?.building?.localOffset)
    return props?.building?.localOffset?.[0]?.z ?? null
})

/**
 * 手动指定高度
 * @param e update事件
 * */
function updateItemHeightManual(e: Event): void {
    updateItemHeight(Number((e.target as HTMLTextAreaElement).value))
}

/**
 * 固定提升或降低高度
 * @param offset 固定修改的高度值
 * */
function updateItemHeightStep(offset: number): void {
    updateItemHeight(buildingHeight.value + offset)
}

/**
 * 改变高度并重绘
 * TODO 需要根据游戏设定限制最大、最小高度
 *      Building height should follow dsp setting limit
 * */
function updateItemHeight(height: number): void {
    props.building.localOffset.forEach(offset => {
        offset.z = height
    })
    emit('change')
}

</script>

<style lang="scss">
.building-params {
    >div, .p {
        display: flex;
        flex-direction: row;
    }
    .r {
        gap: 10px;
    }
    .p {
        gap: 5px;
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

#item-height {
    > div {
        display: flex;
        justify-content: space-between;

        > div {
            display: inline;

            button {
                margin-left: 4px;
            }
        }
    }
}

</style>
