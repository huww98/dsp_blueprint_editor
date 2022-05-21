<template>
    <div class="recipe">
        <BuildingIcon v-for="i in recipe.to" :key="i.item.id" :icon-id="itemIconId(i.item.id)" :alt="i.item.name" :count="i.count"/>
        <img class="arrow" alt="produced from" src="@/assets/icons/arrow_left.svg"/>
        <BuildingIcon v-for="i in recipe.from" :key="i.item.id" :icon-id="itemIconId(i.item.id)" :alt="i.item.name" :count="i.count"/>
    </div>
</template>

<script lang="ts" setup>
import { recipesMap } from '@/data/recipes';
import { itemIconId } from '@/data/icons';
import { computed, defineProps } from 'vue';
import BuildingIcon from './BuildingIcon.vue';

const props = defineProps<{
    recipeId: number,
}>()

const recipe = computed(() => recipesMap.get(props.recipeId)!);
</script>

<style lang="scss">
.recipe {
    display: flex;
    flex-direction: row;
    align-items: center;

    .arrow {
        flex-shrink: 20;
        min-width: 10px;
        height: 24px;
        object-fit: cover;
    }
    .icon {
        flex-shrink: 1;
    }
}
</style>
