import { mockDelay } from '../common'

/* ====================== 中台首页 ====================== */

export interface MarketingStat {
  title: string
  value: number
  suffix?: string
  trend: number
}

export interface MarketingTrendPoint {
  day: string
  value: number
}

export interface ChannelPerformance {
  id: number
  name: string
  type: string
  exposure: number
  conversion: number
  roi: number
}

export interface MarketingOverview {
  stats: MarketingStat[]
  trend: MarketingTrendPoint[]
  channels: ChannelPerformance[]
}

const overviewMock: MarketingOverview = {
  stats: [
    { title: '进行中活动', value: 12, suffix: '个', trend: 8.4 },
    { title: '活动曝光量', value: 286, suffix: '万', trend: 12.6 },
    { title: '券核销率', value: 63.2, suffix: '%', trend: 4.1 },
    { title: '营销 ROI', value: 3.8, suffix: '', trend: -2.3 },
  ],
  trend: [
    { day: '周一', value: 32 },
    { day: '周二', value: 41 },
    { day: '周三', value: 38 },
    { day: '周四', value: 47 },
    { day: '周五', value: 56 },
    { day: '周六', value: 62 },
    { day: '周日', value: 54 },
  ],
  channels: [
    { id: 1, name: '站内首页 Banner', type: '站内', exposure: 86, conversion: 12.4, roi: 4.6 },
    { id: 2, name: '短信触达', type: '短信', exposure: 42, conversion: 8.2, roi: 3.1 },
    { id: 3, name: '企业微信社群', type: '私域', exposure: 65, conversion: 16.8, roi: 5.2 },
    { id: 4, name: '信息流广告', type: '外部', exposure: 120, conversion: 3.6, roi: 1.9 },
  ],
}

export async function fetchMarketingOverview(): Promise<MarketingOverview> {
  await mockDelay()
  return { ...overviewMock, stats: [...overviewMock.stats], channels: [...overviewMock.channels] }
}

/* ====================== 活动模板配置（适配微信小程序活动） ====================== */

export interface TemplateConfig {
  /** 游戏互动页 */
  interactive: {
    title: string
    gameType: string
    backgroundImage: string
    startText: string
    endText: string
    buttonText: string
    enabled: boolean
  }
  /** 活动规则弹窗 */
  rules: {
    title: string
    content: string
    buttonText: string
    autoPopup: boolean
  }
  /** 领奖中心 */
  prizeCenter: {
    title: string
    description: string
    buttonText: string
    expiredTip: string
  }
  /** 异常提示框 */
  exception: {
    title: string
    content: string
    buttonText: string
    type: string
  }
  /** 中奖弹窗 */
  winPopup: {
    title: string
    subtitle: string
    buttonText: string
    showPrizeImage: boolean
  }
  /** 分享配置 */
  share: {
    title: string
    description: string
    imageUrl: string
    path: string
  }
}

export const GAME_TYPES = ['大转盘', '刮刮卡', '抽奖箱', '翻牌抽奖']
export const EXCEPTION_TYPES = ['奖品已领完', '活动未开始', '活动已结束', '网络异常']

function defaultTemplateConfig(name: string): TemplateConfig {
  return {
    interactive: {
      title: `${name} · 互动抽奖`,
      gameType: GAME_TYPES[0],
      backgroundImage: '',
      startText: '点击开始抽奖',
      endText: '今日机会已用完',
      buttonText: '立即参与',
      enabled: true,
    },
    rules: {
      title: '活动规则',
      content: '1. 活动期间每位用户每日可参与 3 次；\n2. 奖品数量有限，先到先得；\n3. 奖品将在活动结束后 7 个工作日内发放；\n4. 本活动最终解释权归主办方所有。',
      buttonText: '我知道了',
      autoPopup: true,
    },
    prizeCenter: {
      title: '我的奖品',
      description: '中奖后请及时填写收货信息，逾期未领取视为自动放弃。',
      buttonText: '立即领取',
      expiredTip: '该奖品已超过领取期限',
    },
    exception: {
      title: '温馨提示',
      content: '当前奖品已被领完，可关注后续活动场次。',
      buttonText: '返回活动',
      type: EXCEPTION_TYPES[0],
    },
    winPopup: {
      title: '恭喜中奖',
      subtitle: '奖品已存入「我的奖品」，请及时领取',
      buttonText: '查看奖品',
      showPrizeImage: true,
    },
    share: {
      title: '一起来参与绿色好礼活动',
      description: '邀好友一起抽奖，双方均可获得额外机会',
      imageUrl: '',
      path: 'pages/activity/index',
    },
  }
}

