/* eslint-disable no-console */

import { register } from 'register-service-worker'
import { ref } from 'vue'

export const swStatus = ref('');

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      swStatus.value = '可离线使用';
    },
    updatefound() {
      if (navigator.serviceWorker.controller) {
        swStatus.value = '正在更新';
      } else {
        swStatus.value = '正在缓存';
      }
    },
    updated () {
      swStatus.value = '新版本就绪';
    },
    offline () {
      swStatus.value = '离线';
    },
    error (error) {
      swStatus.value = '错误：' + error.message;
    }
  })
} else {
  swStatus.value = '开发模式';
}
