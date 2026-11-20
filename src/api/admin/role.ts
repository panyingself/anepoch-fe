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

/** GET /api/admin/roles/list */
export function fetchRoles(): Promise<RoleItem[]> {
  return get<RoleItem[]>('/admin/roles/list')
}

/** POST /api/admin/roles（后端 add 方法） */
export function addRole(payload: RolePayload): Promise<void> {
  return post<void>('/admin/roles/add', payload)
}

/** PUT /api/admin/roles（后端 editById 方法，需带 id） */
export function editRoleById(payload: RolePayload): Promise<void> {
  return put<void>('/admin/roles/editById', payload)
}

/** DELETE /api/admin/roles?id=（后端 remove 方法） */
export function removeRole(id: number): Promise<void> {
  return del<void>('/admin/roles/remove', { params: { id } })
}

/** @deprecated 请使用 addRole */
export const createRole = addRole
/** @deprecated 请使用 editRoleById */
export const updateRole = editRoleById
/** @deprecated 请使用 removeRole */
export const deleteRole = removeRole
