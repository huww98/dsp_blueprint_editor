<template>
  <div class="container">
    <BlueprintEditor :blueprintData="data" />
    <div class="sidebar" :class="{ expanded: expandSidebar }">
      <section>
        <label for="shortDesc">缩略图文字</label>
        <input type="text" id="shortDesc" disabled :value="data?.header.shortDesc">
      </section>
      <section>
        <label for="desc">蓝图介绍</label>
        <textarea rows="2" id="desc" disabled :value="data?.header.desc"></textarea>
      </section>
      <section>
        <div class="row">
          <label for="bp-str" style="margin-right: auto;">代码</label>
          <span class="error" v-if="notSupport">不支持，请手动复制</span>
          <button style="margin: 0 2px;" @click="copy" :disabled="working || !bpStr">复制</button>
          <button style="margin: 0 2px;" @click="paste" :disabled="working">粘贴</button>
        </div>
        <textarea rows="3" id="bp-str" @copy="onCopy" @cut="onCut" @paste="onPaste" v-model.lazy.trim="bpStrShort"></textarea>
        <button @click="bpStr = ''" style="width: 100%; position: relative;" :disabled="working">
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
        <span style="margin-right: auto;">创建时间</span><span>{{data?.header.time.toLocaleString()}}</span>
        </div>
      </section>
    </div>
    <button class="expand-btn" :class="{ expanded: expandSidebar }" @click="expandSidebar = !expandSidebar"></button>
  </div>
</template>

<script setup lang="ts">
import { BlueprintData, fromStr } from './blueprint/parser';
import { computed, defineAsyncComponent, ref, shallowRef, watchEffect } from 'vue';

const BlueprintEditor = defineAsyncComponent(() => import(/* webpackChunkName: "editor" */'./components/BlueprintEditor.vue'));

const bpStr = ref('');
const data = shallowRef(null as BlueprintData | null);
const expandSidebar = ref(true);
const working = ref(false);
const notSupport = ref(false);
const parseErrorMessage = ref('');

const bpStrShort = computed({
  get() {
    const len = bpStr.value.length
    if (len < 1000)
      return bpStr.value;
    return bpStr.value.substring(0, 400) + '\n...\n' + bpStr.value.substring(len - 400, len);
  },
  set(s: string) {
    bpStr.value = s;
  }
});

watchEffect(() => {
  if (bpStr.value) {
    try {
      data.value = fromStr(bpStr.value);
      parseErrorMessage.value = '';
    } catch(e) {
      parseErrorMessage.value = String(e);
    }
  } else {
    data.value = null;
    parseErrorMessage.value = '';
  }
});

const onBpFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    working.value = true;
    bpStr.value = await input.files[0].text();
    working.value = false;
  }
  input.value = '';
}

const onCopy = (e: ClipboardEvent) => {
  if (!e.clipboardData)
    return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', bpStr.value);
}

const onCut = (e: ClipboardEvent) => {
  if (!e.clipboardData)
    return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', bpStr.value);
  bpStr.value = '';
}

const onPaste = (e: ClipboardEvent) => {
  if (!e.clipboardData)
    return;
  e.preventDefault();
  (e.target as HTMLElement).blur();
  bpStr.value = e.clipboardData.getData('text/plain');
}

const copy = async () => {
  working.value = true;
  try {
    await navigator.clipboard.writeText(bpStr.value);
  } catch {
    notSupport.value = true;
  }
  working.value = false;
}

const paste = async () => {
  working.value = true;
  try {
    bpStr.value = await navigator.clipboard.readText();
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
  box-sizing: border-box;
  background: #000000A0;
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

  &.expanded {
    display: block;
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