/** 活动平台列表 */
export const ACTIVITY_PLATFORMS = ['微信小程序', '抖音App', '小红书', '微信H5', '支付宝小程序']

/** 平台配置模板元信息（内置 5 个平台各一套，支持新增自定义模板） */
export interface PlatformConfigTemplate {
  id: number
  platform: string
  name: string
  description: string
  /** 配置项数量 */
  itemCount: number
  /** 关联活动模板数量（同平台模板数） */
  templateCount: number
  status: 0 | 1
  updatedAt: string
  /** 内置模板（跟随平台固定生成），不可删除 */
  builtin: boolean
}

interface ConfigTemplateRecord {
  id: number
  platform: string
  name: string
  description: string
  status: 0 | 1
  config: TemplateConfig
  updatedAt: string
  builtin: boolean
}

const CONFIG_STORAGE_KEY = 'anepoch_marketing_config_template_list'
/** 旧版本按平台存储的配置，首次使用时迁移到内置模板 */
const LEGACY_CONFIG_KEY = 'anepoch_marketing_platform_configs'

const PLATFORM_DESC: Record<string, string> = {
  微信小程序: '适配微信小程序活动页，含分享卡片与转发路径',
  抖音App: '适配抖音小程序活动页，含短视频分享配置',
  小红书: '适配小红书活动页，含笔记分享配置',
  微信H5: '适配微信 H5 活动页，含公众号分享配置',
  支付宝小程序: '适配支付宝小程序活动页，含生活号分享配置',
}

/** 平台配置模板名称 */
export function platformConfigTemplateName(platform: string): string {
  return `${platform}活动配置模板`
}

function nowStamp(): string {
  const now = new Date()
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return `${d} ${t}`
}

function buildDefaultRecords(): ConfigTemplateRecord[] {
  let legacy: Record<string, { config?: TemplateConfig }> = {}
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_CONFIG_KEY) || '{}')
  } catch {
    legacy = {}
  }
  return ACTIVITY_PLATFORMS.map((platform, i) => {
    const name = platformConfigTemplateName(platform)
    return {
      id: i + 1,
      platform,
      name,
      description: PLATFORM_DESC[platform] ?? '',
      status: 1 as const,
      config: legacy[platform]?.config
        ? (JSON.parse(JSON.stringify(legacy[platform].config)) as TemplateConfig)
        : defaultTemplateConfig(name),
      updatedAt: nowStamp(),
      builtin: true,
    }
  })
}

function loadConfigTemplates(): ConfigTemplateRecord[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY) || 'null')
    if (Array.isArray(saved) && saved.length) return saved as ConfigTemplateRecord[]
  } catch {
    /* ignore */
  }
  const records = buildDefaultRecords()
  persistConfigTemplates(records)
  return records
}

const configTemplates: ConfigTemplateRecord[] = loadConfigTemplates()
let nextConfigTemplateId = Math.max(...configTemplates.map((t) => t.id)) + 1

function persistConfigTemplates(records: ConfigTemplateRecord[] = configTemplates) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(records))
}

/** 活动配置模板列表 */
export async function fetchPlatformConfigTemplates(): Promise<PlatformConfigTemplate[]> {
  await mockDelay()
  const activityTemplates = await fetchCampaignTemplates()
  return configTemplates.map((t) => ({
    id: t.id,
    platform: t.platform,
    name: t.name,
    description: t.description,
    itemCount: 6,
    templateCount: activityTemplates.filter((a) => a.platform === t.platform).length,
    status: t.status,
    updatedAt: t.updatedAt,
    builtin: t.builtin,
  }))
}

/** 按平台取默认（内置且启用）配置模板，供活动模板配置入口使用 */
export async function fetchPlatformConfigDetail(platform: string): Promise<{
  id: number
  platform: string
  name: string
  description: string
  config: TemplateConfig
  updatedAt: string
}> {
  await mockDelay()
  const record =
    configTemplates.find((t) => t.platform === platform && t.builtin && t.status === 1) ??
    configTemplates.find((t) => t.platform === platform) ??
    configTemplates[0]
  return {
    id: record.id,
    platform: record.platform,
    name: record.name,
    description: record.description,
    config: JSON.parse(JSON.stringify(record.config)) as TemplateConfig,
    updatedAt: record.updatedAt,
  }
}

