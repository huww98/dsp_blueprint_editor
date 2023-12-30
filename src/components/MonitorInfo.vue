<template>
    <div class="building-params">
        <h3>{{t('监测设置')}}</h3>
        <div><label>{{t('监测周期')}}</label><span class="v">{{(p.periodTicksCount / 60).toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}{{ t('周期秒') }}</span></div>
        <div><label>{{t('目标流量')}}</label><span class="v">{{(p.targetCargoAmount / 10).toLocaleString([], { minimumFractionDigits: 1, maximumFractionDigits: 1 })}}{{ t('货物个') }}</span></div>
        <div class="r">
            <div class="p" style="margin-inline-end: auto;"><label>{{t('监测条件')}}</label><span class="v">{{operator}}</span></div>
            <div class="p"><span class="v"><ColorPreview :color-id="p.passColorId"/></span><label>{{t('满足')}}</label></div>
            <div class="p"><span class="v"><ColorPreview :color-id="p.failColorId"/></span><label>{{t('不满足')}}</label></div>
        </div>
        <div>
            <label>{{t('货物过滤')}}</label>
            <span class="v">
                <BuildingIcon v-if="p.cargoFilter > 0" :icon-id="itemIconId(p.cargoFilter)" />
                <span v-else>无</span>
            </span>
        </div>
        <div>
            <label>{{ t('流速器生成物品标题') }}</label>
            <span class="v">{{ genDesc }}</span>
        </div>
    </div>
    <div class="building-params">
        <h3>{{t('警报设置')}}</h3>
        <div><label>{{t('系统警报')}}</label><span class="v">{{systemWarningMode}}</span></div>
        <div v-if="p.systemWarningMode > 0">
            <label>{{t('警报图标')}}</label>
            <span class="v"><BuildingIcon :icon-id="p.systemWarningIconId" /></span>
        </div>
        <div><label>{{t('声音警报')}}</label><span class="v">{{alarmMode}}</span></div>
    </div>
    <div v-if="p.alarmMode > 0" class="building-params">
        <div><label>{{t('音色')}}</label><span class="v">{{tone}}</span></div>
        <div><label>{{t('衰减范围')}}</label><span class="v">{{p.falloffRadius[1]}}{{t('空格米')}}</span></div>
        <div><label>{{t('循环播放')}}</label><span class="v">{{truth(p.repeat)}}</span></div>
        <div><label>{{t('音高')}}</label><span class="v">{{pitch}}</span></div>
        <div><label>{{t('音量')}}</label><span class="v">{{p.volume}}</span></div>
        <div v-if="hasLength"><label>{{t('音频长度')}}</label><span class="v">{{p.length.toLocaleString([], { minimumFractionDigits: 1, maximumFractionDigits: 1 })}}{{ t('周期秒') }}</span></div>
    </div>
</template>

<script lang="ts">
const allOperators = ['=', '≠', '≥', '>', '≤', '<'];
const allPitchs = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { BlueprintBuilding, MonitorParameters, SpawnItemOperator } from '@/blueprint/parser';
import { itemIconId } from '@/data/icons';
import { midiMap } from '@/data/midi';
import { truth } from '@/utils';
import BuildingIcon from './BuildingIcon.vue';
import ColorPreview from './ColorPreview.vue';

const { t } = useI18n();

const allTones = new Map<number, string>([
    [20, t('警报-1')], [21, t('警报-2')], [22, t('警报-3')], [23, t('警报-4')], [24, t('警报-5')],
    [1, t('钢琴-1')], [2, t('钢琴-2')],
    [3, t('贝斯-1')], [4, t('贝斯-2')],
    [5, t('风琴-1')], [6, t('风琴-2')],
    [7, t('铺底-1')], [8, t('铺底-2')], [9, t('铺底-3')],
    [10, t('铜管乐')],
    [11, t('梦铃')],
    [12, t('玻璃乐器')],
    [13, t('吉他')],
    [14, t('音乐盒')],
    [15, t('电子琴')],
    [16, t('小号')],
    [17, t('小提琴')],
    [18, t('低音贝斯')],
    [19, t('鼓')],
]);
const allTriggerModes = [
    t('无'), t('未满足条件'), t('满足条件'), t('有货物响'), t('无货物响'), t('未满足且有货物'), t('未满足且无货物'),
];

const props = defineProps<{
    building: BlueprintBuilding,
}>();

const p = computed(() => props.building.parameters as MonitorParameters);
const tone = computed(() => allTones.get(p.value.tone)!);
const operator = computed(() => allOperators[p.value.passOperator]);
const systemWarningMode = computed(() => allTriggerModes[p.value.systemWarningMode]);
const alarmMode = computed(() => allTriggerModes[p.value.alarmMode]);
const pitch = computed(() => {
    const v = p.value.pitch - 1;
    return allPitchs[v % 12] + Math.floor(v / 12);
});
const hasLength = computed(() => !(midiMap.get(p.value.tone)!.isInstrument) || p.value.repeat);

const genDesc = computed(() => {
    switch (p.value.spawnItemOperator) {
        case SpawnItemOperator.NONE:
            return truth(false);
        case SpawnItemOperator.GENERATE:
            return t('流速器生成物品');
        case SpawnItemOperator.CONSUME:
            return t('流速器移除物品');
        default:
            return "??";
    }
})
</script>
