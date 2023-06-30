import { createI18n } from 'vue-i18n'

import zh from './locales/zh.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { ref, watchEffect } from 'vue'

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