/** 按 id 读取配置模板 */
export async function fetchConfigTemplateById(id: number): Promise<{
  id: number
  platform: string
  name: string
  description: string
  status: 0 | 1
  config: TemplateConfig
  updatedAt: string
  builtin: boolean
}> {
  await mockDelay()
  const record = configTemplates.find((t) => t.id === id)
  if (!record) throw new Error('配置模板不存在或已被删除')
  return {
    id: record.id,
    platform: record.platform,
    name: record.name,
    description: record.description,
    status: record.status,
    config: JSON.parse(JSON.stringify(record.config)) as TemplateConfig,
    updatedAt: record.updatedAt,
    builtin: record.builtin,
  }
}

/** 按 id 保存配置模板内容 */
export async function saveConfigTemplate(id: number, config: TemplateConfig): Promise<void> {
  await mockDelay(300)
  const record = configTemplates.find((t) => t.id === id)
  if (!record) throw new Error('配置模板不存在或已被删除')
  record.config = JSON.parse(JSON.stringify(config)) as TemplateConfig
  record.updatedAt = nowStamp()
  persistConfigTemplates()
}

export interface ConfigTemplateCreatePayload {
  platform: string
  name: string
  description: string
  status: 0 | 1
}

/** 新增活动配置模板 */
export async function createConfigTemplate(payload: ConfigTemplateCreatePayload): Promise<void> {
  await mockDelay(200)
  const name = payload.name.trim()
  if (!name) throw new Error('请输入配置模板名称')
  if (configTemplates.some((t) => t.platform === payload.platform && t.name === name)) {
    throw new Error('该平台下已存在同名配置模板')
  }
  configTemplates.push({
    id: nextConfigTemplateId++,
    platform: payload.platform,
    name,
    description: payload.description.trim() || PLATFORM_DESC[payload.platform] || '',
    status: payload.status,
    config: defaultTemplateConfig(name),
    updatedAt: nowStamp(),
    builtin: false,
  })
  persistConfigTemplates()
}

export interface ConfigTemplateUpdatePayload {
  name: string
  description: string
  status: 0 | 1
}

/** 编辑配置模板基本信息（名称 / 说明 / 状态） */
export async function updateConfigTemplate(id: number, payload: ConfigTemplateUpdatePayload): Promise<void> {
  await mockDelay(200)
  const record = configTemplates.find((t) => t.id === id)
  if (!record) throw new Error('配置模板不存在或已被删除')
  const name = payload.name.trim()
  if (!name) throw new Error('请输入配置模板名称')
  const duplicated = configTemplates.some((t) => t.id !== id && t.platform === record.platform && t.name === name)
  if (duplicated) throw new Error('该平台下已存在同名配置模板')
  record.name = name
  record.description = payload.description.trim()
  record.status = payload.status
  record.updatedAt = nowStamp()
  persistConfigTemplates()
}

/** 删除配置模板（内置模板不可删除） */
export async function deleteConfigTemplate(id: number): Promise<void> {
  await mockDelay(200)
  const index = configTemplates.findIndex((t) => t.id === id)
  if (index < 0) throw new Error('配置模板不存在或已被删除')
  if (configTemplates[index].builtin) throw new Error('内置配置模板不可删除')
  configTemplates.splice(index, 1)
  persistConfigTemplates()
}

/**
 * 活动模板详情：按模板所选活动平台，匹配对应的平台配置模板。
 */
export async function fetchCampaignTemplateDetail(id: number): Promise<{
  template: CampaignTemplate
  platformTemplate: { id: number; platform: string; name: string; description: string; config: TemplateConfig; updatedAt: string }
}> {
  await mockDelay()
  const template = templates.find((t) => t.id === id)
  if (!template) throw new Error('模板不存在或已被删除')
  const platformTemplate = await fetchPlatformConfigDetail(template.platform)
  return { template: { ...template }, platformTemplate }
}

/* ====================== 活动列表 ====================== */

export type CampaignStatus = 'running' | 'pending' | 'ended'

/** 活动关联物料（兑换券 / 折扣券 / 积分） */
export interface CampaignMaterialLink {
  /** 唯一键：`${kind}:${materialId}` */
  key: string
  kind: MaterialKind | 'points'
  materialId: number
  /** 物料名称快照 */
  name: string
  /** 本活动计划发放数量（积分则为积分数） */
  quantity: number
}

export interface Campaign {
  id: number
  name: string
  type: string
  channel: string
  startAt: string
  endAt: string
  budget: number
  status: CampaignStatus
  /** 关联物料 */
  materials: CampaignMaterialLink[]
}

export type CampaignPayload = Omit<Campaign, 'id' | 'materials'>

export const CAMPAIGN_TYPES = ['满减促销', '新品首发', '会员专享', '拉新裂变', '节日大促']
export const CAMPAIGN_CHANNELS = ['站内', '短信', '私域', '外部']

