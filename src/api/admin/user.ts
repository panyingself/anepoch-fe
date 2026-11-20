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

/** GET /api/admin/users/pageList */
export function fetchUsers(query: UserQuery): Promise<PageResult<UserItem>> {
  return get<PageResult<UserItem>>('/admin/users/pageList', { params: query })
}

/** POST /api/admin/users（后端 add 方法，使用初始密码 123456，无需前端传密码） */
export function addUser(payload: UserPayload): Promise<void> {
  return post<void>('/admin/users/add', payload)
}

/** PUT /api/admin/users（后端 editById 方法，需带 id） */
export function editUserById(payload: UserPayload): Promise<void> {
  return put<void>('/admin/users/editById', payload)
}

/** DELETE /api/admin/users?id=（后端 remove 方法） */
export function removeUser(id: number): Promise<void> {
  return del<void>('/admin/users/remove', { params: { id } })
}

/** @deprecated 请使用 addUser */
export const createUser = addUser
/** @deprecated 请使用 editUserById */
export const updateUser = editUserById
/** @deprecated 请使用 removeUser */
export const deleteUser = removeUser
