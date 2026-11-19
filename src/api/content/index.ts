/** 内容中台 - 通知消息 / 用户协议 / 短信管理（mock） */

const delay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/* ====================== 通知消息 ====================== */

export type NoticeType = 'system' | 'activity' | 'service'
export type NoticeChannel = '站内信' | '短信' | '小程序'
export type NoticeStatus = 'draft' | 'sent' | 'scheduled'

export interface NoticeItem {
  id: number
  title: string
  type: NoticeType
  channel: NoticeChannel
  target: string
  content: string
  status: NoticeStatus
  sender: string
  sentAt: string
}

export const NOTICE_TYPES: { label: string; value: NoticeType }[] = [
  { label: '系统通知', value: 'system' },
  { label: '活动通知', value: 'activity' },
  { label: '服务通知', value: 'service' },
]
export const NOTICE_CHANNELS: NoticeChannel[] = ['站内信', '短信', '小程序']
export const NOTICE_STATUS: Record<NoticeStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  sent: { label: '已发送', color: 'green' },
  scheduled: { label: '定时发送', color: 'blue' },
}

let nextNoticeId = 7
let notices: NoticeItem[] = [
  { id: 1, title: '系统维护通知', type: 'system', channel: '站内信', target: '全部用户', content: '平台将于 11 月 20 日 02:00-04:00 进行系统维护，期间部分功能不可用。', status: 'sent', sender: '超级管理员', sentAt: '2026-11-15 10:00' },
  { id: 2, title: '双十一活动开始提醒', type: 'activity', channel: '小程序', target: '全部会员', content: '双十一预热满减活动已开启，满 500 减 50，先到先得。', status: 'sent', sender: '运营人员', sentAt: '2026-11-01 09:00' },
  { id: 3, title: '积分规则调整说明', type: 'service', channel: '站内信', target: '积分用户', content: '积分有效期由 12 个月调整为 24 个月，详见用户协议。', status: 'sent', sender: '超级管理员', sentAt: '2026-10-28 14:30' },
  { id: 4, title: '年度客户答谢活动预告', type: 'activity', channel: '短信', target: 'A 级客户', content: '年度客户答谢活动 12 月开启，敬请期待专属礼遇。', status: 'scheduled', sender: '运营人员', sentAt: '2026-12-01 09:00' },
  { id: 5, title: '物流箱新品上架通知', type: 'service', channel: '小程序', target: '全部用户', content: '新品环保物流箱已上架，支持在线选型与批量询价。', status: 'draft', sender: '超级管理员', sentAt: '—' },
  { id: 6, title: '隐私政策更新提醒', type: 'system', channel: '站内信', target: '全部用户', content: '用户协议与隐私政策已更新，请前往官网查看最新版本。', status: 'sent', sender: '超级管理员', sentAt: '2026-09-30 16:00' },
]

export async function fetchNotices(params?: { keyword?: string; status?: NoticeStatus | '' }): Promise<NoticeItem[]> {
  await delay()
  let list = [...notices]
  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    list = list.filter((n) => n.title.toLowerCase().includes(kw))
  }
  if (params?.status) list = list.filter((n) => n.status === params.status)
  return list.sort((a, b) => b.id - a.id)
}

export type NoticePayload = Omit<NoticeItem, 'id' | 'sender' | 'sentAt'>

export async function createNotice(payload: NoticePayload): Promise<void> {
  await delay(200)
  if (!payload.title.trim()) throw new Error('请输入通知标题')
  const now = new Date()
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  notices.push({
    ...payload,
    title: payload.title.trim(),
    id: nextNoticeId++,
    sender: '超级管理员',
    sentAt: payload.status === 'sent' ? stamp : '—',
  })
}

export async function deleteNotice(id: number): Promise<void> {
  await delay(200)
  notices = notices.filter((n) => n.id !== id)
}

/* ====================== 用户协议 ====================== */

export type AgreementStatus = 'active' | 'draft' | 'offline'

export interface AgreementItem {
  id: number
  name: string
  version: string
  /** 适用端 */
  platform: string
  status: AgreementStatus
  content: string
  updatedBy: string
  updatedAt: string
}

