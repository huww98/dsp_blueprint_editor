import { InjectionKey, Ref } from "vue";
// https://github.com/vuejs/vue-cli/issues/7010
// @ts-ignore
import BlueprintEditor from './components/BlueprintEditor.vue';

declare const VERSION: string;

export const version = VERSION;

export const rendererKey = Symbol() as InjectionKey<Ref<InstanceType<typeof BlueprintEditor>>>
