<template>
  <div class="container">
    <BlueprintEditor ref="renderer" :blueprintData="data" v-model:selectedBuildingIndex="selectedBuildingIndex"
                     @update:selectedBuildingIndex="i => expandSidebar = i !== null" />
    <div class="sidebar" :class="{ expanded: expandSidebar }">
      <section>
        <label for="shortDesc">缩略图文字</label>
        <input type="text" id="shortDesc" :disabled="!data"
               :value="data?.header.shortDesc" @input="e => data!.header.shortDesc = (e.target as HTMLInputElement).value">
      </section>
      <section>
        <label for="desc">蓝图介绍</label>
        <textarea rows="2" id="desc" :disabled="!data"
                  :value="data?.header.desc" @input="e => data!.header.desc = (e.target as HTMLInputElement).value"></textarea>
      </section>
      <section>
        <div class="row">
          <label for="bp-str" style="margin-right: auto;">代码</label>
          <span class="error" v-if="notSupport">不支持，请手动复制</span>
          <button style="margin: 0 2px;" @click="copy" :disabled="working || !bpStr">复制</button>
          <button style="margin: 0 2px;" @click="paste" :disabled="working">粘贴</button>
        </div>
        <textarea rows="3" id="bp-str" @copy="onCopy" @cut="onCut" @paste="onPaste" @focus="encodeBp"
                  v-model="bpStrInput" @change="e => parseBp((e.target as HTMLTextAreaElement).value)"></textarea>
        <button @click="parseBp('')" style="width: 100%; position: relative;" :disabled="working">
          {{bpStr ? "清空" : "选择文件"}}
          <input v-if="!bpStr" @change="onBpFile" :disabled="working"
                 type="file" id="blueprint-file" style="position: absolute; inset: 0; opacity: 0;" accept="text/plain">
        </button>
        <div class="error">{{parseErrorMessage}}</div>
      </section>
      <section>
        <div class="row">
          <span style="margin-right: auto;">创建版本号</span><span>{{data?.header.gameVersion}}</span>
        </div>
        <div class="row">
        <span style="margin-right: auto;">创建时间</span><span>{{data?.header.time.toLocaleString([], { timeZone: 'UTC' })}}</span>
        </div>
      </section>
      <section v-if="selectedBuilding !== null">
        <h2>{{selectedBuildingItem!.name}} <small>#{{selectedBuilding.index}}</small></h2>
        <Recipe v-if="selectedBuilding.recipeId > 0" :recipeId="selectedBuilding.recipeId"/>

        <SplitterInfo v-if="splitterInfo !== undefined && renderer"
                      :info="splitterInfo" :building="selectedBuilding"
                      :model="renderer.getModel(selectedBuilding.index)!"
                      :camera="renderer.camera" :cameraPosVersion="renderer.cameraPosVersion"/>
        <div v-else-if="selectedBuilding.filterId">
          过滤器：<ItemRecipeIcon :name="selectedBuildingFilterItem!.icon" />{{selectedBuildingFilterItem!.name}}
        </div>
        <StationInfo v-if="isStation(selectedBuilding.itemId)"
                     :building="selectedBuilding"/>
        <div v-if="isLab(selectedBuilding.itemId)">
          矩阵研究站模式：{{LabModeText}}
        </div>
        <div v-if="accModeText !== undefined">
          增产效果：{{accModeText}}
        </div>
      </section>
      <footer>
        {{version}} <SWStatus/>
      </footer>
    </div>
    <button class="expand-btn" :class="{ expanded: expandSidebar }" @click="expandSidebar = !expandSidebar"></button>
  </div>
</template>

<script setup lang="ts">
import { BlueprintData, fromStr, LabParamerters, AssembleParamerters, AcceleratorMode, ResearchMode, toStr } from './blueprint/parser';
import { computed, defineAsyncComponent, reactive, ref, shallowReactive, shallowRef, watch, watchEffect } from 'vue';
import { itemsMap, isStation, isLab, allAssemblers } from './data/items';
import { version } from '@/define';
import { BuildingInfo } from './blueprint/buildingInfo';

import SWStatus from '@/swStatus.vue';
import Recipe from '@/components/Recipe.vue';
import ItemRecipeIcon from '@/components/ItemRecipeIcon.vue';
import StationInfo from './components/StationInfo.vue';

const SplitterInfo = defineAsyncComponent(() => import(/* webpackChunkName: "renderer" */'./components/SpitterInfo.vue'))
const BlueprintEditor = defineAsyncComponent(() => import(/* webpackChunkName: "renderer" */'./components/BlueprintEditor.vue'));

const renderer = ref<null | InstanceType<typeof BlueprintEditor>>(null)

const bpStr = ref('');
const data = shallowRef(null as BlueprintData | null);
const expandSidebar = ref(true);
const working = ref(false);
const notSupport = ref(false);
const codeExpired = ref(false);
const parseErrorMessage = ref('');
const selectedBuildingIndex = ref(null as number | null);

