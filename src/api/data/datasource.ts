import { mockDelay } from '../common'

export interface DataConnection {
  id: number
  name: string
  /** 数据源类型 */
  type: string
  host: string
  port: number
  database: string
  owner: string
  /** 同步频率 */
  syncFrequency: '实时' | '每小时' | '每日'
  status: 0 | 1 // 1 已连接 0 已断开
  description?: string
  createdAt: string
  lastSyncAt: string
}

export type DataConnectionPayload = Omit<DataConnection, 'id' | 'createdAt' | 'lastSyncAt'>

let nextId = 9
let connections: DataConnection[] = [
  { id: 1, name: 'MySQL 主从集群', type: 'MySQL', host: '10.20.1.11', port: 3306, database: 'anepoch_order', owner: '张伟', syncFrequency: '实时', status: 1, description: '订单业务主库', createdAt: '2026-01-10 10:00', lastSyncAt: '2026-10-10 09:58' },
  { id: 2, name: 'PostgreSQL 用户库', type: 'PostgreSQL', host: '10.20.1.12', port: 5432, database: 'anepoch_user', owner: '王芳', syncFrequency: '实时', status: 1, description: '用户与权限数据', createdAt: '2026-01-12 14:30', lastSyncAt: '2026-10-10 09:57' },
  { id: 3, name: 'Kafka 埋点消息流', type: 'Kafka', host: '10.20.2.21', port: 9092, database: 'topic_user_track', owner: '李娜', syncFrequency: '实时', status: 1, description: '前端埋点事件流', createdAt: '2026-02-01 09:00', lastSyncAt: '2026-10-10 09:58' },
  { id: 4, name: 'Elasticsearch 日志集群', type: 'Elasticsearch', host: '10.20.2.31', port: 9200, database: 'logs-app-*', owner: '刘强', syncFrequency: '每小时', status: 1, description: '应用运行日志', createdAt: '2026-02-15 11:20', lastSyncAt: '2026-10-10 09:00' },
  { id: 5, name: 'OSS 对象存储', type: 'HTTP API', host: 'oss-cn-hangzhou.aliyuncs.com', port: 443, database: 'bucket-data-lake', owner: '陈静', syncFrequency: '每日', status: 0, description: '离线数据湖文件同步', createdAt: '2026-03-08 16:00', lastSyncAt: '2026-10-10 02:00' },
  { id: 6, name: 'Hive 离线数仓', type: 'Hive', host: '10.20.3.41', port: 10000, database: 'dwd_warehouse', owner: '张伟', syncFrequency: '每日', status: 1, description: 'T+1 离线分析', createdAt: '2026-03-20 09:30', lastSyncAt: '2026-10-10 01:30' },
  { id: 7, name: 'MongoDB 商品库', type: 'MongoDB', host: '10.20.1.13', port: 27017, database: 'anepoch_goods', owner: '赵敏', syncFrequency: '每小时', status: 1, description: '商品与类目数据', createdAt: '2026-04-05 13:10', lastSyncAt: '2026-10-10 09:30' },
  { id: 8, name: 'Redis 缓存集群', type: 'Redis', host: '10.20.4.51', port: 6379, database: 'db0', owner: '孙悦', syncFrequency: '实时', status: 0, description: '热点数据缓存', createdAt: '2026-04-18 10:40', lastSyncAt: '2026-10-09 23:10' },
]

export async function fetchConnections(params?: { keyword?: string; type?: string }): Promise<DataConnection[]> {
  await mockDelay()
  let list = [...connections]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.host.toLowerCase().includes(kw) ||
        (c.description || '').toLowerCase().includes(kw),
    )
  }
  if (params?.type) {
    list = list.filter((c) => c.type === params.type)
  }
  return list.sort((a, b) => a.id - b.id)
}

/** 数据源类型选项（供筛选与表单复用） */
export const CONNECTION_TYPES = [
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Kafka',
  'Elasticsearch',
  'Hive',
  'HTTP API',
] as const

export async function createConnection(payload: DataConnectionPayload): Promise<void> {
  await mockDelay()
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  connections.push({
    ...payload,
    id: nextId++,
    createdAt: stamp,
    lastSyncAt: '从未同步',
  })
}

export async function updateConnection(payload: DataConnectionPayload & { id: number }): Promise<void> {
  await mockDelay()
  const index = connections.findIndex((c) => c.id === payload.id)
  if (index === -1) throw new Error('数据源不存在')
  connections[index] = { ...connections[index], ...payload }
}

export async function deleteConnection(id: number): Promise<void> {
  await mockDelay(300)
  const index = connections.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('数据源不存在')
  connections.splice(index, 1)
}

/** 模拟连通性测试：已连接源返回正常，断开源返回失败 */
export async function testConnection(id: number): Promise<string> {
  await mockDelay(900)
  const target = connections.find((c) => c.id === id)
  if (!target) throw new Error('数据源不存在')
  if (target.status === 1) {
    return `连接正常，耗时 ${(40 + (id % 7) * 12)}ms`
  }
  throw new Error(`连接失败：${target.host}:${target.port} 不可达`)
}
