<template>
    <div class="icon">
        <img :src="src" :alt="props.alt">
        <div class="count">{{props.count === undefined || props.count === 1 ? '' : props.count}}</div>
    </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watchEffect } from 'vue';
import { iconUrl } from '@/data/icons';

const props = defineProps<{
    iconId: number,
    alt?: string,
    count?: number,
}>();

const src = ref('');
watchEffect(async () => {
    src.value = '';
    src.value = await iconUrl(props.iconId);
});
</script>

<style lang="scss">
.icon {
    display: inline-block;
    position: relative;
    height: 2.5rem;
    width: 2.5rem;

    img {
        height: 100%;
        width: 100%;
    }

    .count {
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 0.8em;
    }
}
</style>
