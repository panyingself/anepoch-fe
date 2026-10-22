import { get, post, put, del } from '@/utils/request'

/** 对齐后端 RoleItemResponse */
export interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  status: 0 | 1 // 1 启用 0 禁用
  createdAt: string
}

/** 对齐后端 RoleSaveRequest */
export interface RolePayload extends Omit<RoleItem, 'createdAt'> {
  id?: number
}

/** GET /api/admin/roles */
export function fetchRoles(): Promise<RoleItem[]> {
  return get<RoleItem[]>('/admin/roles')
}

/** POST /api/admin/roles */
export function createRole(payload: RolePayload): Promise<void> {
  return post<void>('/admin/roles', payload)
}

/** PUT /api/admin/roles（需带 id） */
export function updateRole(payload: RolePayload): Promise<void> {
  return put<void>('/admin/roles', payload)
}

/** DELETE /api/admin/roles?id= */
export function deleteRole(id: number): Promise<void> {
  return del<void>('/admin/roles', { params: { id } })
}
