<template>
    <template v-for="(s, i) in p.storage" :key="i">
        <div class="station-storage">
            <ItemSelect :item-id="s.itemId > 0 ? s.itemId : null"
                @update:item-id="itemId => setItemId(i, itemId)"/>
            <template v-if="s.itemId > 0">
                <div class="num">
                    <div><label>{{ t('当前货物数') }}</label> {{s.keepMode > 0 ? s.max/s.keepMode : 0}}</div>
                    <div><label>{{ t('货物上限') }}</label> {{s.max}}</div>
                </div>
                <div>
                    <div class="role" :class="roleClass.get(s.localLogic)">{{ t('本地' + roleText.get(s.localLogic)) }}</div>
                    <div v-if="inter" class="role" :class="roleClass.get(s.remoteLogic)">{{ t('星际' + roleText.get(s.remoteLogic)) }}</div>
                </div>
            </template>
            <div class="placeholder" v-else>{{ t('空栏位') }}</div>
        </div>
    </template>
    <div class="building-params" v-if="!collector">
        <h3>{{ t('自动补充提示') }}</h3>
        <div><label>{{ t('物流运输机') }}</label><span class="v">{{ truth(p.droneAutoReplenish) }}</span></div>
        <div v-if="inter"><label>{{ t('星际物流运输船') }}</label><span class="v">{{ truth(p.shipAutoReplenish) }}</span></div>
    </div>
    <div class="building-params">
        <WorkEnergyParam v-if="!collector" :per-tick="p.workEnergyPerTick"/>
        <div v-if="!collector"><label>{{t('运输机最远路程')}}</label><span class="v">{{(Math.acos(p.tripRangeOfDrones) / Math.PI * 180.0).toLocaleString([], { maximumFractionDigits: 0 })}}°</span></div>
        <div v-if="inter"><label>{{t('运输船最远路程')}}</label><span class="v">{{tripRangeOfShips}}</span></div>
        <div v-if="inter"><label>{{t('轨道采集器')}}</label><span class="v">{{truth(p.includeOrbitCollector)}}</span></div>
        <div v-if="inter"><label>{{t('曲速启用路程')}}</label><span class="v">{{p.warpEnableDistance / 40000}} AU</span></div>
        <div v-if="inter"><label>{{t('翘曲器必要性')}}</label><span class="v">{{truth(p.warperNecessary)}}</span></div>
        <div v-if="!collector"><label>{{t('运输机起送量')}}</label><span class="v">{{p.deliveryAmountOfDrones}}%</span></div>
        <div v-if="inter"><label>{{t('运输船起送量')}}</label><span class="v">{{p.deliveryAmountOfShips}}%</span></div>
        <div v-if="collector"><label>{{t('采集速度')}}</label><span class="v">{{(pc.miningSpeed / 100).toLocaleString([], { maximumFractionDigits: 0 })}}%</span></div>
        <div><label>{{t('货物集装数量')}}</label><span class="v">{{p.pilerCount === 0 ? t('集装使用科技上限') : p.pilerCount}}</span></div>
    </div>
</template>

<script lang="ts">
import { LogisticRole, BlueprintBuilding, StationParameters, BlueprintData } from '@/blueprint/parser';
import { Command, Updater } from '@/command';
import { BuildingInfo } from '@/blueprint/buildingInfo';
import { itemIconId } from '@/data/icons';
import WorkEnergyParam from './WorkEnergyParam.vue';

const roleText = new Map([
    [LogisticRole.None, '仓储'],
    [LogisticRole.Demand, '需求'],
    [LogisticRole.Supply, '供应'],
])

const roleClass = new Map([
    [LogisticRole.None, 'role-none'],
    [LogisticRole.Demand, 'role-demand'],
    [LogisticRole.Supply, 'role-supply'],
])

class SetStationStorageItemCommand implements Command {
    public readonly previousItemId;
    public readonly belts: BlueprintBuilding[];

    constructor(
        public readonly building: BlueprintBuilding,
        buildingInfo: BuildingInfo,
        public readonly storageIndex: number,
        public readonly newItemId: number,
    ) {
        const p = building.parameters as StationParameters;
        const s = p.storage[storageIndex];
        this.previousItemId = s.itemId;

        this.belts = [];
        const adj = buildingInfo.adjacency[this.building.index];
        for (let i = 0; i < p.slots.length; i++) {
            if (p.slots[i].storageIdx - 1 === storageIndex) {
                const belt = adj[i];
                if (belt) {
                    this.belts.push(belt);
                }
            }
        }
    }
    private setItemId(itemId: number, updater: Updater) {
        const p = this.building.parameters as StationParameters;
        const s = p.storage[this.storageIndex];

        s.itemId = itemId;
        updater.updateStationInfo.dispatch(this.building);
        for (const belt of this.belts) {
            if (itemId === null)
                belt.parameters = null;
            else
                belt.parameters = { iconId: itemIconId(itemId), count: 0 };
            updater.updateBeltIcon.dispatch(belt);
        }
    }
    do(data: BlueprintData, updater: Updater): void {
        this.setItemId(this.newItemId, updater);
    }
    undo(data: BlueprintData, updater: Updater): void {
        this.setItemId(this.previousItemId, updater);
    }
    merge() { return false; }
}
</script>

<script lang="ts" setup>
import { computed, inject, triggerRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { truth } from '@/utils';
import { AdvancedMiningMachineParameters } from '@/blueprint/parser';
import { isAdvancedMiningMachine, isInterstellarStation } from '@/data/items';
import { buildingInfoKey, commandQueueKey } from '@/define';
import ItemSelect from './ItemSelect.vue';

const { t } = useI18n();

const props = defineProps<{
    building: BlueprintBuilding,
}>();

const p = computed(() => props.building.parameters as StationParameters);
const pc = computed(() => props.building.parameters as AdvancedMiningMachineParameters);

const buildingInfo = inject(buildingInfoKey)!.value!;
const commandQueue = inject(commandQueueKey)!.value!;

commandQueue.updater.updateStationInfo.onMounted(b => {
    if (b === props.building)
        triggerRef(p);
});

const setItemId = (storageIndex: number, itemId: number | null) => {
    const s = p.value.storage[storageIndex];
    const newItemId = itemId === null ? 0 : itemId;
    if (s.itemId === newItemId)
        return;

    commandQueue.push(new SetStationStorageItemCommand(props.building, buildingInfo, storageIndex, newItemId));
}

const tripRangeOfShips = computed(() => {
    const ly = p.value.tripRangeOfShips / 2400000.0;
    if (ly > 9999.0)
        return '∞';
    else
        return ly.toLocaleString([], { maximumFractionDigits: 0 }) + ' ly';
})

const inter = computed(() => isInterstellarStation(props.building.itemId));
const collector = computed(() => isAdvancedMiningMachine(props.building.itemId));
</script>

<style lang="scss">
.station-storage {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 10px 0;
    gap: 10px;

    .num {
        flex: auto;
        >div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    }

    .role {
        padding: 2px 2px;
        margin: 2px 0;
        font-size: 0.8em;
        text-align: center;
        min-width: 8em;
    }
    .role-none {
        background: #B2B2B2;
    }
    .role-demand {
        background: #D98A59;
    }
    .role-supply {
        background: #4A8BA8;
    }

    .icon-placeholder {
        border-radius: 50%;
        background: #e4e4e4;
    }
    .placeholder {
        opacity: 0.3;
        font-size: 1.8em;
        text-align: center;
        flex: auto;
    }

}
</style>