export const AGREEMENT_STATUS: Record<AgreementStatus, { label: string; color: string }> = {
  active: { label: '生效中', color: 'green' },
  draft: { label: '草稿', color: 'blue' },
  offline: { label: '已下线', color: 'default' },
}
export const AGREEMENT_PLATFORMS = ['微信小程序', '网站', '抖音App', '全平台']

let nextAgreementId = 6
let agreements: AgreementItem[] = [
  { id: 1, name: '用户服务协议', version: 'v2.1', platform: '全平台', status: 'active', content: '本协议约定用户使用安创塑业平台服务时的权利与义务……', updatedBy: '超级管理员', updatedAt: '2026-10-20 11:00' },
  { id: 2, name: '隐私政策', version: 'v1.8', platform: '全平台', status: 'active', content: '我们如何收集、使用、存储与保护您的个人信息……', updatedBy: '超级管理员', updatedAt: '2026-09-30 15:40' },
  { id: 3, name: '会员服务协议', version: 'v1.3', platform: '微信小程序', status: 'active', content: '会员等级、积分与权益的说明……', updatedBy: '运营人员', updatedAt: '2026-11-02 09:20' },
  { id: 4, name: '活动参与协议', version: 'v1.0', platform: '抖音App', status: 'draft', content: '活动参与规则、奖品发放与异常处理……', updatedBy: '运营人员', updatedAt: '2026-11-10 17:10' },
  { id: 5, name: '旧版用户协议', version: 'v1.9', platform: '网站', status: 'offline', content: '历史版本，已由 v2.1 替代……', updatedBy: '超级管理员', updatedAt: '2026-05-12 10:00' },
]

export async function fetchAgreements(params?: { keyword?: string; status?: AgreementStatus | '' }): Promise<AgreementItem[]> {
  await delay()
  let list = [...agreements]
  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    list = list.filter((a) => a.name.toLowerCase().includes(kw))
  }
  if (params?.status) list = list.filter((a) => a.status === params.status)
  return list.sort((a, b) => a.id - b.id)
}

export async function toggleAgreement(id: number, status: AgreementStatus): Promise<void> {
  await delay(200)
  agreements = agreements.map((a) => (a.id === id ? { ...a, status } : a))
}

/* ====================== 短信模板 ====================== */

export type TemplateStatus = 0 | 1

export interface SmsTemplate {
  id: number
  /** 模板编码，创建后不可修改 */
  code: string
  name: string
  content: string
  status: TemplateStatus
  updatedBy: string
  updatedAt: string
}

let nextTemplateId = 6
let smsTemplates: SmsTemplate[] = [
  { id: 1, code: 'SMS_VERIFY', name: '验证码通知', content: '您的验证码为 {code}，5 分钟内有效，请勿泄露。', status: 1, updatedBy: '超级管理员', updatedAt: '2026-09-12 10:00' },
  { id: 2, code: 'SMS_ACTIVITY', name: '活动开始提醒', content: '您关注的活动已于 {time} 开启，{name}，先到先得。', status: 1, updatedBy: '运营人员', updatedAt: '2026-10-28 15:20' },
  { id: 3, code: 'SMS_LOGISTICS', name: '物流发货通知', content: '您的订单已发货，物流单号 {no}，请留意签收。', status: 1, updatedBy: '超级管理员', updatedAt: '2026-08-30 09:40' },
  { id: 4, code: 'SMS_POINTS', name: '积分到账通知', content: '您获得 {points} 积分，可在积分商城兑换礼品。', status: 1, updatedBy: '运营人员', updatedAt: '2026-11-05 11:10' },
  { id: 5, code: 'SMS_EXPIRE', name: '会员到期提醒', content: '您的会员权益将于 {date} 到期，续费可继续享受专属折扣。', status: 0, updatedBy: '超级管理员', updatedAt: '2025-12-20 16:30' },
]

export async function fetchSmsTemplates(params?: {
  keyword?: string
  status?: TemplateStatus | ''
}): Promise<SmsTemplate[]> {
  await delay()
  let list = [...smsTemplates]
  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    list = list.filter(
      (t) => t.name.toLowerCase().includes(kw) || t.code.toLowerCase().includes(kw),
    )
  }
  if (params?.status !== undefined && params.status !== '') {
    list = list.filter((t) => t.status === params.status)
  }
  return list.sort((a, b) => a.id - b.id)
}

