import { get, post, put, del } from '@/utils/request'

/** 对齐后端 DeptNodeResponse */
export interface DeptNode {
  id: number
  parentId: number | null
  name: string
  code: string
  /** 后端 organization_info 暂无该列，恒为空字符串 */
  leader: string
  /** 后端 organization_info 暂无该列，恒为空字符串 */
  phone: string
  sort: number
  status: 0 | 1 // 1 启用 0 禁用
  createdAt: string
  children?: DeptNode[]
}

export interface DeptOption {
  id: number
  name: string
  children?: DeptOption[]
}

/** 对齐后端 DeptSaveRequest */
export interface DeptPayload extends Omit<DeptNode, 'id' | 'createdAt' | 'children'> {
  id?: number
}

/**
 * 组织树本地缓存：供 buildDeptOptions / flattenDeptNames 这类同步派生工具使用，
 * 由 fetchDeptTree 刷新（各页面在增删改后都会重新拉取组织树）。
 */
let treeCache: DeptNode[] = []

/** GET /api/admin/depts/tree */
export async function fetchDeptTree(): Promise<DeptNode[]> {
  const data = await get<DeptNode[]>('/admin/depts/tree')
  treeCache = data
  return data
}

/** POST /api/admin/depts（parentId 为 null 表示根节点） */
export function createDept(payload: DeptPayload): Promise<void> {
  return post<void>('/admin/depts', payload)
}

/** PUT /api/admin/depts（需带 id，后端负责防环校验） */
export function updateDept(payload: DeptPayload): Promise<void> {
  return put<void>('/admin/depts', payload)
}

/** DELETE /api/admin/depts?id=（存在下级组织时后端拒绝） */
export function deleteDept(id: number): Promise<void> {
  return del<void>('/admin/depts', { params: { id } })
}

/** 构建上级组织树选择数据（编辑时排除自身及其子树） */
export function buildDeptOptions(excludeId?: number): DeptOption[] {
  const excluded = excludeId == null ? new Set<number>() : collectSubtreeIds(treeCache, excludeId)
  return buildOptions(treeCache, excluded)
}

function collectSubtreeIds(nodes: DeptNode[], rootId: number): Set<number> {
  const ids = new Set<number>()
  const walk = (list: DeptNode[]) => {
    list.forEach((n) => {
      ids.add(n.id)
      if (n.children) walk(n.children)
    })
  }
  const find = (list: DeptNode[]): DeptNode | undefined => {
    for (const node of list) {
      if (node.id === rootId) return node
      const hit = node.children && find(node.children)
      if (hit) return hit
    }
    return undefined
  }
  const root = find(nodes)
  if (root) walk([root])
  return ids
}

function buildOptions(nodes: DeptNode[], excluded: Set<number>): DeptOption[] {
  return nodes
    .filter((n) => !excluded.has(n.id))
    .map((n) => {
      const option: DeptOption = { id: n.id, name: n.name }
      if (n.children?.length) {
        const children = buildOptions(n.children, excluded)
        if (children.length) option.children = children
      }
      return option
    })
}

/** id → 完整层级名称（如「技术部 / 前端组」） */
export function flattenDeptNames(): Record<number, string> {
  const map: Record<number, string> = {}
  const walk = (nodes: DeptNode[], prefix: string) => {
    nodes.forEach((n) => {
      const path = prefix ? `${prefix} / ${n.name}` : n.name
      map[n.id] = path
      if (n.children) walk(n.children, path)
    })
  }
  walk(treeCache, '')
  return map
}

// ---------- 组织成员：可在任意组织节点下直接添加 ----------
/** 对齐后端 DeptMemberResponse */
export interface DeptMember {
  id: number
  /** 所属组织 id（仅用于拼接接口路径，不参与请求体） */
  deptId: number
  name: string
  position: string
  phone: string
  email: string
  status: 0 | 1 // 1 在职 0 离职
}

/** GET /api/admin/depts/{id}/members */
export function fetchDeptMembers(deptId: number): Promise<DeptMember[]> {
  return get<DeptMember[]>(`/admin/depts/${deptId}/members`)
}

/** POST /api/admin/depts/{id}/members（对齐 DeptMemberSaveRequest，不含 deptId） */
export function createDeptMember(payload: Omit<DeptMember, 'id'>): Promise<void> {
  const { deptId, ...body } = payload
  return post<void>(`/admin/depts/${deptId}/members`, body)
}

/** DELETE /api/admin/dept-members/{memberId} */
export function deleteDeptMember(id: number): Promise<void> {
  return del<void>(`/admin/dept-members/${id}`)
}
