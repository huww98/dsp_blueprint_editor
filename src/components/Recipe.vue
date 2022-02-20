<template>
    <div class="recipe">
        <ItemRecipeIcon v-for="i in recipe.to" :key="i.item.id" :name="i.item.icon" :count="i.count"/>
        <span>⬅</span>
        <ItemRecipeIcon v-for="i in recipe.from" :key="i.item.id" :name="i.item.icon" :count="i.count"/>
    </div>
</template>

<script lang="ts" setup>
import { recipesMap } from '@/data';
import { computed, defineProps } from 'vue';
import ItemRecipeIcon from './ItemRecipeIcon.vue';

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
}
</style>
