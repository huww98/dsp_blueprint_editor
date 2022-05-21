<template>
    <teleport to="body">
        <div class="modal" :class="props.class" v-if="props.open">
            <div class="modal-background" @click="emit('update:open', false)"></div>
            <div class="modal-window">
                <slot></slot>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
    class?: string[] | string;
    open?: boolean;
}>();

const emit = defineEmits<{
    (event: 'update:open', value: boolean): void,
}>()
</script>

<style>
.modal {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: grid;
    place-items: center;
}

.modal-window {
    position: absolute;
    color: white;
    background: #000;
    border: #FFFA solid 1px;
    padding: 10px;
    max-height: 90vh;
    min-width: max(30vw, 180px);
    max-width: 90vw;
}
.modal-background {
    position: absolute;
    inset: 0;
    opacity: 0.7;
    background: black;
}
</style>
