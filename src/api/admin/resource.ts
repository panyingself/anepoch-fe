import { mockDelay } from '../common'

export type ResourceType = 'catalog' | 'menu' | 'button' | 'api'

export const RESOURCE_TYPE_MAP: Record<ResourceType, { label: string; color: string }> = {
  catalog: { label: '目录', color: 'purple' },
  menu: { label: '菜单', color: 'blue' },
  button: { label: '按钮', color: 'green' },
  api: { label: '接口', color: 'orange' },
}

export interface ResourceNode {
  id: number
  parentId: number | null
  type: ResourceType
  name: string
  /** 权限编码，如 admin:user:create */
  code: string
  /** 目录/菜单为路由路径，接口为请求路径 */
  path?: string
  sort: number
  status: 0 | 1 // 1 启用 0 禁用
  createdAt: string
  children?: ResourceNode[]
}

export interface ResourcePayload extends Omit<ResourceNode, 'id' | 'createdAt' | 'children'> {
  id?: number
}

let nextId = 1000
let tree: ResourceNode[] = [
  {
    id: 1,
    parentId: null,
    type: 'catalog',
    name: '用户管理中台',
    code: 'admin',
    path: '/admin',
    sort: 1,
    status: 1,
    createdAt: '2026-01-05 10:00:00',
    children: [
      {
        id: 11,
        parentId: 1,
        type: 'menu',
        name: '中台首页',
        code: 'admin:dashboard',
        path: '/admin/dashboard',
        sort: 1,
        status: 1,
        createdAt: '2026-01-05 10:10:00',
      },
      {
        id: 12,
        parentId: 1,
        type: 'catalog',
        name: '系统管理',
        code: 'admin:system',
        path: '/admin/system',
        sort: 2,
        status: 1,
        createdAt: '2026-01-05 10:20:00',
        children: [
          {
            id: 121,
            parentId: 12,
            type: 'menu',
            name: '用户管理',
            code: 'admin:user',
            path: '/admin/users',
            sort: 1,
            status: 1,
            createdAt: '2026-01-06 09:00:00',
            children: [
              { id: 1211, parentId: 121, type: 'button', name: '新增用户', code: 'admin:user:create', sort: 1, status: 1, createdAt: '2026-01-06 09:10:00' },
              { id: 1212, parentId: 121, type: 'button', name: '编辑用户', code: 'admin:user:update', sort: 2, status: 1, createdAt: '2026-01-06 09:11:00' },
              { id: 1213, parentId: 121, type: 'button', name: '删除用户', code: 'admin:user:delete', sort: 3, status: 1, createdAt: '2026-01-06 09:12:00' },
              { id: 1214, parentId: 121, type: 'api', name: '用户查询接口', code: 'admin:user:query', path: 'GET /api/admin/users', sort: 4, status: 1, createdAt: '2026-01-06 09:13:00' },
              { id: 1215, parentId: 121, type: 'api', name: '用户写入接口', code: 'admin:user:write', path: 'POST|PUT|DELETE /api/admin/users', sort: 5, status: 1, createdAt: '2026-01-06 09:14:00' },
            ],
          },
          {
            id: 122,
            parentId: 12,
            type: 'menu',
            name: '角色管理',
            code: 'admin:role',
            path: '/admin/roles',
            sort: 2,
            status: 1,
            createdAt: '2026-01-06 10:00:00',
            children: [
              { id: 1221, parentId: 122, type: 'button', name: '新增角色', code: 'admin:role:create', sort: 1, status: 1, createdAt: '2026-01-06 10:10:00' },
              { id: 1222, parentId: 122, type: 'button', name: '编辑角色', code: 'admin:role:update', sort: 2, status: 1, createdAt: '2026-01-06 10:11:00' },
              { id: 1223, parentId: 122, type: 'button', name: '分配权限', code: 'admin:role:grant', sort: 3, status: 1, createdAt: '2026-01-06 10:12:00' },
              { id: 1224, parentId: 122, type: 'api', name: '角色接口', code: 'admin:role:api', path: '/api/admin/roles', sort: 4, status: 1, createdAt: '2026-01-06 10:13:00' },
            ],
          },
          {
            id: 123,
            parentId: 12,
            type: 'menu',
            name: '组织管理',
            code: 'admin:dept',
            path: '/admin/departments',
            sort: 3,
            status: 1,
            createdAt: '2026-01-07 09:00:00',
            children: [
              { id: 1231, parentId: 123, type: 'button', name: '新增组织', code: 'admin:dept:create', sort: 1, status: 1, createdAt: '2026-01-07 09:10:00' },
              { id: 1232, parentId: 123, type: 'button', name: '编辑组织', code: 'admin:dept:update', sort: 2, status: 1, createdAt: '2026-01-07 09:11:00' },
              { id: 1233, parentId: 123, type: 'api', name: '组织接口', code: 'admin:dept:api', path: '/api/admin/depts', sort: 3, status: 1, createdAt: '2026-01-07 09:12:00' },
            ],
          },
          {
            id: 124,
            parentId: 12,
            type: 'menu',
            name: '资源管理',
            code: 'admin:resource',
            path: '/admin/resources',
            sort: 4,
            status: 1,
            createdAt: '2026-01-07 10:00:00',
            children: [
              { id: 1241, parentId: 124, type: 'button', name: '新增资源', code: 'admin:res:create', sort: 1, status: 1, createdAt: '2026-01-07 10:10:00' },
              { id: 1242, parentId: 124, type: 'button', name: '编辑资源', code: 'admin:res:update', sort: 2, status: 1, createdAt: '2026-01-07 10:11:00' },
              { id: 1243, parentId: 124, type: 'api', name: '资源接口', code: 'admin:res:api', path: '/api/admin/resources', sort: 3, status: 1, createdAt: '2026-01-07 10:12:00' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    parentId: null,
    type: 'catalog',
    name: '数据中台',
    code: 'data',
    path: '/data',
    sort: 2,
    status: 1,
    createdAt: '2026-01-08 09:00:00',
    children: [
      {
        id: 21,
        parentId: 2,
        type: 'menu',
        name: '数据概览',
        code: 'data:overview',
        path: '/data/overview',
        sort: 1,
        status: 1,
        createdAt: '2026-01-08 09:10:00',
        children: [
          { id: 211, parentId: 21, type: 'button', name: '查看概览', code: 'data:overview:read', sort: 1, status: 1, createdAt: '2026-01-08 09:20:00' },
          { id: 212, parentId: 21, type: 'api', name: '概览数据接口', code: 'data:overview:api', path: 'GET /api/data/overview', sort: 2, status: 1, createdAt: '2026-01-08 09:21:00' },
        ],
      },
      {
        id: 22,
        parentId: 2,
        type: 'menu',
        name: '数据源管理',
        code: 'data:source',
        path: '/data/sources',
        sort: 2,
        status: 1,
        createdAt: '2026-01-08 09:30:00',
        children: [
          { id: 221, parentId: 22, type: 'button', name: '新建数据源', code: 'data:source:create', sort: 1, status: 1, createdAt: '2026-01-08 09:40:00' },
          { id: 222, parentId: 22, type: 'button', name: '编辑数据源', code: 'data:source:update', sort: 2, status: 1, createdAt: '2026-01-08 09:41:00' },
          { id: 223, parentId: 22, type: 'api', name: '数据源接口', code: 'data:source:api', path: '/api/data/connections', sort: 3, status: 1, createdAt: '2026-01-08 09:42:00' },
        ],
      },
    ],
  },
]

/** RBAC：角色 → 资源（超管全量，其余差异化授权） */
function collectIds(nodes: ResourceNode[], acc: number[] = []): number[] {
  nodes.forEach((n) => {
    acc.push(n.id)
    if (n.children) collectIds(n.children, acc)
  })
  return acc
}

const allIds = collectIds(tree)
let roleResources: Record<number, number[]> = {
  1: [...allIds],
  2: [1, 11, 121, 1211, 1212, 1214, 1215],
  3: [1, 11, 2, 21, 211, 212],
  4: [1, 11, 2, 21],
}

function clone(nodes: ResourceNode[]): ResourceNode[] {
  return nodes.map((n) => ({ ...n, children: n.children ? clone(n.children) : undefined }))
}

function sortTree(nodes: ResourceNode[]) {
  nodes.sort((a, b) => a.sort - b.sort)
  nodes.forEach((n) => n.children && sortTree(n.children))
}

function findNode(nodes: ResourceNode[], id: number): ResourceNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const hit = node.children && findNode(node.children, id)
    if (hit) return hit
  }
  return undefined
}

/** 防环检查：targetId 是否位于 node 的子树中 */
function isDescendant(node: ResourceNode, targetId: number): boolean {
  if (!node.children) return false
  return node.children.some((c) => c.id === targetId || isDescendant(c, targetId))
}

function now(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

export async function fetchResourceTree(): Promise<ResourceNode[]> {
  await mockDelay()
  const data = clone(tree)
  sortTree(data)
  return data
}

export async function createResource(payload: ResourcePayload): Promise<void> {
  await mockDelay()
  const node: ResourceNode = { ...payload, id: nextId++, createdAt: now() }
  if (payload.parentId != null) {
    const parent = findNode(tree, payload.parentId)
    if (!parent) throw new Error('上级资源不存在')
    if (parent.type === 'button' || parent.type === 'api') {
      throw new Error('按钮/接口层级下不允许新增资源')
    }
    parent.children = parent.children || []
    parent.children.push(node)
  } else {
    node.parentId = null
    tree.push(node)
  }
}

export async function updateResource(payload: ResourcePayload): Promise<void> {
  await mockDelay()
  const node = findNode(tree, payload.id!)
  if (!node) throw new Error('资源不存在')
  if (payload.parentId != null) {
    if (payload.parentId === payload.id) throw new Error('上级资源不能是自身')
    const parent = findNode(tree, payload.parentId)
    if (!parent) throw new Error('上级资源不存在')
    if (isDescendant(node, payload.parentId)) throw new Error('不能移动到自身的子资源下')
    if (parent.type === 'button' || parent.type === 'api') {
      throw new Error('按钮/接口层级下不允许挂载资源')
    }
  }
  Object.assign(node, { ...payload, id: node.id })
}

export async function deleteResource(id: number): Promise<void> {
  await mockDelay(300)
  const remove = (nodes: ResourceNode[]): boolean => {
    const index = nodes.findIndex((n) => n.id === id)
    if (index !== -1) {
      if (nodes[index].children?.length) throw new Error('存在子资源，无法删除')
      nodes.splice(index, 1)
      return true
    }
    return nodes.some((n) => (n.children ? remove(n.children) : false))
  }
  if (!remove(tree)) throw new Error('资源不存在')
  // 同步清理角色授权中对已删资源的引用
  Object.keys(roleResources).forEach((roleId) => {
    roleResources[Number(roleId)] = roleResources[Number(roleId)].filter((rid) => rid !== id)
  })
}

export async function fetchRoleResourceIds(roleId: number): Promise<number[]> {
  await mockDelay()
  return [...(roleResources[roleId] || [])]
}

export async function assignRoleResources(roleId: number, resourceIds: number[]): Promise<void> {
  await mockDelay()
  roleResources[roleId] = [...resourceIds]
}
