import { createI18n } from 'vue-i18n'

import zh from './locales/zh.json'
import en from './locales/en.json'
import fr from './locales/fr.json'

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    zh,
    en,
    fr,
  },
})
