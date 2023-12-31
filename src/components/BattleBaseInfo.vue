<template>
    <div class="building-params">
        <div>
            <label>{{ t('基站自动拾取提示标题') }}</label>
            <span class="v">{{ truth(p.autoPickEnabled) }}</span>
        </div>
        <div>
            <label>{{ t('基站自动重建提示标题') }}</label>
            <span class="v">{{ truth(p.autoReconstruct) }}</span>
        </div>
        <div>
            <label>{{ t('基站建设无人机提示标题') }}</label>
            <span class="v">{{ p.constructionDroneEnabled ? constructionPriority : truth(false) }}</span>
        </div>
        <div>
            <label>{{ t('基站战斗机提示标题') }}</label>
            <span class="v">{{ truth(p.combatEnabled) }}</span>
        </div>
        <div>
            <div class="fleet-grid">
                <BuildingIcon v-for="(f, i) in p.fighters" :key="i" :icon-id="itemIconId(f.itemId)" />
            </div>
        </div>
        <div>
            <label>{{ t('基站自动补充编队提示标题') }}</label>
            <span class="v">{{ truth(p.autoReplenishFleet) }}</span>
        </div>
        <WorkEnergyParam :per-tick="p.workEnergyPerTick"/>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BattleBaseParameters, BlueprintBuilding, BattleBaseDroneConstructPriority } from '@/blueprint/parser';
import BuildingIcon from './BuildingIcon.vue';
import WorkEnergyParam from './WorkEnergyParam.vue';
import { itemIconId } from '@/data/icons';
import { truth } from '@/utils';

const { t } = useI18n();

const props = defineProps<{
    building: BlueprintBuilding,
}>();

const p = computed(() => props.building.parameters as BattleBaseParameters);

const constructionPriority = computed(() => {
    switch (p.value.droneConstructPriority) {
        case BattleBaseDroneConstructPriority.REPARE:
            return t('建设机优先修理标题');
        case BattleBaseDroneConstructPriority.BALANCE:
            return t('建设机均衡模式标题');
        case BattleBaseDroneConstructPriority.CONSTRUCT:
            return t('建设机优先建造标题');
        default:
            return '??';
    }
});
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
