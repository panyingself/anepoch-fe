<template>
  <div class="login-page">
    <CosmicBackground />

    <div class="login-panel">
      <div class="panel-brand">
        <div class="orbit-wrap" aria-hidden="true">
          <div class="ring r1"><i class="sat sat-blue" /></div>
          <div class="ring r2"><i class="sat sat-green" /></div>
          <div class="ring r3"><i class="sat sat-purple" /></div>
          <div class="core" />
        </div>
        <div class="brand-info">
          <div class="brand-logo"><AppstoreFilled /></div>
          <h1 class="brand-name">AnEpoch</h1>
          <p class="brand-tagline">数字中台 · 统一登录</p>
        </div>
      </div>

      <div class="panel-form">
        <div class="scanline" aria-hidden="true"></div>
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-sub">登录以进入数字中台统一门户</p>

        <!-- 登录方式切换 -->
        <a-tabs
          v-model:activeKey="currentMethod"
          class="login-tabs"
          centered
        >
          <a-tab-pane key="password" tab="账号密码" />
          <a-tab-pane key="sms" tab="短信验证码" />
          <a-tab-pane key="geetest" tab="极验验证" />
          <a-tab-pane key="totp" tab="FreeOTP" />
        </a-tabs>

        <!-- ============ 账号密码 ============ -->
        <a-form
          v-if="currentMethod === 'password'"
          :model="pwdForm"
          :rules="pwdRules"
          layout="vertical"
          autocomplete="off"
          @finish="onPwdLogin"
        >
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="pwdForm.username" size="large" placeholder="请输入用户名">
              <template #prefix><UserOutlined class="input-icon" /></template>
            </a-input>
          </a-form-item>
          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="pwdForm.password" size="large" placeholder="请输入密码">
              <template #prefix><LockOutlined class="input-icon" /></template>
            </a-input-password>
          </a-form-item>
          <a-form-item v-if="pwdForm.needTotp" label="TOTP 验证码 (FreeOTP)">
            <a-input
              v-model:value="pwdForm.totpCode"
              size="large"
              placeholder="6 位动态验证码"
              :maxlength="6"
            />
          </a-form-item>
          <a-form-item class="form-remember">
            <a-checkbox v-model:checked="pwdForm.remember">记住我</a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button
              class="login-btn"
              type="primary"
              size="large"
              html-type="submit"
              block
              :loading="loading"
            >
              {{ pwdForm.needTotp ? '验证并登录' : '登 录' }}
            </a-button>
          </a-form-item>
        </a-form>

        <!-- ============ 短信验证码 ============ -->
        <a-form
          v-if="currentMethod === 'sms'"
          :model="smsForm"
          :rules="smsRules"
          layout="vertical"
          autocomplete="off"
          @finish="onSmsLogin"
        >
          <a-form-item label="手机号" name="phone">
            <a-input v-model:value="smsForm.phone" size="large" placeholder="请输入 11 位手机号">
              <template #prefix><MobileOutlined class="input-icon" /></template>
            </a-input>
          </a-form-item>
          <a-form-item label="短信验证码" name="smsCode">
            <div class="sms-row">
              <a-input
                v-model:value="smsForm.smsCode"
                size="large"
                placeholder="请输入 6 位验证码"
                :maxlength="6"
              />
              <a-button
                size="large"
                class="sms-btn"
                :disabled="smsForm.phone.length !== 11 || smsCountdown > 0"
                :loading="smsSending"
                @click="onSendSms"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s 后重发` : '获取验证码' }}
              </a-button>
            </div>
            <div v-if="smsForm.devCode" class="dev-hint">
              <BugOutlined /> 开发环境验证码：
              <a-typography-text copyable :text="smsForm.devCode" class="dev-code-copy" />
            </div>
          </a-form-item>
          <a-form-item>
            <a-button
              class="login-btn"
              type="primary"
              size="large"
              html-type="submit"
              block
              :loading="loading"
            >
              登 录
            </a-button>
          </a-form-item>
        </a-form>

        <!-- ============ 极验行为验证 v3 ============ -->
        <a-form
          v-if="currentMethod === 'geetest'"
          :model="capForm"
          :rules="capRules"
          layout="vertical"
          autocomplete="off"
          @finish="onGeetestLogin"
        >
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="capForm.username" size="large" placeholder="请输入用户名">
              <template #prefix><UserOutlined class="input-icon" /></template>
            </a-input>
          </a-form-item>
          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="capForm.password" size="large" placeholder="请输入密码">
              <template #prefix><LockOutlined class="input-icon" /></template>
            </a-input-password>
          </a-form-item>
          <a-form-item label="行为验证" required>
            <!-- 极验 widget 挂载点 -->
            <div ref="geetestRef" class="geetest-box" />
            <div v-if="geetestLoading" class="geetest-loading">
              正在加载极验行为验证组件…
            </div>
            <div v-if="geetestFallback" class="geetest-fallback">
              <BugOutlined /> 极验服务暂不可用，开发模式已自动放行
            </div>
          </a-form-item>
          <a-form-item>
            <a-button
              class="login-btn"
              type="primary"
              size="large"
              html-type="submit"
              block
              :loading="loading"
              :disabled="!geetestOk"
            >
              登 录
            </a-button>
          </a-form-item>
        </a-form>

        <!-- ============ FreeOTP / TOTP ============ -->
        <a-form
          v-if="currentMethod === 'totp'"
          :model="totpForm"
          :rules="totpRules"
          layout="vertical"
          autocomplete="off"
          @finish="onTotpLogin"
        >
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="totpForm.username" size="large" placeholder="请输入已绑定 FreeOTP 的用户名">
              <template #prefix><UserOutlined class="input-icon" /></template>
            </a-input>
          </a-form-item>
          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="totpForm.password" size="large" placeholder="请输入密码">
              <template #prefix><LockOutlined class="input-icon" /></template>
            </a-input-password>
          </a-form-item>
          <a-form-item label="TOTP 动态码" name="totpCode">
            <a-input v-model:value="totpForm.totpCode" size="large" placeholder="FreeOTP 显示的 6 位数字">
              <template #prefix><SafetyOutlined class="input-icon" /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button
              class="login-btn"
              type="primary"
              size="large"
              html-type="submit"
              block
              :loading="loading"
            >
              登 录
            </a-button>
          </a-form-item>
        </a-form>

        <a-alert class="demo-alert" type="info" show-icon>
          <template #message>
            演示账号：admin / 123456 · admin 已预置 FreeOTP 密钥
          </template>
        </a-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Rule } from 'ant-design-vue/es/form'
import { message } from 'ant-design-vue'
import {
  AppstoreFilled, UserOutlined, LockOutlined, MobileOutlined,
  ReloadOutlined, SafetyOutlined, BugOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import CosmicBackground from '@/components/CosmicBackground.vue'
import {
  loginByPassword, loginBySms, loginWithTotp,
  sendSmsCode, getCaptcha,
  type GeetestRegisterInfo, type LoginResult,
} from '@/api/auth'

// ========== 基础状态 ==========
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const currentMethod = ref<'password' | 'sms' | 'geetest' | 'totp'>('password')

// ========== 账号密码 ==========
const pwdForm = reactive({
  username: 'admin',
  password: '',
  totpCode: '',
  needTotp: false,
  remember: true,
})
const pwdRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function onPwdLogin() {
  if (loading.value) return
  loading.value = true
  try {
    const result: LoginResult = await loginByPassword({
      username: pwdForm.username.trim(),
      password: pwdForm.password,
    })
    if (result.needTotp) {
      pwdForm.needTotp = true
      message.info('该账号已启用 FreeOTP 二次验证，请输入动态码')
      return
    }
    await finalizeLogin(result)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}

// ========== 短信 ==========
const smsForm = reactive({ phone: '', smsCode: '', devCode: '' as string | undefined })
const smsRules: Record<string, Rule[]> = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号', trigger: 'blur' },
  ],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}
const smsCountdown = ref(0)
const smsSending = ref(false)

async function onSendSms() {
  if (smsSending.value) return
  smsSending.value = true
  try {
    const data = await sendSmsCode(smsForm.phone.trim())
    smsForm.devCode = data.devCode
    message.success('验证码已发送')
    smsCountdown.value = 60
    const t = setInterval(() => {
      smsCountdown.value -= 1
      if (smsCountdown.value <= 0) { clearInterval(t) }
    }, 1000)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '发送失败')
  } finally {
    smsSending.value = false
  }
}

async function onSmsLogin() {
  if (loading.value) return
  loading.value = true
  try {
    const result = await loginBySms(smsForm.phone.trim(), smsForm.smsCode.trim())
    smsForm.devCode = undefined
    await finalizeLogin(result)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}

// ========== 极验行为验证 v3 ==========
const capForm = reactive({ username: 'admin', password: '' })
const capRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const geetestRef = ref<HTMLDivElement | null>(null)
const geetestLoading = ref(false)
const geetestOk = ref(false)
const geetestFallback = ref(false)
const geetestRegisterInfo = ref<GeetestRegisterInfo | null>(null)
const geetestResult = ref<{ challenge: string; validate: string; seccode: string } | null>(null)
let geetestWidget: any = null

/** 动态加载极验 gt.js（只加载一次） */
function loadGtJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Geetest) { resolve(); return }
    const existing = document.querySelector<HTMLScriptElement>('script#geetest-gtjs')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const script = document.createElement('script')
    script.id = 'geetest-gtjs'
    script.src = 'https://static.geetest.com/static/tools/gt.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('极验 gt.js 加载失败'))
    document.head.appendChild(script)
  })
}

/** 初始化极验 widget 或走 fallback */
async function initGeetest() {
  geetestOk.value = false
  geetestFallback.value = false
  geetestResult.value = null
  geetestLoading.value = true

  try {
    const data = await getCaptcha()
    geetestRegisterInfo.value = data

    // fallback：极验服务不可用，直接放行（开发模式）
    if (data.fallback) {
      geetestFallback.value = true
      geetestResult.value = {
        challenge: data.challenge,
        validate: 'mock',
        seccode: 'mock',
      }
      geetestOk.value = true
      geetestLoading.value = false
      return
    }

    // 等 DOM 挂载点出现
    await nextTick()
    if (!geetestRef.value) {
      geetestLoading.value = false
      return
    }
    geetestRef.value.innerHTML = ''

    // 加载极验 gt.js
    await loadGtJs()

    // 极验 v3 initGeetest 回调式初始化
    ;(window as any).initGeetest4({
      captchaId: data.captchaId,
      product: 'float',
      clientType: 'web',
    }, (captchaObj: any) => {
      geetestWidget = captchaObj
      captchaObj.appendTo(geetestRef.value!)
      captchaObj.onReady(() => {
        geetestLoading.value = false
      })
      captchaObj.onSuccess(() => {
        const r = captchaObj.getValidate()
        geetestResult.value = {
          challenge: r.geetest_challenge,
          validate: r.geetest_validate,
          seccode: r.geetest_seccode,
        }
        geetestOk.value = true
        message.success('极验行为验证通过')
      })
      captchaObj.onError((err: any) => {
        geetestLoading.value = false
        message.error('极验组件加载失败：' + (err?.msg || '未知错误'))
      })
    })
  } catch (err) {
    geetestLoading.value = false
    geetestFallback.value = true
    message.warn('极验初始化失败，开发模式已自动放行')
  }
}

async function onGeetestLogin() {
  if (loading.value) return
  loading.value = true
  try {
    const params: any = { username: capForm.username.trim(), password: capForm.password }
    if (geetestResult.value) {
      params.geetestChallenge = geetestResult.value.challenge
      params.geetestValidate = geetestResult.value.validate
      params.geetestSeccode = geetestResult.value.seccode
    }
    const result = await loginByPassword(params)
    if (result.needTotp) {
      message.warning('该账号已启用 FreeOTP，请切换到 FreeOTP 登录方式')
      return
    }
    await finalizeLogin(result)
  } catch (err) {
    // 极验校验失败时刷新 widget
    if (geetestWidget) {
      try { geetestWidget.reset() } catch {}
      geetestOk.value = false
    }
    message.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}

// ========== FreeOTP ==========
const totpForm = reactive({ username: 'admin', password: '', totpCode: '' })
const totpRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  totpCode: [{ required: true, message: '请输入 6 位动态码', trigger: 'blur' }],
}

async function onTotpLogin() {
  if (loading.value) return
  loading.value = true
  try {
    const code = parseInt(totpForm.totpCode, 10)
    if (Number.isNaN(code)) { throw new Error('动态码必须是数字') }
    const result = await loginWithTotp(totpForm.username.trim(), totpForm.password, code)
    await finalizeLogin(result)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}

// ========== 通用收尾 ==========
async function finalizeLogin(result: LoginResult) {
  userStore.setToken(result.token)
  userStore.setUserInfo({
    id: result.user.id,
    username: result.user.username,
    nickname: result.user.nickname,
    roles: result.user.roles,
  })
  message.success('登录成功')
  const redirect = route.query.redirect
  router.push(typeof redirect === 'string' && redirect ? redirect : '/portal')
}

// ========== 初始化 ==========
onMounted(() => {
  if (currentMethod.value === 'geetest') initGeetest()
})

watch(currentMethod, (m) => {
  if (m === 'geetest' && !geetestRegisterInfo.value) initGeetest()
  if (m === 'geetest' && geetestRegisterInfo.value && !geetestFallback.value) {
    // 切回极验 tab 时重置 widget
    if (geetestWidget) { try { geetestWidget.reset() } catch {} }
    geetestOk.value = false
  }
})
</script>

<style scoped lang="less">
@property --spin { syntax: '<angle>'; inherits: false; initial-value: 0deg; }

.login-page {
  position: relative; display: flex; align-items: center; justify-content: center;
  height: 100%; overflow: hidden;
  background: radial-gradient(ellipse 130% 100% at 50% 0%, #1c2158 0%, #141741 45%, #0b1026 100%);
}

.login-panel {
  position: relative; z-index: 1; display: flex; width: min(960px, calc(100% - 48px));
  min-height: 600px; overflow: hidden;
  background: rgba(16, 22, 52, 0.55); border-radius: 18px;
  -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px);
  animation: panel-in 0.6s ease backwards;

  &::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
    background: conic-gradient(from var(--spin),
      rgba(22, 119, 255, 0.9), rgba(0, 185, 107, 0.9) 0.35turn,
      rgba(124, 77, 255, 0.7) 0.6turn, rgba(22, 119, 255, 0.9) 1turn);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
    pointer-events: none; animation: border-spin 8s linear infinite;
  }
  .scanline {
    position: absolute; top: -90px; right: 0; left: 0; height: 90px; pointer-events: none;
    background: linear-gradient(180deg, transparent, rgba(120, 180, 255, 0.07), transparent);
    animation: scan 7s ease-in-out infinite;
  }
}
@keyframes border-spin { to { --spin: 360deg; } }
@keyframes panel-in { from { opacity: 0; transform: translateY(24px); } }
@keyframes scan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: 1; } 82% { opacity: 1; } 100% { transform: translateY(640px); opacity: 0; } }

.panel-brand {
  position: relative; flex: 1 1 40%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 24px; padding: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: radial-gradient(ellipse at 30% 20%, rgba(22, 119, 255, 0.14), transparent 60%);

  .orbit-wrap { position: relative; width: 240px; height: 240px; perspective: 600px; }
  .ring { position: absolute; border: 1px dashed rgba(110, 168, 255, 0.45); border-radius: 50%; }
  .ring.r1 { inset: 0; animation: orbit-spin 18s linear infinite; }
  .ring.r2 { inset: 34px; border-color: rgba(0, 185, 107, 0.45); animation: orbit-spin 13s linear infinite reverse; }
  .ring.r3 { inset: 68px; border-color: rgba(124, 77, 255, 0.5); animation: orbit-spin 8s linear infinite; }
  .sat { position: absolute; top: -4px; left: calc(50% - 4px); width: 8px; height: 8px; border-radius: 50%; }
  .sat-blue { background: #7ee0ff; box-shadow: 0 0 12px #7ee0ff; }
  .sat-green { background: #69f0ae; box-shadow: 0 0 12px #69f0ae; }
  .sat-purple { background: #c9a7ff; box-shadow: 0 0 12px #c9a7ff; }
  .core { position: absolute; inset: calc(50% - 26px);
    background: radial-gradient(circle, #7cc4ff, #1677ff 45%, transparent 72%);
    border-radius: 50%; filter: blur(5px); animation: core-pulse 3s ease-in-out infinite; }

  .brand-info { text-align: center; }
  .brand-logo { display: inline-flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; font-size: 22px; color: #fff;
    background: linear-gradient(135deg, #1677ff, #00b96b); border-radius: 12px;
    box-shadow: 0 10px 26px -8px rgba(59, 130, 246, 0.7), 0 0 24px rgba(34, 211, 238, 0.35); }
  .brand-name { margin: 12px 0 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;
    background: linear-gradient(90deg, #6fb6ff, #4ade80); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .brand-tagline { margin: 8px 0 0; font-size: 12px; letter-spacing: 2px; color: rgba(255, 255, 255, 0.45); }
}
@keyframes orbit-spin { to { transform: rotate(360deg); } }
@keyframes core-pulse { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.18); opacity: 1; } }

.panel-form {
  position: relative; flex: 1 1 60%; display: flex; flex-direction: column;
  justify-content: center; padding: 36px 44px;

  .form-title { margin: 0 0 4px; font-size: 22px; font-weight: 600; color: #fff; }
  .form-sub { margin: 0 0 20px; font-size: 12px; color: rgba(255, 255, 255, 0.45); }

  :deep(.ant-form-item-label > label) { color: rgba(255, 255, 255, 0.65); }
  :deep(.ant-input-affix-wrapper) {
    background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.18);
    transition: all 0.3s;
    .ant-input { color: #fff; background: transparent; &::placeholder { color: rgba(255,255,255,0.3); } }
    .input-icon { color: rgba(255, 255, 255, 0.35); }
    .ant-input-password-icon { color: rgba(255, 255, 255, 0.4); }
    &:hover { border-color: rgba(110, 168, 255, 0.5); }
    &.ant-input-affix-wrapper-focused {
      border-color: #4d9fff; background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.22), 0 0 18px -4px rgba(22, 119, 255, 0.55);
    }
  }
  :deep(.ant-checkbox-wrapper) { color: rgba(255, 255, 255, 0.6); }

  /* Tabs */
  :deep(.ant-tabs-nav) { margin-bottom: 8px; }
  :deep(.ant-tabs-tab) { color: rgba(255, 255, 255, 0.55); }
  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) { color: #fff !important; }
  :deep(.ant-tabs-ink-bar) { background: linear-gradient(90deg, #1677ff, #00b96b); }

  .login-btn {
    height: 42px; font-weight: 600; letter-spacing: 6px;
    background: linear-gradient(90deg, #1677ff, #00b96b); border: none;
    box-shadow: 0 8px 22px -6px rgba(22, 119, 255, 0.6);
    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
    &:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 12px 28px -6px rgba(22, 119, 255, 0.75), 0 0 22px -4px rgba(0, 185, 107, 0.6); }
  }

  .demo-alert { margin-top: 4px; background: rgba(22, 119, 255, 0.1); border-color: rgba(110, 168, 255, 0.35);
    :deep(.ant-alert-message) { color: rgba(255, 255, 255, 0.65); }
    :deep(.ant-alert-icon) { color: #6fb6ff; } }

  /* 短信 row */
  .sms-row { display: flex; gap: 10px; align-items: stretch;
    :deep(.ant-input) { flex: 1; }
    .sms-btn { flex-shrink: 0; min-width: 120px; } }
  .dev-hint {
    display: flex; align-items: center; gap: 4px; margin-top: 6px;
    font-size: 11px; color: rgba(255, 255, 255, 0.5);
    :deep(.ant-typography-copy) { color: #6fb6ff !important; }
  }

  /* 极验 widget 挂载点 */
  .geetest-box {
    min-height: 40px;
    border-radius: 6px;
    :deep(#geetest_float) { /* 极验 float 模式容器 */ }
  }
  .geetest-loading, .geetest-fallback {
    font-size: 12px; color: rgba(255, 255, 255, 0.5);
    display: flex; align-items: center; gap: 4px; padding: 8px 10px;
    background: rgba(255, 255, 255, 0.05); border-radius: 6px;
  }
  .geetest-fallback { color: #ffcc66; }
}

@media (max-width: 860px) {
  .panel-brand { display: none; }
  .login-panel { width: min(440px, calc(100% - 32px)); }
}
</style>
