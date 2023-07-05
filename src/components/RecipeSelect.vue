<template>
    <span @click="openModal = true" class="icon-select" ref="handler" tabindex="0" role="listbox">
        <BuildingIcon v-if="props.recipeId !== null" :icon-id="recipeIconId(props.recipeId)" :alt="recipeName(props.recipeId)"/>
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
            <BuildingIcon v-for="i of iconsLeft" :icon-id="recipeIconId(i.id)" :key="i.id"
                :style="{gridRow: i.grid[1], gridColumn: i.grid[2]}"
                @click="selected(i)"/>
        </div>
        <div class="icon-grid">
            <BuildingIcon v-for="i of iconsRight" :icon-id="recipeIconId(i.id)" :key="i.id"
                :style="{gridRow: i.grid[1], gridColumn: i.grid[2] - 6}"
                @click="selected(i)"/>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Recipe } from '@/data';
import { recipes } from '@/data/recipesData';
import { recipeIconId } from '@/data/icons';
import { recipeName } from '@/i18n';
import Modal from "./ModalDSP.vue";
import BuildingIcon from './BuildingIcon.vue';

const handler = ref<undefined | HTMLElement>(undefined);

const props = defineProps<{ recipeId: number | null }>();
const emit = defineEmits<{(event: 'update:recipeId', id: number | null): void}>();

const openModal = ref(false);
watch(openModal, o => { if (!o) handler.value!.focus() });

const page = ref<1 | 2>(1);
const icons = computed(() => recipes.filter(r => r.grid[0] === page.value));

const iconsLeft = computed(() => icons.value.filter(r => r.grid[2] <= 6));
const iconsRight = computed(() => icons.value.filter(r => r.grid[2] > 6));

const selected = (i: Recipe | null) => {
    openModal.value = false;
    emit('update:recipeId', i ? i.id : null);
}
</script>

<style lang="scss">
.icon-select {
    cursor: pointer;
}

.icon-placeholder {
    border: 1px dashed currentColor;
    background: #FFF4;
}

.icon-grid {
    display: inline-grid;
    @media screen and (max-width: 640px) {
        display: grid;
    }
    grid-template: repeat(7, 1fr) / repeat(6, 1fr);
    --cell-size: 40px;
    height: calc(7 * var(--cell-size));
    width: calc(6 * var(--cell-size));

    .icon {
        width: var(--cell-size);
        height: var(--cell-size);
    }
}

.icon-tab {
    display: inline-block;
    text-align: center;
    opacity: 0.6;

    &.active {
        opacity: 1.0;
    }

    img {
        width: 60px;
        height: 60px;
        display: block;
    }
}
</style>
