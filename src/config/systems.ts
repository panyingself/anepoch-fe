import type { Component } from 'vue'
import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  CarOutlined,
  ClusterOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FundOutlined,
  MoneyCollectOutlined,
  NotificationOutlined,
  ProjectOutlined,
  RocketOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'

export type SystemStatus = 'online' | 'building'

export interface SystemMenuNode {
  key: string
  icon: Component
  label: string
  children?: Omit<SystemMenuNode, 'children'>[]
}

export interface SystemMeta {
  /** 唯一标识，同时用于 localStorage 记录上次使用 */
  key: string
  /** 路由 meta.system 标识，与 BasicLayout 匹配 */
  routeKey: string
  name: string
  desc: string
  icon: Component
  /** 主题色：门户图标与悬停填充 */
  color: string
  status: SystemStatus
  /** online 系统的首页路由 */
  home?: string
  /** online 系统的侧边栏菜单（BasicLayout 使用） */
  menus?: SystemMenuNode[]
}

/**
 * 中台注册表：门户卡片与布局菜单的唯一数据源。
 * 新增中台：加一条记录（building 状态自动出现在门户，开发完成后改为 online
 * 并补充 home / menus / 路由 / 页面即可）。
 */
export const SYSTEMS: SystemMeta[] = [
  {
    key: 'admin',
    routeKey: 'admin',
    name: '用户管理中台',
    desc: '组织架构、账号权限与角色配置',
    icon: TeamOutlined,
    color: '#1677ff',
    status: 'online',
    home: '/admin/dashboard',
    menus: [
      { key: '/admin/dashboard', icon: DashboardOutlined, label: '中台首页' },
      {
        key: '/admin/system',
        icon: SettingOutlined,
        label: '系统管理',
        children: [
          { key: '/admin/users', icon: TeamOutlined, label: '用户管理' },
          { key: '/admin/roles', icon: SafetyOutlined, label: '角色管理' },
          { key: '/admin/departments', icon: ApartmentOutlined, label: '组织管理' },
          { key: '/admin/resources', icon: AppstoreOutlined, label: '资源管理' },
        ],
      },
    ],
  },
  {
    key: 'data',
    routeKey: 'data',
    name: '数据中台',
    desc: '业务指标、数据趋势与报表分析',
    icon: DatabaseOutlined,
    color: '#00b96b',
    status: 'online',
    home: '/data/overview',
    menus: [
      { key: '/data/overview', icon: BarChartOutlined, label: '数据概览' },
      { key: '/data/sources', icon: ClusterOutlined, label: '数据源管理' },
    ],
  },
  {
    key: 'order',
    routeKey: 'order',
    name: '订单中台',
    desc: '交易订单全链路管理与跟踪',
    icon: ShoppingCartOutlined,
    color: '#13c2c2',
    status: 'building',
  },
  {
    key: 'goods',
    routeKey: 'goods',
    name: '商品中台',
    desc: '商品信息、类目与库存管理',
    icon: ShoppingOutlined,
    color: '#52c41a',
    status: 'building',
  },
  {
    key: 'marketing',
    routeKey: 'marketing',
    name: '营销中台',
    desc: '活动、优惠券与触达策略配置',
    icon: NotificationOutlined,
    color: '#722ed1',
    status: 'building',
  },
  {
    key: 'finance',
    routeKey: 'finance',
    name: '财务中台',
    desc: '结算、对账与经营报表',
    icon: MoneyCollectOutlined,
    color: '#faad14',
    status: 'building',
  },
  {
    key: 'content',
    routeKey: 'content',
    name: '内容中台',
    desc: '图文、素材与内容分发管理',
    icon: FileTextOutlined,
    color: '#2f54eb',
    status: 'building',
  },
  {
    key: 'service',
    routeKey: 'service',
    name: '客服中台',
    desc: '工单、会话与满意度管理',
    icon: CustomerServiceOutlined,
    color: '#f759ab',
    status: 'building',
  },
  {
    key: 'supply',
    routeKey: 'supply',
    name: '供应链中台',
    desc: '采购、仓储与物流协同',
    icon: CarOutlined,
    color: '#fa8c16',
    status: 'building',
  },
  {
    key: 'operation',
    routeKey: 'operation',
    name: '运营中台',
    desc: '用户增长与平台运营策略',
    icon: RocketOutlined,
    color: '#eb2f96',
    status: 'building',
  },
  {
    key: 'monitor',
    routeKey: 'monitor',
    name: '监控中台',
    desc: '系统监控、告警与链路追踪',
    icon: FundOutlined,
    color: '#5b8ff9',
    status: 'building',
  },
  {
    key: 'project',
    routeKey: 'project',
    name: '项目中台',
    desc: '项目计划、进度与协作管理',
    icon: ProjectOutlined,
    color: '#36cfc9',
    status: 'building',
  },
]

export function getSystem(routeKey: string): SystemMeta | undefined {
  return SYSTEMS.find((s) => s.routeKey === routeKey)
}
