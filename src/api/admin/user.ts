import { get, post, put, del } from '@/utils/request'
import type { PageResult } from '../common'

/** 对齐后端 UserItemResponse */
export interface UserItem {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  /** 所属组织名称 */
  dept: string
  /** RBAC：用户 → 角色 → 资源 */
  roleIds: number[]
  status: 0 | 1 // 1 启用 0 禁用
  createdAt: string
}

/** 对齐后端 UserSaveRequest */
export interface UserPayload extends Omit<UserItem, 'id' | 'createdAt'> {
  id?: number
}

export interface UserQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: number
}

/** GET /api/admin/users */
export function fetchUsers(query: UserQuery): Promise<PageResult<UserItem>> {
  return get<PageResult<UserItem>>('/admin/users', { params: query })
}

/** POST /api/admin/users（后端使用初始密码 123456，无需前端传密码） */
export function createUser(payload: UserPayload): Promise<void> {
  return post<void>('/admin/users', payload)
}

/** PUT /api/admin/users（需带 id） */
export function updateUser(payload: UserPayload): Promise<void> {
  return put<void>('/admin/users', payload)
}

/** DELETE /api/admin/users?id= */
export function deleteUser(id: number): Promise<void> {
  return del<void>('/admin/users', { params: { id } })
}
