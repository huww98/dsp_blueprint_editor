<template>
    <Teleport to="body">
        <dialog class="modal" ref="dialog" @close="onclose" @click="onclick">
            <div class="modal-window">
                <slot></slot>
            </div>
        </dialog>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const props = defineProps<{
    open?: boolean;
}>();

const dialog = ref<HTMLDialogElement | null>(null);

watchEffect(() => {
    if (props.open) {
        dialog.value?.showModal();
    } else {
        dialog.value?.close();
    }
});

const emit = defineEmits<{
    (event: 'update:open', value: boolean): void,
}>();

const onclose = () => {
    if (props.open)
        emit('update:open', false);
}

const onclick = (e: MouseEvent) => {
    // Enable clicking outside the dialog to close it
    if (e.target === dialog.value)
        emit('update:open', false);
}
</script>

<style>
.modal {
    padding: 0;
    border: #FFFA solid 1px;
}

.modal-window {
    color: white;
    background: black;
    padding: 10px;
    max-height: 90vh;
    min-width: max(30vw, 180px);
    max-width: 90vw;
}

.modal::backdrop {
    opacity: 0.7;
    background: black;
}
</style>
