import { get, post } from '@/utils/request'

// ====================== 类型 ======================

/** 后端菜单树节点（对齐 ResourceAdminController.ResourceNodeResponse） */
export type ResourceType = 'catalog' | 'menu' | 'button' | 'api'

export interface MenuNode {
  id: number
  parentId: number | null
  type: ResourceType
  name: string
  /** 权限编码 */
  code: string
  /** 路由路径（catalog/menu 为实际路由） */
  path?: string
  sort: number
  status: 0 | 1
  createdAt: string
  children?: MenuNode[]
}

export interface LoginUserInfo {
  id: number
  username: string
  nickname: string
  phone?: string
  email?: string
  roles: string[]
}

export interface LoginResult {
  token: string
  user: LoginUserInfo
  /** 账密登录时如果账号已启用 TOTP，返回 needTotp=true 要求二次验证 */
  needTotp?: boolean
  hint?: string
}

/** 极验 v3 register 返回值 */
export interface GeetestRegisterInfo {
  challenge: string
  sign: string
  /** 等于 captchaId */
  gt: string
  captchaId: string
  captchaKey: string
  /** true 表示极验服务不可用，后端走本地 mock fallback */
  fallback?: boolean
}

export interface TotpSetupInfo {
  username: string
  secret: string
  qrUrl: string
}

// ====================== 账密登录 ======================

export interface PasswordLoginParams {
  username: string
  password: string
  /** 极验 v3 前端回调三参（可选，提交则后端先做极验校验） */
  geetestChallenge?: string
  geetestValidate?: string
  geetestSeccode?: string
}

/** POST /auth/login —— 账密登录 */
export function loginByPassword(params: PasswordLoginParams): Promise<LoginResult> {
  return post('/auth/login', params)
}

// ====================== 短信登录 ======================

/** POST /auth/sms/send —— 发送短信验证码（开发环境返回 devCode 便于前端展示） */
export function sendSmsCode(phone: string): Promise<{ expireMinutes: number; devCode?: string }> {
  return post('/auth/sms/send', { phone })
}

/** POST /auth/sms/login —— 短信验证码登录 */
export function loginBySms(phone: string, smsCode: string): Promise<LoginResult> {
  return post('/auth/sms/login', { phone, smsCode })
}

// ====================== 极验行为验证 v3 ======================

/** GET /auth/captcha —— 极验 register（获取 challenge + sign + captchaId） */
export function getCaptcha(): Promise<GeetestRegisterInfo> {
  return get('/auth/captcha')
}

/** POST /auth/geetest/verify —— 极验独立校验（返回 { ok: boolean }） */
export function validateGeetest(challenge: string, validate: string, seccode: string): Promise<{ ok: boolean }> {
  return post('/auth/geetest/verify', { challenge, validate, seccode })
}

// ====================== TOTP / FreeOTP ======================

/** POST /auth/totp/setup —— 生成绑定信息（新密钥 + QR URL） */
export function setupTotp(username: string): Promise<TotpSetupInfo> {
  return post('/auth/totp/setup', { username })
}

/** POST /auth/totp/enable —— 启用 TOTP（用当前 DB 中已存密钥验证） */
export function enableTotp(username: string, totpCode: number): Promise<{ success: boolean; message?: string }> {
  return post('/auth/totp/enable', { username, totpCode })
}

/** POST /auth/totp/login —— 账密 + TOTP 二次验证登录 */
export function loginWithTotp(
  username: string,
  password: string,
  totpCode: number,
): Promise<LoginResult> {
  return post('/auth/totp/login', { username, password, totpCode })
}

// ====================== Token 解析 ======================

/** GET /auth/me —— 解析 header 中 token（调试用） */
export function getCurrentUser(): Promise<{ userCode: string | null; authenticated: boolean }> {
  return get('/auth/me')
}

/**
 * GET /auth/menus —— 返回当前登录用户有权限的菜单树（RBAC）。
 * 无 token 时返回空数组。Portal / BasicLayout 侧边栏均从此接口渲染。
 */
export function getUserMenus(): Promise<MenuNode[]> {
  return get('/auth/menus')
}

// ====================== 兼容旧的 UserStore.login 调用签名 ======================

export async function login(params: PasswordLoginParams): Promise<LoginResult> {
  return loginByPassword(params)
}
