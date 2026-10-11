import { mockDelay } from '../common'

export interface DataStat {
  title: string
  value: number
  precision?: number
  suffix?: string
}

export interface TrendPoint {
  day: string
  value: number
}

export interface DataSourceItem {
  name: string
  type: string
  status: '正常' | '同步中' | '异常'
}

export interface HotTable {
  id: number
  name: string
  owner: string
  queries: number
  updatedAt: string
}

export interface DataOverviewData {
  stats: DataStat[]
  trend: TrendPoint[]
  sources: DataSourceItem[]
  hotTables: HotTable[]
}

export async function fetchDataOverview(): Promise<DataOverviewData> {
  await mockDelay(500)
  return {
    stats: [
      { title: '数据表总数', value: 1286, suffix: '张' },
      { title: '今日 API 调用量', value: 843292 },
      { title: '累计存储量', value: 2.7, precision: 1, suffix: 'TB' },
      { title: '运行中任务', value: 46, suffix: '个' },
    ],
    trend: [
      { day: '周一', value: 1.2 },
      { day: '周二', value: 1.35 },
      { day: '周三', value: 1.1 },
      { day: '周四', value: 1.6 },
      { day: '周五', value: 1.8 },
      { day: '周六', value: 2.1 },
      { day: '周日', value: 1.9 },
    ],
    sources: [
      { name: 'MySQL 主从集群', type: 'RDBMS', status: '正常' },
      { name: 'Kafka 消息队列', type: '消息队列', status: '正常' },
      { name: 'OSS 对象存储', type: '文件存储', status: '同步中' },
      { name: 'Redis 缓存集群', type: '缓存', status: '异常' },
    ],
    hotTables: [
      { id: 1, name: 'dwd_order_detail_di', owner: '张伟', queries: 12856, updatedAt: '2026-10-09 14:30' },
      { id: 2, name: 'dws_user_active_1d', owner: '王芳', queries: 9821, updatedAt: '2026-10-09 13:05' },
      { id: 3, name: 'dim_product_df', owner: '李娜', queries: 7430, updatedAt: '2026-10-09 12:40' },
      { id: 4, name: 'dwd_trade_pay_di', owner: '刘强', queries: 5312, updatedAt: '2026-10-09 11:20' },
      { id: 5, name: 'ads_growth_report', owner: '陈静', queries: 4108, updatedAt: '2026-10-09 10:00' },
    ],
  }
}