export type SmsTemplatePayload = Pick<SmsTemplate, 'code' | 'name' | 'content' | 'status'>

function nowStamp(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export async function createSmsTemplate(payload: SmsTemplatePayload): Promise<void> {
  await delay(200)
  const code = payload.code.trim().toUpperCase()
  if (!code) throw new Error('请输入模板编码')
  if (smsTemplates.some((t) => t.code === code)) throw new Error('模板编码已存在，请更换')
  smsTemplates.push({
    ...payload,
    code,
    name: payload.name.trim(),
    content: payload.content.trim(),
    id: nextTemplateId++,
    updatedBy: '超级管理员',
    updatedAt: nowStamp(),
  })
}

export async function updateSmsTemplate(id: number, payload: SmsTemplatePayload): Promise<void> {
  await delay(200)
  const exists = smsTemplates.find((t) => t.id === id)
  if (!exists) throw new Error('短信模板不存在或已被删除')
  smsTemplates = smsTemplates.map((t) =>
    t.id === id
      ? {
          ...t,
          name: payload.name.trim(),
          content: payload.content.trim(),
          status: payload.status,
          updatedBy: '超级管理员',
          updatedAt: nowStamp(),
        }
      : t,
  )
}

export async function toggleSmsTemplate(id: number, status: TemplateStatus): Promise<void> {
  await delay(200)
  smsTemplates = smsTemplates.map((t) => (t.id === id ? { ...t, status } : t))
}

export async function deleteSmsTemplate(id: number): Promise<void> {
  await delay(200)
  smsTemplates = smsTemplates.filter((t) => t.id !== id)
}

/* ====================== 短信管理 ====================== */

export type SmsStatus = 'success' | 'failed' | 'sending'

export interface SmsRecord {
  id: number
  phone: string
  template: string
  content: string
  status: SmsStatus
  sentAt: string
  operator: string
}

export const SMS_STATUS: Record<SmsStatus, { label: string; color: string }> = {
  success: { label: '发送成功', color: 'green' },
  failed: { label: '发送失败', color: 'red' },
  sending: { label: '发送中', color: 'blue' },
}

let smsRecords: SmsRecord[] = [
  { id: 1, phone: '138****1111', template: '验证码通知', content: '您的验证码为 4821，5 分钟内有效。', status: 'success', sentAt: '2026-11-17 10:22', operator: '系统' },
  { id: 2, phone: '139****2222', template: '活动开始提醒', content: '双十一预热满减活动已开启，满 500 减 50。', status: 'success', sentAt: '2026-11-16 09:00', operator: '运营人员' },
  { id: 3, phone: '137****3333', template: '活动开始提醒', content: '双十一预热满减活动已开启，满 500 减 50。', status: 'failed', sentAt: '2026-11-16 09:00', operator: '运营人员' },
  { id: 4, phone: '136****4444', template: '物流发货通知', content: '您的订单已发货，物流单号 SF1234567890。', status: 'success', sentAt: '2026-11-15 14:35', operator: '系统' },
  { id: 5, phone: '135****5555', template: '积分到账通知', content: '您获得 500 积分，可在积分商城兑换礼品。', status: 'sending', sentAt: '2026-11-17 11:05', operator: '系统' },
]

export async function fetchSmsRecords(params?: {
  phone?: string
  template?: string
  content?: string
  status?: SmsStatus | ''
}): Promise<SmsRecord[]> {
  await delay()
  let list = [...smsRecords]
  if (params?.phone?.trim()) list = list.filter((r) => r.phone.includes(params.phone!.trim()))
  if (params?.template) list = list.filter((r) => r.template === params.template)
  if (params?.content?.trim()) {
    const kw = params.content.trim().toLowerCase()
    list = list.filter((r) => r.content.toLowerCase().includes(kw))
  }
  if (params?.status) list = list.filter((r) => r.status === params.status)
  return list.sort((a, b) => b.id - a.id)
}