let nextCampaignId = 9
let campaigns: Campaign[] = [
  {
    id: 1, name: '双十一预热满减', type: '满减促销', channel: '站内', startAt: '2026-11-01', endAt: '2026-11-10', budget: 180000, status: 'running',
    materials: [
      { key: 'exchange:1', kind: 'exchange', materialId: 1, name: '满 500 减 50 兑换券', quantity: 6000 },
      { key: 'discount:6', kind: 'discount', materialId: 6, name: '大促全场 8.5 折券', quantity: 8000 },
    ],
  },
  {
    id: 2, name: '新品环保箱首发', type: '新品首发', channel: '私域', startAt: '2026-11-05', endAt: '2026-11-20', budget: 60000, status: 'running',
    materials: [
      { key: 'exchange:2', kind: 'exchange', materialId: 2, name: '新人无门槛兑换券', quantity: 3000 },
      { key: 'points:0', kind: 'points', materialId: 0, name: '积分奖励', quantity: 50000 },
    ],
  },
  { id: 3, name: '会员日双倍积分', type: '会员专享', channel: '短信', startAt: '2026-11-12', endAt: '2026-11-15', budget: 30000, status: 'pending', materials: [{ key: 'points:0', kind: 'points', materialId: 0, name: '积分奖励', quantity: 20000 }] },
  {
    id: 4, name: '老带新裂变返券', type: '拉新裂变', channel: '私域', startAt: '2026-10-20', endAt: '2026-11-30', budget: 90000, status: 'running',
    materials: [
      { key: 'exchange:4', kind: 'exchange', materialId: 4, name: '物流箱回购兑换券', quantity: 5000 },
      { key: 'points:0', kind: 'points', materialId: 0, name: '积分奖励', quantity: 120000 },
    ],
  },
  {
    id: 5, name: '国庆物流箱专场', type: '节日大促', channel: '外部', startAt: '2026-09-28', endAt: '2026-10-07', budget: 150000, status: 'ended',
    materials: [
      { key: 'discount:8', kind: 'discount', materialId: 8, name: '国庆限定 8 折券', quantity: 4000 },
    ],
  },
  { id: 6, name: '仓储器具清仓', type: '满减促销', channel: '站内', startAt: '2026-10-01', endAt: '2026-10-15', budget: 40000, status: 'ended', materials: [{ key: 'points:0', kind: 'points', materialId: 0, name: '积分奖励', quantity: 8000 }] },
  { id: 7, name: '年度客户答谢', type: '会员专享', channel: '短信', startAt: '2026-12-01', endAt: '2026-12-31', budget: 120000, status: 'pending', materials: [{ key: 'points:0', kind: 'points', materialId: 0, name: '积分奖励', quantity: 30000 }] },
  { id: 8, name: '绿色包装联合推广', type: '拉新裂变', channel: '外部', startAt: '2026-11-18', endAt: '2026-12-20', budget: 75000, status: 'pending', materials: [{ key: 'points:0', kind: 'points', materialId: 0, name: '积分奖励', quantity: 15000 }] },
]

export async function fetchCampaigns(params?: { keyword?: string; status?: CampaignStatus | '' }): Promise<Campaign[]> {
  await mockDelay()
  let list = [...campaigns]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(kw) || c.type.includes(kw))
  }
  if (params?.status) list = list.filter((c) => c.status === params.status)
  return list.sort((a, b) => a.id - b.id).map((c) => ({ ...c, materials: [...c.materials] }))
}

export async function createCampaign(payload: CampaignPayload): Promise<void> {
  await mockDelay(200)
  campaigns = [{ ...payload, id: nextCampaignId++, materials: [] }, ...campaigns]
}

export async function updateCampaign(id: number, payload: CampaignPayload): Promise<void> {
  await mockDelay(200)
  campaigns = campaigns.map((c) => (c.id === id ? { ...payload, id, materials: c.materials } : c))
}

export async function deleteCampaign(id: number): Promise<void> {
  await mockDelay(200)
  campaigns = campaigns.filter((c) => c.id !== id)
}

/** 读取活动已关联的物料 */
export async function fetchCampaignMaterials(campaignId: number): Promise<CampaignMaterialLink[]> {
  await mockDelay()
  const campaign = campaigns.find((c) => c.id === campaignId)
  if (!campaign) throw new Error('活动不存在或已被删除')
  return campaign.materials.map((m) => ({ ...m }))
}

