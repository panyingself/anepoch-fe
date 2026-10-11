import { mockDelay } from '../common'

export interface DeptNode {
  id: number
  parentId: number | null
  name: string
  code: string
  leader: string
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

export interface DeptPayload extends Omit<DeptNode, 'id' | 'createdAt' | 'children'> {
  id?: number
}

let nextId = 100
let tree: DeptNode[] = [
  {
    id: 1,
    parentId: null,
    name: 'AnEpoch 科技',
    code: 'ANEPOCH',
    leader: '林远',
    phone: '13800000001',
    sort: 1,
    status: 1,
    createdAt: '2024-01-01 09:00:00',
    children: [
      {
        id: 11,
        parentId: 1,
        name: '技术部',
        code: 'TECH',
        leader: '赵启明',
        phone: '13800000011',
        sort: 1,
        status: 1,
        createdAt: '2024-01-05 10:00:00',
        children: [
          { id: 111, parentId: 11, name: '前端组', code: 'TECH-FE', leader: '陈星', phone: '13800000111', sort: 1, status: 1, createdAt: '2024-02-01 10:00:00' },
          { id: 112, parentId: 11, name: '后端组', code: 'TECH-BE', leader: '周衡', phone: '13800000112', sort: 2, status: 1, createdAt: '2024-02-01 10:30:00' },
          { id: 113, parentId: 11, name: '测试组', code: 'TECH-QA', leader: '吴清', phone: '13800000113', sort: 3, status: 1, createdAt: '2024-02-02 11:00:00' },
        ],
      },
      {
        id: 12,
        parentId: 1,
        name: '产品部',
        code: 'PRODUCT',
        leader: '孙悦',
        phone: '13800000012',
        sort: 2,
        status: 1,
        createdAt: '2024-01-06 10:00:00',
        children: [
          { id: 121, parentId: 12, name: '产品设计组', code: 'PD-DESIGN', leader: '罗云', phone: '13800000121', sort: 1, status: 1, createdAt: '2024-02-10 09:30:00' },
          { id: 122, parentId: 12, name: '用户体验组', code: 'PD-UX', leader: '白露', phone: '13800000122', sort: 2, status: 1, createdAt: '2024-02-10 09:40:00' },
        ],
      },
      { id: 13, parentId: 1, name: '运营部', code: 'OPS', leader: '何静', phone: '13800000013', sort: 3, status: 1, createdAt: '2024-01-08 14:00:00' },
      { id: 14, parentId: 1, name: '市场部', code: 'MARKET', leader: '高远', phone: '13800000014', sort: 4, status: 1, createdAt: '2024-01-09 15:00:00' },
      {
        id: 15,
        parentId: 1,
        name: '职能部',
        code: 'HR',
        leader: '钱多',
        phone: '13800000015',
        sort: 5,
        status: 1,
        createdAt: '2024-01-10 16:00:00',
        children: [
          { id: 151, parentId: 15, name: '人事组', code: 'HR-PER', leader: '许晴', phone: '13800000151', sort: 1, status: 1, createdAt: '2024-03-01 09:00:00' },
          { id: 152, parentId: 15, name: '财务组', code: 'HR-FIN', leader: '宋佳', phone: '13800000152', sort: 2, status: 0, createdAt: '2024-03-01 09:10:00' },
        ],
      },
    ],
  },
]

function clone(nodes: DeptNode[]): DeptNode[] {
  return nodes.map((n) => ({ ...n, children: n.children ? clone(n.children) : undefined }))
}

function sortTree(nodes: DeptNode[]) {
  nodes.sort((a, b) => a.sort - b.sort)
  nodes.forEach((n) => n.children && sortTree(n.children))
}

function findNode(nodes: DeptNode[], id: number): DeptNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const hit = node.children && findNode(node.children, id)
    if (hit) return hit
  }
  return undefined
}

/** 防环检查：targetId 是否位于 node 的子树中 */
function isDescendant(node: DeptNode, targetId: number): boolean {
  if (!node.children) return false
  return node.children.some((c) => c.id === targetId || isDescendant(c, targetId))
}

