import { mockDelay } from '../common'
import type { PageResult } from '../common'

export interface UserItem {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  dept: string
  /** RBAC：用户 → 角色 → 资源 */
  roleIds: number[]
  status: 0 | 1 // 1 启用 0 禁用
  createdAt: string
}

export interface UserPayload extends Omit<UserItem, 'id' | 'createdAt'> {
  id?: number
}

export interface UserQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: number | undefined
}

const DEPTS = ['前端组', '后端组', '测试组', '产品设计组', '用户体验组', '运营部', '市场部', '人事组', '财务组']
const NICKNAMES = [
  '张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵敏', '黄磊',
  '周杰', '吴磊', '徐婷', '孙悦', '马超', '朱琳', '胡军', '郭涛',
  '林峰', '何洁', '高翔', '罗丹',
]

let nextId = 1
const ROLE_POOL = [[1, 2], [2], [3], [4], [1, 3], [2, 4]]
const users: UserItem[] = NICKNAMES.map((nickname, index) => ({
  id: nextId++,
  username: `user${String(index + 1).padStart(3, '0')}`,
  nickname,
  email: `user${index + 1}@anepoch.com`,
  phone: `138${String(10000000 + index * 37).slice(0, 8)}`,
  dept: DEPTS[index % DEPTS.length],
  roleIds: [...ROLE_POOL[index % ROLE_POOL.length]],
  status: index % 7 === 3 ? 0 : 1,
  createdAt: `2026-0${(index % 8) + 1}-${String((index % 27) + 1).padStart(2, '0')} 09:${String((index * 13) % 60).padStart(2, '0')}`,
}))

export async function fetchUsers(query: UserQuery): Promise<PageResult<UserItem>> {
  await mockDelay()
  const { page, pageSize, keyword, status } = query
  let list = [...users]
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.nickname.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw),
    )
  }
  if (status !== undefined && status !== null) {
    list = list.filter((u) => u.status === status)
  }
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export async function createUser(payload: UserPayload): Promise<void> {
  await mockDelay()
  if (users.some((u) => u.username === payload.username)) {
    throw new Error('用户名已存在')
  }
  users.unshift({
    ...payload,
    id: nextId++,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
}

export async function updateUser(payload: UserPayload): Promise<void> {
  await mockDelay()
  const index = users.findIndex((u) => u.id === payload.id)
  if (index === -1) {
    throw new Error('用户不存在')
  }
  users[index] = { ...users[index], ...payload } as UserItem
}

export async function deleteUser(id: number): Promise<void> {
  await mockDelay(300)
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) {
    throw new Error('用户不存在')
  }
  users.splice(index, 1)
}