/** 保存活动关联物料（会校验数量与重复物料） */
export async function saveCampaignMaterials(
  campaignId: number,
  materials: CampaignMaterialLink[],
): Promise<void> {
  await mockDelay(200)
  const campaign = campaigns.find((c) => c.id === campaignId)
  if (!campaign) throw new Error('活动不存在或已被删除')
  const keys = new Set<string>()
  for (const m of materials) {
    if (keys.has(m.key)) throw new Error(`物料「${m.name}」重复关联`)
    keys.add(m.key)
    if (!Number.isFinite(m.quantity) || m.quantity <= 0) {
      throw new Error(`物料「${m.name}」的发放数量需大于 0`)
    }
  }
  campaign.materials = materials.map((m) => ({ ...m }))
}

/** 引用该物料的活动中，未结束的数量 */
export function activeCampaignsUsingMaterial(kind: MaterialKind | 'points', materialId: number): string[] {
  return campaigns
    .filter((c) => c.status !== 'ended' && c.materials.some((m) => m.kind === kind && m.materialId === materialId))
    .map((c) => c.name)
}

/* ====================== 活动模板管理 ====================== */

export interface CampaignTemplate {
  id: number
  /** 模板编码 */
  code: string
  name: string
  type: string
  /** 活动平台：微信小程序 / 抖音App / 小红书 等 */
  platform: string
  /** 适用场景描述 */
  scene: string
  /** 引用次数 */
  usedCount: number
  status: 0 | 1
  createdAt: string
  createdBy: string
  updatedBy: string
  updatedAt: string
}

let nextTemplateId = 7
let templates: CampaignTemplate[] = [
  { id: 1, code: 'TPL_FULL_REDUCTION', name: '通用满减模板', type: '满减促销', platform: '微信小程序', scene: '全场满额立减，适合大促预热', usedCount: 26, status: 1, createdAt: '2026-03-12 09:30', createdBy: '张伟', updatedBy: '张伟', updatedAt: '2026-11-02 10:20' },
  { id: 2, code: 'TPL_NEW_ARRIVAL', name: '新品首发模板', type: '新品首发', platform: '抖音App', scene: '新品上架限时尝鲜价', usedCount: 14, status: 1, createdAt: '2026-04-08 14:10', createdBy: '王芳', updatedBy: '李娜', updatedAt: '2026-10-28 15:40' },
  { id: 3, code: 'TPL_MEMBER_DAY', name: '会员日模板', type: '会员专享', platform: '微信小程序', scene: '会员日双倍积分 + 专享券', usedCount: 9, status: 1, createdAt: '2026-05-16 11:05', createdBy: '李娜', updatedBy: '李娜', updatedAt: '2026-10-20 09:10' },
  { id: 4, code: 'TPL_REFERRAL', name: '老带新裂变模板', type: '拉新裂变', platform: '小红书', scene: '邀请好友注册双向返券', usedCount: 18, status: 1, createdAt: '2026-06-20 16:40', createdBy: '刘强', updatedBy: '王芳', updatedAt: '2026-10-12 14:05' },
  { id: 5, code: 'TPL_FESTIVAL', name: '节日大促模板', type: '节日大促', platform: '微信H5', scene: '节日限定组合优惠', usedCount: 7, status: 1, createdAt: '2026-07-28 10:15', createdBy: '陈静', updatedBy: '陈静', updatedAt: '2026-09-25 11:30' },
  { id: 6, code: 'TPL_CLEARANCE', name: '清仓特惠模板', type: '满减促销', platform: '微信小程序', scene: '库存清仓阶梯折扣', usedCount: 3, status: 0, createdAt: '2026-08-30 15:20', createdBy: '赵敏', updatedBy: '赵敏', updatedAt: '2026-09-08 16:50' },
]

export async function fetchCampaignTemplates(params?: { keyword?: string }): Promise<CampaignTemplate[]> {
  await mockDelay()
  let list = [...templates]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.code.toLowerCase().includes(kw) ||
        t.type.includes(kw) ||
        t.platform.includes(kw),
    )
  }
  return list.sort((a, b) => a.id - b.id)
}

export type CampaignTemplatePayload = Pick<
  CampaignTemplate,
  'name' | 'type' | 'platform' | 'scene' | 'status'
>
export type CampaignTemplateCreatePayload = Pick<
  CampaignTemplate,
  'code' | 'name' | 'type' | 'platform' | 'scene' | 'status'
>

