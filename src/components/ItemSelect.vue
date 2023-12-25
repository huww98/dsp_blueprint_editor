<template>
    <span @click="openModal = true" class="icon-select" ref="handler" tabindex="0" role="listbox">
        <BuildingIcon v-if="props.itemId !== null" :icon-id="itemIconId(props.itemId)" :alt="itemName(props.itemId)"/>
        <span class="icon icon-placeholder" v-else></span>
    </span>
    <Modal :open="openModal" @update:open="o => { if (!o) selected(null) }">
        <div>
            <div class="icon-tab" :class="{active: page === 1}" @click="page = 1">
                <img src="@/assets/icons/component-icon.png">
                {{ t('组件公式') }}
            </div>
            <div class="icon-tab" :class="{active: page === 2}" @click="page = 2">
                <img src="@/assets/icons/factory-icon.png">
                {{ t('建筑公式') }}
            </div>
        </div>
        <div class="icon-grid item">
            <BuildingIcon v-for="i of iconsLeft" :icon-id="itemIconId(i.id)" :key="i.id"
                :style="{gridRow: i.grid[1], gridColumn: i.grid[2]}"
                @click="selected(i)"/>
        </div>
        <div class="icon-grid item">
            <BuildingIcon v-for="i of iconsRight" :icon-id="itemIconId(i.id)" :key="i.id"
                :style="{gridRow: i.grid[1], gridColumn: i.grid[2] - 7}"
                @click="selected(i)"/>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Item } from '@/data';
import { items } from '@/data/itemsData';
import { itemIconId } from '@/data/icons';
import { itemName } from '@/i18n';
import Modal from "./ModalDSP.vue";
import BuildingIcon from './BuildingIcon.vue';

const { t } = useI18n();
const handler = ref<undefined | HTMLElement>(undefined);

const props = defineProps<{ itemId: number | null }>();
const emit = defineEmits<{(event: 'update:itemId', id: number | null): void}>();

const openModal = ref(false);
watch(openModal, o => { if (!o) handler.value!.focus() });

const page = ref<1 | 2>(1);
const icons = computed(() => items.filter(i => i.grid[0] === page.value));

const iconsLeft = computed(() => icons.value.filter(i => i.grid[2] <= 7));
const iconsRight = computed(() => icons.value.filter(i => i.grid[2] > 7));

const selected = (i: Item | null) => {
    openModal.value = false;
    emit('update:itemId', i ? i.id : null);
}
</script>

<style lang="scss">
// style shared with RecipeSelect
</style>
