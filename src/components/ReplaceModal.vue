<template>
    <Modal v-model:open="open">
        <h2>批量替换</h2>
        <div>搜索：<RecipeSelect v-model:recipeId="r.searchRecipe"/></div>
        <div>替换：<RecipeSelect v-model:recipeId="r.replaceRecipe"/></div>
        <div>
            范围：
            <span class="replace-scope">
                <input type="checkbox" id="replace-recipe" v-model="r.scope.recipe"><label for="replace-recipe">配方</label>
            </span>
            <span class="replace-scope">
                <input type="checkbox" id="replace-filter" v-model="r.scope.filter"><label for="replace-filter">分拣器筛选</label>
            </span>
            <span class="replace-scope">
                <input type="checkbox" id="replace-station" v-model="r.scope.station"><label for="replace-station">物流塔栏位</label>
            </span>
            <span class="replace-scope">
                <input type="checkbox" id="replace-band-icon" v-model="r.scope.beltIcon"><label for="replace-band-icon">传送带图标</label>
            </span>
            <span class="replace-scope">
                <input type="checkbox" id="replace-bp-icon" v-model="r.scope.blueprintIcon"><label for="replace-bp-icon">蓝图图标</label>
            </span>
        </div>
        <div>
            <button @click="executeReplace" :disabled="!canReplace">全部替换</button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { replace, ReplaceParams } from "@/blueprint/replace";
import { BlueprintData } from "@/blueprint/parser";
import Modal from "./ModalDSP.vue";
import RecipeSelect from "./RecipeSelect.vue";

const open = ref(false);

defineExpose({
    open: () => open.value = true,
})

const r = reactive({
    searchRecipe: null as null | number,
    replaceRecipe: null as null | number,
    scope: {
        recipe: true,
        filter: true,
        station: true,
        beltIcon: true,
        blueprintIcon: true,
    },
});

const props = defineProps<{blueprint: BlueprintData}>()

const emit = defineEmits<{
    (event: 'change'): void,
}>();

const canReplace = computed(() => {
    return r.searchRecipe !== null && r.replaceRecipe !== null && Object.values(r.scope).some(s => s);
})

const executeReplace = () => {
    if (!canReplace.value)
        return;
    if (replace(props.blueprint, r as ReplaceParams))
        emit("change")
    open.value = false;
}
</script>

<style lang="scss">
.replace-scope {
    display: inline-block;
    margin-left: 10px;

    @media screen and (max-width: 360px) {
        display: block;
    }
}
</style>