export async function createCampaignTemplate(payload: CampaignTemplateCreatePayload): Promise<void> {
  await mockDelay(200)
  const now = new Date()
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const exists = templates.some((t) => t.code === payload.code)
  if (exists) throw new Error('模板编码已存在，请更换')
  templates = [
    ...templates,
    {
      ...payload,
      id: nextTemplateId++,
      usedCount: 0,
      createdAt: stamp,
      createdBy: '超级管理员',
      updatedBy: '超级管理员',
      updatedAt: stamp,
    },
  ]
}

export async function updateCampaignTemplate(id: number, payload: CampaignTemplatePayload): Promise<void> {
  await mockDelay(200)
  const now = new Date()
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  templates = templates.map((t) => (t.id === id ? { ...t, ...payload, updatedBy: '超级管理员', updatedAt: stamp } : t))
}

export async function toggleTemplateStatus(id: number, status: 0 | 1): Promise<void> {
  await mockDelay(200)
  templates = templates.map((t) => (t.id === id ? { ...t, status } : t))
}

export async function deleteTemplate(id: number): Promise<void> {
  await mockDelay(200)
  templates = templates.filter((t) => t.id !== id)
}

/* ====================== 物料管理：兑换券 / 折扣券 ====================== */

export type MaterialKind = 'exchange' | 'discount'
export type CouponStatus = 0 | 1

export interface MaterialCoupon {
  id: number
  kind: MaterialKind
  name: string
  /** 兑换券=面额（元）；折扣券=折扣（如 8.5 表示 8.5 折） */
  value: number
  /** 使用门槛（元，0 表示无门槛） */
  threshold: number
  total: number
  claimed: number
  /** 生效开始日期 */
  validFrom: string
  /** 生效结束日期 */
  validUntil: string
  status: CouponStatus
}

let nextCouponId = 9
let coupons: MaterialCoupon[] = [
  { id: 1, kind: 'exchange', name: '满 500 减 50 兑换券', value: 50, threshold: 500, total: 20000, claimed: 13860, validFrom: '2026-11-01', validUntil: '2026-11-30', status: 1 },
  { id: 2, kind: 'exchange', name: '新人无门槛兑换券', value: 20, threshold: 0, total: 50000, claimed: 32410, validFrom: '2026-10-01', validUntil: '2026-12-31', status: 1 },
  { id: 3, kind: 'exchange', name: '满 2000 减 300 兑换券', value: 300, threshold: 2000, total: 5000, claimed: 2180, validFrom: '2026-11-01', validUntil: '2026-11-20', status: 1 },
  { id: 4, kind: 'exchange', name: '物流箱回购兑换券', value: 80, threshold: 800, total: 12000, claimed: 7430, validFrom: '2026-11-01', validUntil: '2026-12-10', status: 1 },
  { id: 5, kind: 'discount', name: '会员专享 9 折券', value: 9, threshold: 1000, total: 8000, claimed: 5210, validFrom: '2026-11-01', validUntil: '2026-11-15', status: 1 },
  { id: 6, kind: 'discount', name: '大促全场 8.5 折券', value: 8.5, threshold: 0, total: 30000, claimed: 18760, validFrom: '2026-10-20', validUntil: '2026-11-11', status: 1 },
  { id: 7, kind: 'discount', name: '仓储器具 9.5 折券', value: 9.5, threshold: 500, total: 15000, claimed: 6180, validFrom: '2026-11-01', validUntil: '2026-12-05', status: 1 },
  { id: 8, kind: 'discount', name: '国庆限定 8 折券', value: 8, threshold: 300, total: 10000, claimed: 10000, validFrom: '2026-09-20', validUntil: '2026-10-07', status: 0 },
]

export async function fetchMaterialCoupons(params: { kind: MaterialKind; keyword?: string }): Promise<MaterialCoupon[]> {
  await mockDelay()
  let list = coupons.filter((c) => c.kind === params.kind)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(kw))
  }
  return list.sort((a, b) => a.id - b.id)
}

export async function createMaterialCoupon(payload: Omit<MaterialCoupon, 'id'>): Promise<void> {
  await mockDelay(200)
  coupons = [...coupons, { ...payload, id: nextCouponId++ }]
}

export interface MaterialCouponUpdatePayload {
  name: string
  value: number
  threshold: number
  validFrom: string
  validUntil: string
  status: CouponStatus
}

/** 编辑物料基础信息（库存需通过 updateMaterialStock 单独调整） */
export async function updateMaterialCoupon(id: number, payload: MaterialCouponUpdatePayload): Promise<void> {
  await mockDelay(200)
  const coupon = coupons.find((c) => c.id === id)
  if (!coupon) throw new Error('物料不存在或已被删除')
  coupons = coupons.map((c) =>
    c.id === id
      ? {
          ...c,
          name: payload.name.trim(),
          value: payload.value,
          threshold: payload.threshold,
          validFrom: payload.validFrom,
          validUntil: payload.validUntil,
          status: payload.status,
        }
      : c,
  )
}

