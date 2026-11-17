import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

export const APP_TITLE = 'AnEpoch 管理后台'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/portal',
    name: 'portal',
    component: () => import('@/views/portal/Portal.vue'),
    meta: { title: '中台选择' },
  },
  {
    path: '/website',
    name: 'website',
    component: () => import('@/views/website/index.vue'),
    meta: { title: '企业官网', public: true },
  },
  {
    path: '/',
    redirect: '/portal',
  },
  {
    path: '/admin',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { system: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/dashboard/index.vue'),
        meta: { title: '中台首页', icon: 'DashboardOutlined', system: 'admin' },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/users/index.vue'),
        meta: { title: '用户管理', icon: 'TeamOutlined', parent: '系统管理', system: 'admin' },
      },
      {
        path: 'roles',
        name: 'admin-roles',
        component: () => import('@/views/admin/roles/index.vue'),
        meta: { title: '角色管理', icon: 'SafetyOutlined', parent: '系统管理', system: 'admin' },
      },
      {
        path: 'departments',
        name: 'admin-departments',
        component: () => import('@/views/admin/departments/index.vue'),
        meta: { title: '组织管理', icon: 'ApartmentOutlined', parent: '系统管理', system: 'admin' },
      },
      {
        path: 'resources',
        name: 'admin-resources',
        component: () => import('@/views/admin/resources/index.vue'),
        meta: { title: '资源管理', icon: 'AppstoreOutlined', parent: '系统管理', system: 'admin' },
      },
    ],
  },
  {
    path: '/data',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/data/overview',
    meta: { system: 'data' },
    children: [
      {
        path: 'overview',
        name: 'data-overview',
        component: () => import('@/views/data/overview/index.vue'),
        meta: { title: '数据概览', icon: 'BarChartOutlined', system: 'data' },
      },
      {
        path: 'sources',
        name: 'data-sources',
        component: () => import('@/views/data/sources/index.vue'),
        meta: { title: '数据源管理', icon: 'ClusterOutlined', system: 'data' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面不存在', public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && userStore.token) {
    return { path: '/portal' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - ${APP_TITLE}` : APP_TITLE
})

export default router
