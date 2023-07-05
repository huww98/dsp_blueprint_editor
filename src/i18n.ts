import { createI18n } from 'vue-i18n'

import zh from './locales/zh.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { ref, watchEffect } from 'vue'
import { itemsMap, recipesMap } from './data'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: [...navigator.languages, 'en'],
    messages: {
      zh,
      en,
      fr,
    },
});

export function useLang() {
    const lang = ref('auto');

    watchEffect(() => {
        const locale = i18n.global.locale;
        if (lang.value === 'auto') {
            locale.value = navigator.language as any;
        } else {
            locale.value = lang.value as any;
        }
    })

    return lang;
}

export default i18n;

export function itemName(id: number) {
    const item = itemsMap.get(id);
    return item ? i18n.global.t(item.name) : 'unknown';
}

export function recipeName(id: number) {
    const r = recipesMap.get(id);
    return r ? i18n.global.t(r.name) : 'unknown';
}