export async function toggleMaterialCoupon(id: number, status: CouponStatus): Promise<void> {
  await mockDelay(200)
  coupons = coupons.map((c) => (c.id === id ? { ...c, status } : c))
}

/** 调整物料库存总量（不可低于已领取数量） */
export async function updateMaterialStock(id: number, total: number): Promise<void> {
  await mockDelay(200)
  const coupon = coupons.find((c) => c.id === id)
  if (!coupon) throw new Error('物料不存在或已被删除')
  if (!Number.isFinite(total) || total <= 0) throw new Error('库存总量需大于 0')
  if (total < coupon.claimed) throw new Error(`库存总量不能小于已领取数量（${coupon.claimed}）`)
  if (total === coupon.total) return
  coupons = coupons.map((c) => (c.id === id ? { ...c, total } : c))
}

export async function deleteMaterialCoupon(id: number): Promise<void> {
  await mockDelay(200)
  const coupon = coupons.find((c) => c.id === id)
  if (!coupon) throw new Error('物料不存在或已被删除')
  const used = activeCampaignsUsingMaterial(coupon.kind, id)
  if (used.length) {
    throw new Error(`该物料已被未结束的活动关联（${used.join('、')}），请先解除关联`)
  }
  coupons = coupons.filter((c) => c.id !== id)
}

/** 物料明细：被哪些活动引用、引用数量 */
export interface MaterialReference {
  campaignId: number
  campaignName: string
  status: CampaignStatus
  quantity: number
}

export interface MaterialDetail {
  key: string
  kind: MaterialKind | 'points'
  materialId: number
  name: string
  unit: string
  /** 库存总量（积分为 null） */
  total: number | null
  /** 已领取（积分为 null） */
  claimed: number | null
  /** 剩余可发放（积分为 null） */
  remaining: number | null
  references: MaterialReference[]
  /** 引用库存合计 */
  referenceTotal: number
}

export async function fetchMaterialDetails(params?: {
  kind?: MaterialKind | 'points' | ''
  keyword?: string
}): Promise<MaterialDetail[]> {
  await mockDelay()
  const rows: MaterialDetail[] = coupons.map((c) => {
    const references = campaigns.flatMap((campaign) =>
      campaign.materials
        .filter((m) => m.kind === c.kind && m.materialId === c.id)
        .map((m) => ({
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: campaign.status,
          quantity: m.quantity,
        })),
    )
    return {
      key: `${c.kind}:${c.id}`,
      kind: c.kind,
      materialId: c.id,
      name: c.name,
      unit: '张',
      total: c.total,
      claimed: c.claimed,
      remaining: Math.max(0, c.total - c.claimed),
      references,
      referenceTotal: references.reduce((sum, r) => sum + r.quantity, 0),
    }
  })

  const pointReferences = campaigns.flatMap((campaign) =>
    campaign.materials
      .filter((m) => m.kind === 'points')
      .map((m) => ({
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: campaign.status,
        quantity: m.quantity,
      })),
  )
  rows.push({
    key: 'points:0',
    kind: 'points',
    materialId: 0,
    name: '积分奖励',
    unit: '分',
    total: null,
    claimed: null,
    remaining: null,
    references: pointReferences,
    referenceTotal: pointReferences.reduce((sum, r) => sum + r.quantity, 0),
  })

  let list = rows
  if (params?.kind) list = list.filter((r) => r.kind === params.kind)
  if (params?.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    // 同时匹配物料名称与类别名（如「折扣券」）
    list = list.filter((r) => {
      const kindName = r.kind === 'exchange' ? '兑换券' : r.kind === 'discount' ? '折扣券' : '积分'
      return r.name.toLowerCase().includes(kw) || kindName.includes(kw)
    })
  }
  return list
}

/** 可关联的物料选项（兑换券 / 折扣券 / 积分） */
export interface MaterialOption {
  key: string
  kind: MaterialKind | 'points'
  materialId: number
  name: string
  /** 计量单位 */
  unit: string
  /** 剩余可发放数量（积分无库存上限，返回 null） */
  remaining: number | null
  status: 0 | 1
}

