<template>
  <a-layout class="basic-layout" :class="`theme-${themeStore.current}`" :style="currentTheme.vars">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="light"
      width="220"
      class="sider"
    >
      <div class="logo">
        <AppstoreOutlined class="logo-icon" />
        <span v-if="!collapsed" class="logo-title">{{ currentSystem?.name ?? '加载中...' }}</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="light"
        mode="inline"
        :items="menuItems"
        @click="onMenuClick"
      />
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <span class="icon-btn" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </span>
          <a-tooltip title="返回中台选择">
            <span class="icon-btn" @click="router.push('/portal')">
              <AppstoreOutlined />
            </span>
          </a-tooltip>
          <a-breadcrumb>
            <a-breadcrumb-item>
              <router-link :to="currentSystem?.home || '/'">{{ currentSystem?.name ?? '中台首页' }}</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="route.meta.parent">{{ route.meta.parent }}</a-breadcrumb-item>
            <a-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-dropdown trigger="click">
            <span class="theme-btn">
              <BgColorsOutlined />
              <span class="theme-name">{{ currentThemeMeta?.name }}</span>
              <DownOutlined class="theme-arrow" />
            </span>
            <template #overlay>
              <a-menu :selected-keys="[themeStore.current]" @click="onThemeClick">
                <a-menu-item v-for="t in THEME_LIST" :key="t.id">
                  <span class="swatch" :style="{ background: t.swatch }" />
                  <span style="margin-left: 8px">{{ t.name }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown>
            <span class="user-info">
              <a-avatar :size="28" style="background-color: var(--logo-icon)">
                {{ (userStore.userInfo?.nickname || 'A').slice(0, 1) }}
              </a-avatar>
              <span class="user-name">{{ userStore.userInfo?.nickname || '未登录' }}</span>
            </span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="onLogout">
                  <LogoutOutlined />
                  <span style="margin-left: 6px">退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <div class="content-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>

      <a-layout-footer class="footer">
        AnEpoch Admin ©{{ new Date().getFullYear() }} Powered by Vue3 + Ant Design Vue
      </a-layout-footer>
    </a-layout>

    <!-- 主题专属动态氛围层（全屏、低遮挡、不可交互） -->
    <ThemeAmbient />
  </a-layout>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuProps, ItemType } from 'ant-design-vue'
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, BgColorsOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { getTheme, THEME_LIST } from '@/config/themes'
import ThemeAmbient from '@/components/ThemeAmbient.vue'
import type { ThemeId } from '@/config/themes'
import type { SystemMenuNode } from '@/config/systems'
import { useSystems } from '@/composables/useSystems'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { systems, loaded, ensureLoaded, getSystem, resetCache } = useSystems()

const collapsed = ref(false)
const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>([])

const currentSystem = computed(
  () => getSystem(String(route.meta.system ?? 'admin')) ?? getSystem('admin'),
)

const currentTheme = computed(() => getTheme(themeStore.current))
const currentThemeMeta = computed(() => THEME_LIST.find((t) => t.id === themeStore.current))

function toMenuItem(node: SystemMenuNode): ItemType {
  if (node.children) {
    return {
      key: node.key,
      icon: () => h(node.icon),
      label: node.label,
      children: node.children.map(toMenuItem),
    }
  }
  return { key: node.key, icon: () => h(node.icon), label: node.label }
}

const menuItems = computed<ItemType[]>(() => currentSystem.value?.menus?.map(toMenuItem) ?? [])

onMounted(async () => {
  await ensureLoaded()
})

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    if (path.startsWith('/admin/system')) {
      openKeys.value = Array.from(new Set([...openKeys.value, '/admin/system']))
    }
  },
  { immediate: true },
)

const onMenuClick: MenuProps['onClick'] = ({ key }) => {
  router.push(String(key))
}

const onLogout = () => {
  resetCache()
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

const onThemeClick: MenuProps['onClick'] = ({ key }) => {
  themeStore.set(key as ThemeId)
}
</script>

<style scoped lang="less">
.basic-layout {
  height: 100vh;
}

/* ====== 主题变量（默认为基础主题，各主题类覆盖）====== */
.basic-layout {
  --sider-bg: #ffffff;
  --header-bg: #ffffff;
  --line: #f0f0f0;
  --logo-text: rgba(0, 0, 0, 0.88);
  --logo-icon: #1677ff;
  --icon-color: rgba(0, 0, 0, 0.65);
  --icon-hover: #1677ff;
  --hover-bg: rgba(0, 0, 0, 0.04);
  --user-text: rgba(0, 0, 0, 0.88);
  --footer-text: rgba(0, 0, 0, 0.45);
}

/* 侧边栏：主题底色 + 细分隔线 */
.sider {
  background: var(--sider-bg);
  box-shadow: inset -1px 0 0 var(--line);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  overflow: hidden;
  color: var(--logo-text);
  border-bottom: 1px solid var(--line);

  .logo-icon {
    font-size: 20px;
    color: var(--logo-icon);
  }

  .logo-title {
    margin-left: 10px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
}

.theme-starry .logo-icon {
  filter: drop-shadow(0 0 6px rgba(77, 159, 255, 0.6));
}

.theme-nebula .logo-icon {
  filter: drop-shadow(0 0 6px rgba(181, 123, 255, 0.65));
}

.theme-bubble .logo-icon {
  filter: drop-shadow(0 0 6px rgba(192, 38, 211, 0.55));
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--line);
  box-shadow: none;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .icon-btn {
      font-size: 18px;
      color: var(--icon-color);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--icon-hover);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .theme-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      font-size: 13px;
      color: var(--icon-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      .theme-arrow {
        font-size: 10px;
        opacity: 0.7;
      }

      &:hover {
        color: var(--icon-hover);
        background: var(--hover-bg);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;

      /* 头像悬停：圆形 → 圆角方形 + 旋转 */
      :deep(.ant-avatar) {
        border-radius: 50%;
        transition:
          border-radius 0.4s ease,
          transform 0.4s ease;
      }

      &:hover {
        background: var(--hover-bg);

        :deep(.ant-avatar) {
          border-radius: 8px;
          transform: rotate(360deg);
        }
      }

      .user-name {
        font-size: 14px;
        color: var(--user-text);
      }
    }
  }
}

.content {
  margin: 16px;
  padding: 0;
  overflow: hidden;
}

.content-main {
  height: 100%;
  overflow: auto;
}

.footer {
  padding: 12px;
  font-size: 12px;
  color: var(--footer-text);
  text-align: center;
  background: transparent;
}

/* 主题下拉色块 */
.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  vertical-align: middle;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
