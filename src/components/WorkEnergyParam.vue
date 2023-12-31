<template>
    <div>
        <label>{{t('最大充能功率')}}</label>
        <span class="v">{{(props.perTick * 60 / 1_000_000).toLocaleString([], { minimumSignificantDigits: 3, maximumSignificantDigits: 3 })}} MW</span>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    perTick: number,
}>();

const { t } = useI18n();
</script>