export async function fetchMaterialOptions(): Promise<MaterialOption[]> {
  await mockDelay()
  const couponOptions: MaterialOption[] = coupons.map((c) => ({
    key: `${c.kind}:${c.id}`,
    kind: c.kind,
    materialId: c.id,
    name: c.name,
    unit: '张',
    remaining: Math.max(0, c.total - c.claimed),
    status: c.status,
  }))
  const pointOption: MaterialOption = {
    key: 'points:0',
    kind: 'points',
    materialId: 0,
    name: '积分奖励',
    unit: '分',
    remaining: null,
    status: 1,
  }
  return [...couponOptions, pointOption]
}

/* ====================== 物料管理：积分 ====================== */

export interface PointRecord {
  id: number
  user: string
  change: number
  reason: string
  occurredAt: string
}

export interface PointSummary {
  /** 累计发放 */
  issued: number
  /** 累计消耗 */
  consumed: number
  /** 当前流通 */
  circulating: number
  /** 参与会员数 */
  members: number
}

const pointSummary: PointSummary = {
  issued: 2860000,
  consumed: 1930000,
  circulating: 930000,
  members: 18400,
}

let pointsRecords: PointRecord[] = [
  { id: 1, user: '张伟', change: 120, reason: '订单完成奖励', occurredAt: '2026-11-17 10:24' },
  { id: 2, user: '王芳', change: -500, reason: '积分兑换兑换券', occurredAt: '2026-11-17 09:58' },
  { id: 3, user: '李娜', change: 80, reason: '每日签到', occurredAt: '2026-11-17 08:30' },
  { id: 4, user: '刘强', change: 260, reason: '邀请新用户注册', occurredAt: '2026-11-16 17:12' },
  { id: 5, user: '陈静', change: -1200, reason: '积分抵扣订单', occurredAt: '2026-11-16 15:40' },
  { id: 6, user: '赵敏', change: 60, reason: '评价晒单', occurredAt: '2026-11-16 11:05' },
]

export async function fetchPointSummary(): Promise<PointSummary> {
  await mockDelay()
  return { ...pointSummary }
}

export async function fetchPointRecords(params?: { keyword?: string }): Promise<PointRecord[]> {
  await mockDelay()
  let list = [...pointsRecords]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter((r) => r.user.toLowerCase().includes(kw) || r.reason.includes(kw))
  }
  return list.sort((a, b) => b.id - a.id)
}

export async function adjustPoints(user: string, change: number, reason: string): Promise<void> {
  await mockDelay(200)
  const id = Math.max(0, ...pointsRecords.map((r) => r.id)) + 1
  const now = new Date()
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  pointsRecords = [{ id, user, change, reason, occurredAt: stamp }, ...pointsRecords]
}

/* ====================== 渠道管理：投放渠道 ====================== */

export interface ChannelItem {
  id: number
  name: string
  type: string
  /** 负责人 */
  owner: string
  /** 月预算（元） */
  budget: number
  /** 转化率（%） */
  conversion: number
  status: 0 | 1
}

export const CHANNEL_TYPES = ['站内', '短信', '私域', '外部']

let nextChannelId = 7
let channelList: ChannelItem[] = [
  { id: 1, name: '站内首页 Banner', type: '站内', owner: '张伟', budget: 120000, conversion: 12.4, status: 1 },
  { id: 2, name: '短信触达', type: '短信', owner: '王芳', budget: 45000, conversion: 8.2, status: 1 },
  { id: 3, name: '企业微信社群', type: '私域', owner: '李娜', budget: 30000, conversion: 16.8, status: 1 },
  { id: 4, name: '信息流广告', type: '外部', owner: '刘强', budget: 200000, conversion: 3.6, status: 1 },
  { id: 5, name: '公众号图文', type: '私域', owner: '陈静', budget: 25000, conversion: 9.7, status: 1 },
  { id: 6, name: '线下展会物料', type: '外部', owner: '赵敏', budget: 80000, conversion: 5.2, status: 0 },
]

export async function fetchChannels(params?: { keyword?: string; type?: string }): Promise<ChannelItem[]> {
  await mockDelay()
  let list = [...channelList]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(kw) || c.owner.toLowerCase().includes(kw))
  }
  if (params?.type) list = list.filter((c) => c.type === params.type)
  return list.sort((a, b) => a.id - b.id)
}

export async function createChannel(payload: Omit<ChannelItem, 'id'>): Promise<void> {
  await mockDelay(200)
  channelList = [...channelList, { ...payload, id: nextChannelId++ }]
}

export async function toggleChannelStatus(id: number, status: 0 | 1): Promise<void> {
  await mockDelay(200)
  channelList = channelList.map((c) => (c.id === id ? { ...c, status } : c))
}

export async function deleteChannel(id: number): Promise<void> {
  await mockDelay(200)
  channelList = channelList.filter((c) => c.id !== id)
}