const selectedBuilding = computed(() => {
  if (data.value === null || selectedBuildingIndex.value === null)
    return null;
  return data.value.buildings[selectedBuildingIndex.value];
})
const selectedBuildingItem = computed(() => {
  if (selectedBuilding.value === null)
    return null;
  return itemsMap.get(selectedBuilding.value.itemId)!;
})
const selectedBuildingFilterItem = computed(() => {
  if (selectedBuilding.value === null || selectedBuilding.value.filterId <= 0)
    return null;
  return itemsMap.get(selectedBuilding.value.filterId)!;
})
const buildingInfo = computed(() => {
  if (data.value === null)
    return null;
  return new BuildingInfo(data.value.buildings);
})
const splitterInfo = computed(() => {
  if (selectedBuilding.value === null)
    return undefined;
  return buildingInfo.value!.splitterInfo.get(selectedBuilding.value.index)!
})

const labModeTexts = new Map([
  [ResearchMode.None, '未选择模式'],
  [ResearchMode.Compose, '矩阵合成'],
  [ResearchMode.Research, '科研模式'],
]);

const accModeTexts = new Map([
  [AcceleratorMode.ExtraOutput, '额外产出'],
  [AcceleratorMode.Accelerate, '生产加速'],
]);

const LabModeText = computed(() => {
  const mode = (selectedBuilding.value!.parameters as LabParamerters).researchMode;
  return labModeTexts.get(mode)!;
})
const accModeText = computed(() => {
  if (selectedBuilding.value === null)
    return undefined;
  const itemId = selectedBuilding.value.itemId
  if(isLab(itemId) && (selectedBuilding.value!.parameters as LabParamerters).researchMode === ResearchMode.Compose ||
      allAssemblers.has(itemId)) {
    const mode = (selectedBuilding.value!.parameters as AssembleParamerters).acceleratorMode;
    return accModeTexts.get(mode)!;
  }
  return undefined;
})

const encodeBp = () => {
  if (!codeExpired.value || !data.value)
    return;
  bpStr.value = toStr(data.value)
  codeExpired.value = false;
}
const bpStrLatest = () => {
  encodeBp();
  return bpStr.value;
}

const bpStrInput = ref('');
const bpStrDisplay = () => {
  if (codeExpired.value)
    return 'BLUEPRINT:...';
  const len = bpStr.value.length
  if (len < 1000)
    return bpStr.value;
  return bpStr.value.substring(0, 400) + '\n...\n' + bpStr.value.substring(len - 400, len);
}
watchEffect(() => {
  bpStrInput.value = bpStrDisplay();
});

const parseBp = (s: string) => {
  if (s) {
    try {
      data.value = shallowReactive(fromStr(s.trim()));
      data.value.header = reactive(data.value.header);
      parseErrorMessage.value = '';
      watch(data.value, () => codeExpired.value = true);
    } catch(e) {
      parseErrorMessage.value = String(e);
    }
  } else {
    data.value = null;
    parseErrorMessage.value = '';
  }
  selectedBuildingIndex.value = null;
  bpStr.value = s;
  codeExpired.value = false;
}

const onBpFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    working.value = true;
    parseBp(await input.files[0].text());
    working.value = false;
  }
  input.value = '';
}

const onCopy = (e: ClipboardEvent) => {
  if (!e.clipboardData)
    return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', bpStrLatest());
}

const onCut = (e: ClipboardEvent) => {
  if (!e.clipboardData)
    return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', bpStrLatest());
  parseBp('');
}

const onPaste = (e: ClipboardEvent) => {
  if (!e.clipboardData)
    return;
  e.preventDefault();
  (e.target as HTMLElement).blur();
  parseBp(e.clipboardData.getData('text/plain'));
}

const copy = async () => {
  working.value = true;
  try {
    await navigator.clipboard.writeText(bpStrLatest());
    notSupport.value = false;
  } catch {
    notSupport.value = true;
  }
  working.value = false;
}

const paste = async () => {
  working.value = true;
  try {
    parseBp(await navigator.clipboard.readText());
    notSupport.value = false;
  } catch {
    notSupport.value = true;
  }
  working.value = false;
}
</script>

<style lang="scss">
body {
  margin: 0;
  background: black;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.expand-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 60px;
  width: 60px;
  background: url(@/assets/icons/menu.svg) center no-repeat, #00000060;
  border: 0;

  &.expanded {
    background: url(@/assets/icons/close.svg) center no-repeat;
  }
}

.row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  overflow-y: auto;
  box-sizing: border-box;
  background: #000000B0;
  color: white;
  display: none;
  padding-top: 60px;
  padding-left: 10px;
  padding-right: 10px;

  @media screen and (max-width: 360px) {
    width: 100%;
  }

  section {
    margin: 5px 0;
  }

  footer {
    margin-top: auto;
    margin-bottom: 5px;
    color: gray;
  }

  &.expanded {
    display: flex;
    flex-direction: column;
  }

  .error {
    color: red;
  }

  button {
    color: inherit;
    background: #64A0DC;
    border: 0;

    &[disabled] {
      background: gray;
    }
  }

  textarea, input {
    background: #FFFFFF40;
    border: 0;
    width: 100%;
    box-sizing: border-box;
    resize: none;
    color: inherit;
  }
}
</style>
