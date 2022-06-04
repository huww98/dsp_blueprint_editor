<template>
    <div v-if="isSinglePosition">
        <div v-if="props.position[0] != null">
            <div class="label-button-group">
                <label for="building-x-input">X</label>
                <div>
                    <button @click="updateBuildingStep('x', -1)">-1</button>
                    <button @click="updateBuildingStep('x', 1)">+1</button>
                </div>
            </div>
            <input id="building-x-input" :value="props.position[0].x" @change="e => updatePositionManual('x', e)"
                   type="text"/>
            <div class="label-button-group">
                <label for="building-y-input">Y</label>
                <div>
                    <button @click="updateBuildingStep('y', -1)">-1</button>
                    <button @click="updateBuildingStep('y', 1)">+1</button>
                </div>
            </div>
            <input id="building-y-input" :value="props.position[0].y" @change="e => updatePositionManual('y', e)"
                   type="text"/>
            <div class="label-button-group">
                <label for="building-z-input">高度</label>
                <div>
                    <button @click="updateBuildingStep('z', -1)">降低1</button>
                    <button @click="updateBuildingStep('z', -0.5)">降低0.5</button>
                    <button @click="updateBuildingStep('z', 0.5)">升高0.5</button>
                    <button @click="updateBuildingStep('z', 1)">升高1</button>
                </div>
            </div>
            <input id="building-z-input" :value="props.position[0].z" @change="e => updatePositionManual('z', e)"
                   type="text"/>
        </div>
    </div>
</template>
<script lang="ts" setup>

import { XYZ } from '@/blueprint/parser'
import { computed } from 'vue'

const props = defineProps<{
    position: [XYZ, XYZ],
}>()

const emit = defineEmits<{
    (event: 'change'): void,
}>()

const isSinglePosition = computed(() => {
    const threshold = 0.0001
    return Math.abs(props.position[0].x - props.position[1].x) < threshold &&
        Math.abs(props.position[0].y - props.position[1].y) < threshold &&
        Math.abs(props.position[0].z - props.position[1].z) < threshold
})

/**
 * 手动指定
 * @param key xyz
 * @param e update事件
 * */
function updatePositionManual(key: keyof XYZ, e: Event): void {
    updatePosition(key, Number((e.target as HTMLTextAreaElement).value))
}

/**
 * 固定修改xyz数值
 * @param key xyz
 * @param offset 固定修改的xyz数值
 * */
function updateBuildingStep(key: keyof XYZ, offset: number): void {
    updatePosition(key, props.position[0][key] + offset)
}

/**
 * 改变xyz属性值并重绘
 * TODO 需要根据游戏设定限制最大、最小xyz
 *      Building xyz should follow dsp setting limit
 * */
function updatePosition(key: keyof XYZ, value: number): void {
    props.position.forEach(offset => {
        offset[key] = value
    })
    emit('change')
}
</script>
<style lang="scss" scoped>
.label-button-group {
    display: flex;
    justify-content: space-between;

    > div {
        display: inline;

        button {
            margin-left: 4px;
        }
    }
}
</style>
