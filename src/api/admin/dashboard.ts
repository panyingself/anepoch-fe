import { mockDelay } from '../common'

export interface StatItem {
  title: string
  value: number
  precision?: number
  prefix?: string
  suffix?: string
}

export interface VisitPoint {
  day: string
  value: number
}

export interface OrderItem {
  id: number
  orderNo: string
  customer: string
  amount: number
  status: '已完成' | '待支付' | '已支付'
  createdAt: string
}

export interface DashboardData {
  stats: StatItem[]
  weeklyVisits: VisitPoint[]
  recentOrders: OrderItem[]
}

export async function fetchDashboard(): Promise<DashboardData> {
  await mockDelay(500)
  return {
    stats: [
      { title: '总用户数', value: 12864 },
      { title: '今日订单', value: 683 },
      { title: '本月销售额', value: 396482.5, precision: 2, prefix: '¥' },
      { title: '今日访问量', value: 15293 },
    ],
    weeklyVisits: [
      { day: '周一', value: 8200 },
      { day: '周二', value: 9320 },
      { day: '周三', value: 9010 },
      { day: '周四', value: 12900 },
      { day: '周五', value: 13300 },
      { day: '周六', value: 15200 },
      { day: '周日', value: 12400 },
    ],
    recentOrders: [
      { id: 1, orderNo: 'AEP20260901001', customer: '张伟', amount: 1299.0, status: '已支付', createdAt: '2026-10-09 14:23' },
      { id: 2, orderNo: 'AEP20260901002', customer: '王芳', amount: 358.5, status: '待支付', createdAt: '2026-10-09 13:47' },
      { id: 3, orderNo: 'AEP20260901003', customer: '李娜', amount: 5680.0, status: '已完成', createdAt: '2026-10-09 11:20' },
      { id: 4, orderNo: 'AEP20260901004', customer: '刘强', amount: 96.0, status: '已支付', createdAt: '2026-10-09 10:05' },
      { id: 5, orderNo: 'AEP20260901005', customer: '陈静', amount: 2048.0, status: '待支付', createdAt: '2026-10-09 09:38' },
      { id: 6, orderNo: 'AEP20260901006', customer: '杨洋', amount: 732.6, status: '已完成', createdAt: '2026-10-08 21:15' },
    ],
  }
}