function now(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

export async function fetchDeptTree(): Promise<DeptNode[]> {
  await mockDelay()
  const data = clone(tree)
  sortTree(data)
  return data
}

export async function createDept(payload: DeptPayload): Promise<void> {
  await mockDelay()
  const node: DeptNode = { ...payload, id: nextId++, createdAt: now() }
  if (payload.parentId != null) {
    const parent = findNode(tree, payload.parentId)
    if (!parent) throw new Error('上级组织不存在')
    parent.children = parent.children || []
    parent.children.push(node)
  } else {
    node.parentId = null
    tree.push(node)
  }
}

export async function updateDept(payload: DeptPayload): Promise<void> {
  await mockDelay()
  const node = findNode(tree, payload.id!)
  if (!node) throw new Error('组织不存在')
  if (payload.parentId != null) {
    if (payload.parentId === payload.id) throw new Error('上级组织不能是自身')
    const parent = findNode(tree, payload.parentId)
    if (!parent) throw new Error('上级组织不存在')
    if (isDescendant(node, payload.parentId)) throw new Error('不能移动到自身的子组织下')
  }
  Object.assign(node, { ...payload, id: node.id })
}

export async function deleteDept(id: number): Promise<void> {
  await mockDelay(300)
  const remove = (nodes: DeptNode[]): boolean => {
    const index = nodes.findIndex((n) => n.id === id)
    if (index !== -1) {
      if (nodes[index].children?.length) throw new Error('存在下级组织，无法删除')
      nodes.splice(index, 1)
      return true
    }
    return nodes.some((n) => (n.children ? remove(n.children) : false))
  }
  if (!remove(tree)) throw new Error('组织不存在')
}

/** 构建上级组织树选择数据（编辑时排除自身子树） */
export function buildDeptOptions(excludeId?: number): DeptOption[] {
  const build = (nodes: DeptNode[]): DeptOption[] =>
    nodes
      .filter((n) => n.id !== excludeId)
      .map((n) => {
        const option: DeptOption = { id: n.id, name: n.name }
        if (n.children?.length) option.children = build(n.children)
        return option
      })
  return build(tree)
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
  walk(tree, '')
  return map
}

// ---------- 组织成员：可在任意组织节点下直接添加 ----------
export interface DeptMember {
  id: number
  /** 所属组织 id */
  deptId: number
  name: string
  position: string
  phone: string
  email: string
  status: 0 | 1 // 1 在职 0 离职
}

let nextMemberId = 1
let members: DeptMember[] = [
  { id: nextMemberId++, deptId: 111, name: '张伟', position: '前端工程师', phone: '13900000101', email: 'zhangwei@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 111, name: '李娜', position: '前端工程师', phone: '13900000102', email: 'lina@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 112, name: '王强', position: '后端工程师', phone: '13900000103', email: 'wangqiang@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 113, name: '赵敏', position: '测试工程师', phone: '13900000104', email: 'zhaomin@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 121, name: '孙悦', position: '产品经理', phone: '13900000105', email: 'sunyue@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 13, name: '何静', position: '运营专员', phone: '13900000106', email: 'hejing@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 151, name: '许晴', position: '人事专员', phone: '13900000107', email: 'xuqing@anepoch.com', status: 1 },
  { id: nextMemberId++, deptId: 152, name: '宋佳', position: '财务专员', phone: '13900000108', email: 'songjia@anepoch.com', status: 0 },
]

export async function fetchDeptMembers(deptId: number): Promise<DeptMember[]> {
  await mockDelay()
  return members.filter((m) => m.deptId === deptId)
}

export async function createDeptMember(payload: Omit<DeptMember, 'id'>): Promise<void> {
  await mockDelay()
  if (!findNode(tree, payload.deptId)) throw new Error('所属组织不存在')
  members.push({ ...payload, id: nextMemberId++ })
}

export async function deleteDeptMember(id: number): Promise<void> {
  await mockDelay(300)
  const index = members.findIndex((m) => m.id === id)
  if (index === -1) throw new Error('成员不存在')
  members.splice(index, 1)
}
