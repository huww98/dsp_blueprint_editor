<template>
    <span class="color-preview" :style="{backgroundColor: cssColor}" :title="colorId.toString()"></span>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';
import { colorPalette256 } from '@/data/color';

const props = defineProps<{
    colorId: number;
}>();

const cssColor = computed(() => colorPalette256[props.colorId]);
</script>

<style lang="scss">
.color-preview {
    width: 1.5em;
    height: 1.5em;
    display: inline-block;
}
</style>
