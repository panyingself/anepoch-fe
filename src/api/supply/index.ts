/** 供应链中台 - 物料供应商管理（mock） */

const delay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export type SupplierStatus = 0 | 1
export type SupplierLevel = 'A' | 'B' | 'C'

export interface MaterialSupplier {
  id: number
  code: string
  name: string
  /** 供货品类 */
  category: string
  contact: string
  phone: string
  address: string
  level: SupplierLevel
  status: SupplierStatus
  createdAt: string
}

export const SUPPLIER_CATEGORIES = ['塑料周转箱', '物流箱', '垃圾桶', '托盘', '包装耗材']
export const SUPPLIER_LEVELS: SupplierLevel[] = ['A', 'B', 'C']

let nextId = 9
let suppliers: MaterialSupplier[] = [
  { id: 1, code: 'SUP001', name: '重庆恒塑包装有限公司', category: '塑料周转箱', contact: '张伟', phone: '13800001111', address: '重庆市九龙坡区', level: 'A', status: 1, createdAt: '2026-03-12' },
  { id: 2, code: 'SUP002', name: '成都瑞达物流箱厂', category: '物流箱', contact: '李娜', phone: '13900002222', address: '成都市新都区', level: 'A', status: 1, createdAt: '2026-04-08' },
  { id: 3, code: 'SUP003', name: '青岛绿环塑料制品', category: '垃圾桶', contact: '王强', phone: '13700003333', address: '青岛市城阳区', level: 'B', status: 1, createdAt: '2026-05-20' },
  { id: 4, code: 'SUP004', name: '苏州捷运托盘科技', category: '托盘', contact: '陈敏', phone: '13600004444', address: '苏州市工业园区', level: 'B', status: 1, createdAt: '2026-06-11' },
  { id: 5, code: 'SUP005', name: '武汉华彩包装材料', category: '包装耗材', contact: '周杰', phone: '13500005555', address: '武汉市东西湖区', level: 'C', status: 1, createdAt: '2026-07-02' },
  { id: 6, code: 'SUP006', name: '贵阳鑫盛塑料制品', category: '塑料周转箱', contact: '赵磊', phone: '13400006666', address: '贵阳市白云区', level: 'C', status: 1, createdAt: '2026-08-15' },
  { id: 7, code: 'SUP007', name: '西安中远托盘厂', category: '托盘', contact: '孙丽', phone: '13300007777', address: '西安市高陵区', level: 'B', status: 1, createdAt: '2026-09-03' },
  { id: 8, code: 'SUP008', name: '昆明滇池包装厂', category: '物流箱', contact: '吴涛', phone: '13200008888', address: '昆明市官渡区', level: 'C', status: 0, createdAt: '2026-10-18' },
]

export async function fetchMaterialSuppliers(params?: {
  keyword?: string
  status?: SupplierStatus | ''
  category?: string
}): Promise<MaterialSupplier[]> {
  await delay()
  let list = [...suppliers]
  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    list = list.filter((s) => s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw))
  }
  if (params?.status !== undefined && params.status !== '') list = list.filter((s) => s.status === params.status)
  if (params?.category) list = list.filter((s) => s.category === params.category)
  return list.sort((a, b) => a.id - b.id)
}

export type MaterialSupplierPayload = Omit<MaterialSupplier, 'id' | 'createdAt'>

export async function createMaterialSupplier(payload: MaterialSupplierPayload): Promise<void> {
  await delay(200)
  const code = payload.code.trim().toUpperCase()
  if (!code) throw new Error('请输入供应商编码')
  if (!payload.name.trim()) throw new Error('请输入供应商名称')
  if (suppliers.some((s) => s.code === code)) throw new Error('供应商编码已存在，请更换')
  const now = new Date()
  const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  suppliers.push({ ...payload, code, name: payload.name.trim(), id: nextId++, createdAt })
}

export async function updateMaterialSupplier(id: number, payload: MaterialSupplierPayload): Promise<void> {
  await delay(200)
  const exists = suppliers.find((s) => s.id === id)
  if (!exists) throw new Error('供应商不存在或已被删除')
  suppliers = suppliers.map((s) =>
    s.id === id ? { ...s, ...payload, name: payload.name.trim(), code: s.code } : s,
  )
}

export async function toggleMaterialSupplier(id: number, status: SupplierStatus): Promise<void> {
  await delay(200)
  suppliers = suppliers.map((s) => (s.id === id ? { ...s, status } : s))
}

export async function deleteMaterialSupplier(id: number): Promise<void> {
  await delay(200)
  suppliers = suppliers.filter((s) => s.id !== id)
}
