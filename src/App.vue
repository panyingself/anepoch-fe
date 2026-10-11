<template>
  <a-config-provider :locale="zhCN" :theme="currentTheme.antd" :style="currentTheme.vars">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useThemeStore } from '@/stores/theme'
import { getTheme } from '@/config/themes'

dayjs.locale('zh-cn')

const themeStore = useThemeStore()
const currentTheme = computed(() => getTheme(themeStore.current))
</script>
