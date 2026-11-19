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
    path: '/marketing',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/marketing/dashboard',
    meta: { system: 'marketing' },
    children: [
      {
        path: 'dashboard',
        name: 'marketing-dashboard',
        component: () => import('@/views/marketing/dashboard/index.vue'),
        meta: { title: '中台首页', icon: 'DashboardOutlined', system: 'marketing' },
      },
      {
        path: 'campaign/list',
        name: 'marketing-campaign-list',
        component: () => import('@/views/marketing/campaign/list/index.vue'),
        meta: { title: '活动列表', icon: 'UnorderedListOutlined', parent: '活动管理', system: 'marketing' },
      },
      {
        path: 'campaign/templates',
        name: 'marketing-campaign-templates',
        component: () => import('@/views/marketing/campaign/templates/index.vue'),
        meta: { title: '活动模板管理', icon: 'ProfileOutlined', parent: '活动管理', system: 'marketing' },
      },
      {
        path: 'campaign/materials',
        name: 'marketing-campaign-materials',
        component: () => import('@/views/marketing/campaign/materials/index.vue'),
        meta: { title: '活动物料管理', icon: 'GiftOutlined', parent: '活动管理', system: 'marketing' },
      },
      {
        path: 'campaign/templates/:id/config',
        name: 'marketing-campaign-template-config',
        component: () => import('@/views/marketing/campaign/templates/config.vue'),
        meta: { title: '模板配置', icon: 'SettingOutlined', parent: '活动模板管理', system: 'marketing' },
      },
      {
        path: 'campaign/config-templates',
        name: 'marketing-campaign-config-templates',
        component: () => import('@/views/marketing/campaign/config-templates/index.vue'),
        meta: { title: '活动配置模板管理', icon: 'CopyOutlined', parent: '活动管理', system: 'marketing' },
      },
      {
        path: 'campaign/config-templates/:id',
        name: 'marketing-campaign-config-template-edit',
        component: () => import('@/views/marketing/campaign/config-templates/edit.vue'),
        meta: { title: '配置模板详情', icon: 'SettingOutlined', parent: '活动配置模板管理', system: 'marketing' },
      },
      {
        path: 'material/exchange',
        name: 'marketing-material-exchange',
        component: () => import('@/views/marketing/material/coupon/index.vue'),
        props: { kind: 'exchange' },
        meta: { title: '兑换券', icon: 'GiftOutlined', parent: '物料管理', system: 'marketing' },
      },
      {
        path: 'material/discount',
        name: 'marketing-material-discount',
        component: () => import('@/views/marketing/material/coupon/index.vue'),
        props: { kind: 'discount' },
        meta: { title: '折扣券', icon: 'TagsOutlined', parent: '物料管理', system: 'marketing' },
      },
      {
        path: 'material/points',
        name: 'marketing-material-points',
        component: () => import('@/views/marketing/material/points/index.vue'),
        meta: { title: '积分', icon: 'StarOutlined', parent: '物料管理', system: 'marketing' },
      },
      {
        path: 'material/detail',
        name: 'marketing-material-detail',
        component: () => import('@/views/marketing/material/detail/index.vue'),
        meta: { title: '物料明细', icon: 'TableOutlined', parent: '物料管理', system: 'marketing' },
      },
      {
        path: 'channel/list',
        name: 'marketing-channel-list',
        component: () => import('@/views/marketing/channel/list/index.vue'),
        meta: { title: '投放渠道', icon: 'SendOutlined', parent: '渠道管理', system: 'marketing' },
      },
    ],
  },
  {
    path: '/supply',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/supply/material/suppliers',
    meta: { system: 'supply' },
    children: [
      {
        path: 'material',
        redirect: '/supply/material/suppliers',
      },
      {
        path: 'material/suppliers',
        name: 'supply-material-suppliers',
        component: () => import('@/views/supply/suppliers/index.vue'),
        meta: {
          title: '物料供应商管理',
          icon: 'TeamOutlined',
          parent: '物料供应商管理',
          system: 'supply',
        },
      },
    ],
  },
  {
    path: '/content',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/content/notification/list',
    meta: { system: 'content' },
    children: [
      {
        path: 'notification',
        redirect: '/content/notification/list',
      },
      {
        path: 'agreement',
        redirect: '/content/agreement/list',
      },
      {
        path: 'sms',
        redirect: '/content/sms/list',
      },
      {
        path: 'notification/list',
        name: 'content-notification-list',
        component: () => import('@/views/content/notifications/index.vue'),
        meta: {
          title: '通知消息列表',
          icon: 'NotificationOutlined',
          parent: '通知消息管理',
          system: 'content',
        },
      },
      {
        path: 'agreement/list',
        name: 'content-agreement-list',
        component: () => import('@/views/content/agreements/index.vue'),
        meta: {
          title: '用户协议列表',
          icon: 'FileProtectOutlined',
          parent: '用户协议管理',
          system: 'content',
        },
      },
      {
        path: 'sms/list',
        name: 'content-sms-list',
        component: () => import('@/views/content/sms/index.vue'),
        meta: {
          title: '短信记录',
          icon: 'MessageOutlined',
          parent: '短信管理',
          system: 'content',
        },
      },
      {
        path: 'sms/templates',
        name: 'content-sms-templates',
        component: () => import('@/views/content/sms-templates/index.vue'),
        meta: {
          title: '短信模板管理',
          icon: 'FileTextOutlined',
          parent: '短信管理',
          system: 'content',
        },
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
