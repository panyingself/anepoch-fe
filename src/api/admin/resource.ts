import { get, post, put, del } from '@/utils/request'

export type ResourceType = 'catalog' | 'menu' | 'button' | 'api'

export const RESOURCE_TYPE_MAP: Record<ResourceType, { label: string; color: string }> = {
  catalog: { label: '目录', color: 'purple' },
  menu: { label: '菜单', color: 'blue' },
  button: { label: '按钮', color: 'green' },
  api: { label: '接口', color: 'orange' },
}

/** 对齐后端 ResourceNodeResponse */
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

/** 对齐后端 ResourceSaveRequest */
export interface ResourcePayload extends Omit<ResourceNode, 'id' | 'createdAt' | 'children'> {
  id?: number
}

/** GET /api/admin/resources/tree */
export function fetchResourceTree(): Promise<ResourceNode[]> {
  return get<ResourceNode[]>('/admin/resources/tree')
}

/** POST /api/admin/resources/add（后端 add 方法，按钮/接口层级下后端拒绝新增） */
export function addResource(payload: ResourcePayload): Promise<void> {
  return post<void>('/admin/resources/add', payload)
}

/** PUT /api/admin/resources/editById（后端 editById 方法，需带 id，负责防环与层级校验） */
export function editResourceById(payload: ResourcePayload): Promise<void> {
  return put<void>('/admin/resources/editById', payload)
}

/** DELETE /api/admin/resources/remove?id=（后端 remove 方法） */
export function removeResource(id: number): Promise<void> {
  return del<void>('/admin/resources/remove', { params: { id } })
}

/** @deprecated 请使用 addResource */
export const createResource = addResource
/** @deprecated 请使用 editResourceById */
export const updateResource = editResourceById
/** @deprecated 请使用 removeResource */
export const deleteResource = removeResource

/** GET /api/admin/roles/{id}/resource-ids：角色已分配的资源 id 集合 */
export function fetchRoleResourceIds(roleId: number): Promise<number[]> {
  return get<number[]>(`/admin/roles/${roleId}/resource-ids`)
}

/** PUT /api/admin/roles/{id}/resources：为角色分配资源（请求体为资源 id 数组） */
export function assignRoleResources(roleId: number, resourceIds: number[]): Promise<void> {
  return put<void>(`/admin/roles/${roleId}/resources`, resourceIds)
}
