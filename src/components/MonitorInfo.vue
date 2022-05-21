<template>
    <section>
        <h3>监测设置</h3>
        <div class="building-params">
            <div><label>监测周期</label><span class="v">{{(p.periodTicksCount / 60).toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}} 秒</span></div>
            <div><label>目标流量</label><span class="v">{{(p.targetCargoAmount / 10).toLocaleString([], { minimumFractionDigits: 1, maximumFractionDigits: 1 })}} 个</span></div>
            <div class="r">
                <div class="p" style="margin-inline-end: auto;"><label>监测条件</label><span class="v">{{operator}}</span></div>
                <div class="p"><span class="v"><ColorPreview :color-id="p.passColorId"/></span><label>满足</label></div>
                <div class="p"><span class="v"><ColorPreview :color-id="p.failColorId"/></span><label>不满足</label></div>
            </div>
            <div>
                <label>货物过滤</label>
                <span class="v">
                    <BuildingIcon v-if="p.cargoFilter > 0" :icon-id="itemIconId(p.cargoFilter)" />
                    <span v-else>无</span>
                </span>
            </div>
        </div>
    </section>
    <section>
        <h3>警报设置</h3>
        <div class="building-params">
            <div><label>系统警报</label><span class="v">{{systemWarningMode}}</span></div>
            <div v-if="p.systemWarningMode > 0">
                <label>警报图标</label>
                <span class="v"><BuildingIcon :icon-id="p.systemWarningIconId" /></span>
            </div>
            <div><label>声音警报</label><span class="v">{{alarmMode}}</span></div>
        </div>
    </section>
    <section v-if="p.alarmMode > 0">
        <div class="building-params">
            <div><label>音色</label><span class="v">{{tone}}</span></div>
            <div><label>范围</label><span class="v">{{p.falloffRadius[1]}} 米</span></div>
            <div><label>循环</label><span class="v">{{truth(p.repeat)}}</span></div>
            <div><label>音阶</label><span class="v">{{pitch}}</span></div>
            <div><label>音量</label><span class="v">{{p.volume}}</span></div>
            <div v-if="hasLength"><label>时长</label><span class="v">{{p.length.toLocaleString([], { minimumFractionDigits: 1, maximumFractionDigits: 1 })}} 秒</span></div>
        </div>
    </section>
</template>

<script lang="ts">
const allTones = new Map<number, string>([
    [20, '报警1'], [21, '报警2'], [22, '报警3'], [23, '报警4'], [24, '报警5'],
    [1, '钢琴1'], [2, '钢琴2'],
    [3, '贝斯1'], [4, '贝斯2'],
    [5, '风琴1'], [6, '风琴2'],
    [7, '铺底1'], [8, '铺底2'], [9, '铺底3'],
    [10, '铜管乐'],
    [11, '梦铃'],
    [12, '玻璃'],
    [13, '吉他'],
    [14, '音乐盒'],
    [15, '电子琴'],
    [16, '小号'],
    [17, '小提琴'],
    [18, '低音贝司'],
    [19, '鼓'],
]);
const allTriggerModes = [
    '无', '未满足条件', '满足条件', '有货物响', '无货物响', '未满足且有货物', '未满足且无货物',
];
const allOperators = ['=', '≠', '≥', '>', '≤', '<'];
const allPitchs = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { BlueprintBuilding, MonitorParameters } from '@/blueprint/parser';
import { itemIconId } from '@/data/icons';
import { midiMap } from '@/data/midi';
import BuildingIcon from './BuildingIcon.vue';
import ColorPreview from './ColorPreview.vue';

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

const truth = (v: boolean) => v ? '✓' : '✗';
</script>
