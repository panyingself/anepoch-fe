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
  GlobalOutlined,
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
import type { ResourceNode } from '@/api/admin/resource'

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
  /** 路由 meta.system 标识，与 BasicLayout 匹配（= path 第一段） */
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
  /** 内置卡片（如官网），不参与权限数据，也不计入中台统计 */
  builtin?: boolean
}

/**
 * 内置官网卡片：不来自后端资源树，不受 RBAC 权限控制，
 * 登录后始终展示在门户首位。
 */
export const OFFICIAL_SITE: SystemMeta = {
  key: 'website',
  routeKey: 'website',
  name: '企业官网',
  desc: '品牌形象、产品展示与案例资讯',
  icon: GlobalOutlined,
  color: '#38bdf8',
  status: 'online',
  home: '/website',
  builtin: true,
}

/**
 * UI 元数据映射表：后端 catalog 只负责业务结构（code/path/children），
 * 图标、颜色、简介属于前端展示属性，集中在这里按 catalog.path 匹配。
 * 以后新增中台只需要在此补一条映射 + 后端加 catalog 种子。
 */
const UI_META: Record<string, { icon: Component; color: string; desc: string }> = {
  '/admin': {
    icon: TeamOutlined,
    color: '#1677ff',
    desc: '组织架构、账号权限与角色配置',
  },
  '/data': {
    icon: DatabaseOutlined,
    color: '#00b96b',
    desc: '业务指标、数据趋势与报表分析',
  },
  '/order': {
    icon: ShoppingCartOutlined,
    color: '#13c2c2',
    desc: '交易订单全链路管理与跟踪',
  },
  '/goods': {
    icon: ShoppingOutlined,
    color: '#52c41a',
    desc: '商品信息、类目与库存管理',
  },
  '/marketing': {
    icon: NotificationOutlined,
    color: '#722ed1',
    desc: '活动、优惠券与触达策略配置',
  },
  '/finance': {
    icon: MoneyCollectOutlined,
    color: '#faad14',
    desc: '结算、对账与经营报表',
  },
  '/content': {
    icon: FileTextOutlined,
    color: '#2f54eb',
    desc: '图文、素材与内容分发管理',
  },
  '/service': {
    icon: CustomerServiceOutlined,
    color: '#f759ab',
    desc: '工单、会话与满意度管理',
  },
  '/supply': {
    icon: CarOutlined,
    color: '#fa8c16',
    desc: '采购、仓储与物流协同',
  },
  '/operation': {
    icon: RocketOutlined,
    color: '#eb2f96',
    desc: '用户增长与平台运营策略',
  },
  '/monitor': {
    icon: FundOutlined,
    color: '#5b8ff9',
    desc: '系统监控、告警与链路追踪',
  },
  '/project': {
    icon: ProjectOutlined,
    color: '#36cfc9',
    desc: '项目计划、进度与协作管理',
  },
}

/** building 中台硬编码（后端暂未加 catalog 种子） */
const BUILDING_PATH_PREFIXES = [
  '/order',
  '/goods',
  '/marketing',
  '/finance',
  '/content',
  '/service',
  '/supply',
  '/operation',
  '/monitor',
  '/project',
]

/** path → 默认 icon（兜底，避免 UI_META 缺失时显示空白） */
function defaultIconFor(path: string): Component {
  const leaf = path.split('/').pop() || path
  const first = leaf[0]?.toLowerCase() ?? 'a'
  if (['d', 'o'].includes(first)) return DashboardOutlined
  if (['s', 't'].includes(first)) return SettingOutlined
  return AppstoreOutlined
}

/** 将后端菜单树递归转为 Ant Design Menu items 格式 */
const MENU_ICON_POOL: Component[] = [
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  ClusterOutlined,
]
function toMenuNode(node: ResourceNode, depth = 0): SystemMenuNode {
  const icon = MENU_ICON_POOL[(depth + node.sort) % MENU_ICON_POOL.length]
  const base: SystemMenuNode = { key: node.path || node.code, icon, label: node.name }
  const children = node.children?.filter((c) => c.type !== 'button' && c.type !== 'api')
  if (children && children.length > 0) {
    base.children = children.map((c) => toMenuNode(c, depth + 1))
  }
  return base
}

/**
 * 从后端资源树 + 前端 building 列表生成完整中台注册表。
 *
 * 规则：
 *  - 顶层 catalog（type=catalog）= online 中台，path 同时作为 routeKey
 *  - building 中台前缀不在后端 catalog 列表里的，追加为 building 状态
 */
export function buildSystems(resourceTree: ResourceNode[]): SystemMeta[] {
  const online = resourceTree
    .filter((n) => n.type === 'catalog' && !!n.path)
    .map<SystemMeta>((catalog) => {
      const ui = UI_META[catalog.path!] ?? {
        icon: defaultIconFor(catalog.path!),
        color: '#1677ff',
        desc: catalog.name,
      }
      // 中台首页：catalog 下第一个菜单（type=menu 排序最前）
      const allChildren = collectFlat(catalog).filter((c) => c.type === 'menu')
      const home = allChildren.sort((a, b) => a.sort - b.sort)[0]?.path ?? catalog.path
      // 侧边栏菜单：catalog 下的直接子级（递归过滤按钮/接口）
      const menus = catalog.children
        ?.filter((c) => c.type !== 'button' && c.type !== 'api')
        .map((c) => toMenuNode(c, 0))

      return {
        key: catalog.code,
        routeKey: catalog.path!.replace(/^\//, '').split('/')[0],
        name: catalog.name,
        desc: ui.desc,
        icon: ui.icon,
        color: ui.color,
        status: 'online',
        home,
        menus,
      }
    })

  const onlinePaths = new Set(online.map((s) => `/s.routeKey`))
  const building = BUILDING_PATH_PREFIXES
    .filter((p) => !onlinePaths.has(p))
    .map<SystemMeta>((p) => {
      const ui = UI_META[p]!
      return {
        key: p.replace(/^\//, ''),
        routeKey: p.replace(/^\//, ''),
        name: getSystemNameFromPath(p),
        desc: ui.desc,
        icon: ui.icon,
        color: ui.color,
        status: 'building',
      }
    })

  // online 按 sort，building 按路径顺序
  return [...online, ...building]
}

function getSystemNameFromPath(path: string): string {
  const map: Record<string, string> = {
    '/order': '订单中台',
    '/goods': '商品中台',
    '/marketing': '营销中台',
    '/finance': '财务中台',
    '/content': '内容中台',
    '/service': '客服中台',
    '/supply': '供应链中台',
    '/operation': '运营中台',
    '/monitor': '监控中台',
    '/project': '项目中台',
  }
  return map[path] ?? path
}

/** 递归收集所有后代节点（含自身） */
function collectFlat(node: ResourceNode): ResourceNode[] {
  const out: ResourceNode[] = [node]
  for (const c of node.children ?? []) out.push(...collectFlat(c))
  return out
}

/** 根据 routeKey 查中台（动态生成后使用） */
export function findSystem(routeKey: string, systems: SystemMeta[]): SystemMeta | undefined {
  return systems.find((s) => s.routeKey === routeKey)
}

/**
 * 仅用于静态引用（类型兼容、未 fetchResourceTree 之前）。
 * 新代码请使用 buildSystems(fetchResourceTree()) 动态生成。
 */
export const EMPTY_SYSTEMS: SystemMeta[] = []
