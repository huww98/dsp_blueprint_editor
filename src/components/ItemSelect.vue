<template>
    <span @click="openModal = true" class="icon-select">
        <BuildingIcon v-if="props.itemId !== null" :icon-id="itemIconId(props.itemId)" :alt="itemsMap.get(props.itemId)!.name"/>
        <span class="icon icon-placeholder" v-else></span>
    </span>
    <Modal :open="openModal" @update:open="o => { if (!o) selected(null) }">
        <div>
            <div class="icon-tab" :class="{active: page === 1}" @click="page = 1">
                <img src="@/assets/icons/component-icon.png">
                物品
            </div>
            <div class="icon-tab" :class="{active: page === 2}" @click="page = 2">
                <img src="@/assets/icons/factory-icon.png">
                建筑
            </div>
        </div>
        <div class="icon-grid">
            <BuildingIcon v-for="i of iconsLeft" :icon-id="itemIconId(i.id)" :key="i.id"
                :style="{gridRow: i.grid[1], gridColumn: i.grid[2]}"
                @click="selected(i)"/>
        </div>
        <div class="icon-grid">
            <BuildingIcon v-for="i of iconsRight" :icon-id="itemIconId(i.id)" :key="i.id"
                :style="{gridRow: i.grid[1], gridColumn: i.grid[2] - 6}"
                @click="selected(i)"/>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Item } from '@/data';
import { items } from '@/data/itemsData';
import { itemsMap } from '@/data/items';
import { itemIconId } from '@/data/icons';
import Modal from "./ModalDSP.vue";
import BuildingIcon from './BuildingIcon.vue';

const props = defineProps<{ itemId: number | null }>();
const emit = defineEmits<{(event: 'update:itemId', id: number | null): void}>();

const openModal = ref(false);
const page = ref<1 | 2>(1);
const icons = computed(() => items.filter(i => i.grid[0] === page.value));

const iconsLeft = computed(() => icons.value.filter(i => i.grid[2] <= 6));
const iconsRight = computed(() => icons.value.filter(i => i.grid[2] > 6));

const selected = (i: Item | null) => {
    openModal.value = false;
    emit('update:itemId', i ? i.id : null);
}
</script>

<style lang="scss">
// style shared with RecipeSelect
</style>
