import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ThemeId } from '@/config/themes'

const STORAGE_KEY = 'anepoch_theme'

function loadTheme(): ThemeId {
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) || 'basic'
}

/** 中台主题：持久化到 localStorage */
export const useThemeStore = defineStore('theme', () => {
  const current = ref<ThemeId>(loadTheme())

  function set(id: ThemeId) {
    current.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { current, set }
})
