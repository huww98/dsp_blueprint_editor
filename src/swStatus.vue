<script lang="ts" setup>
import { ref } from 'vue'

const status = ref('');
const upgradeReady = ref(false);
let upgrade = () => { /* NoOP */ };

const setUpgradeReady = (waitingWorker: ServiceWorker) => {
    status.value = '新版本就绪';
    upgradeReady.value = true;
    upgrade = () => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
}

if (process.env.NODE_ENV !== 'development' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(() => {
        status.value = '可离线使用';
    });
    navigator.serviceWorker.register(`${process.env.BASE_URL}service-worker.js`)
        .then(registration => {
            if (registration.waiting)
                setUpgradeReady(registration.waiting);
            registration.addEventListener('updatefound', () => {
                if (navigator.serviceWorker.controller)
                    status.value = '正在更新';
                else
                    status.value = '正在缓存';

                registration.installing!.addEventListener('statechange', function() {
                    if (this.state == 'installed' && navigator.serviceWorker.controller) {
                        setUpgradeReady(this);
                    }
                });
            });
        })
        .catch(e => status.value = '错误：' + e.message);
}
</script>

<template>
    <span>{{status}} <a v-if="upgradeReady" href="#" @click.prevent="upgrade()">刷新</a></span>
</template>
