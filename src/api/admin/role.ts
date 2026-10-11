import { mockDelay } from '../common'

export interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  status: 0 | 1 // 1 启用 0 禁用
  createdAt: string
}

export interface RolePayload extends Omit<RoleItem, 'createdAt'> {
  id?: number
}

let nextId = 6
const roles: RoleItem[] = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统全部权限', status: 1, createdAt: '2026-01-05 10:00' },
  { id: 2, name: '运营人员', code: 'operator', description: '负责日常内容与数据运营', status: 1, createdAt: '2026-01-12 14:30' },
  { id: 3, name: '产品经理', code: 'product', description: '可查看产品相关数据与报表', status: 1, createdAt: '2026-02-03 09:20' },
  { id: 4, name: '只读访客', code: 'viewer', description: '仅可查看，不可修改数据', status: 1, createdAt: '2026-03-18 16:45' },
  { id: 5, name: '财务专员', code: 'finance', description: '负责订单与结算数据管理', status: 0, createdAt: '2026-04-22 11:10' },
]

export async function fetchRoles(): Promise<RoleItem[]> {
  await mockDelay()
  return [...roles]
}

export async function createRole(payload: RolePayload): Promise<void> {
  await mockDelay()
  if (roles.some((r) => r.code === payload.code)) {
    throw new Error('角色编码已存在')
  }
  roles.unshift({
    ...payload,
    id: nextId++,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
}

export async function updateRole(payload: RolePayload): Promise<void> {
  await mockDelay()
  const index = roles.findIndex((r) => r.id === payload.id)
  if (index === -1) {
    throw new Error('角色不存在')
  }
  roles[index] = { ...roles[index], ...payload } as RoleItem
}

export async function deleteRole(id: number): Promise<void> {
  await mockDelay(300)
  const index = roles.findIndex((r) => r.id === id)
  if (index === -1) {
    throw new Error('角色不存在')
  }
  roles.splice(index, 1)
}
