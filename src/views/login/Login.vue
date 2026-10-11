<template>
  <div class="login-page">
    <!-- 宇宙深空共享背景：星云 / 星空 / 镜像碎片 / 流星雨 / 行星 / 立方体 -->
    <CosmicBackground />

    <!-- 登录面板 -->
    <div class="login-panel">
      <!-- 左侧品牌区（窄屏隐藏） -->
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

      <!-- 右侧表单区 -->
      <div class="panel-form">
        <div class="scanline" aria-hidden="true"></div>
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-sub">登录以进入数字中台统一门户</p>

        <a-form
          :model="formState"
          :rules="rules"
          layout="vertical"
          autocomplete="off"
          @finish="onFinish"
        >
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="formState.username" size="large" placeholder="请输入用户名">
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="密码" name="password">
            <a-input-password
              v-model:value="formState.password"
              size="large"
              placeholder="请输入密码"
              @pressEnter="onFinish"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item class="form-remember">
            <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
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

        <a-alert class="demo-alert" type="info" show-icon message="演示账号：admin / 123456" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Rule } from 'ant-design-vue/es/form'
import { message } from 'ant-design-vue'
import { AppstoreFilled, UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import CosmicBackground from '@/components/CosmicBackground.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

const formState = reactive({
  username: 'admin',
  password: '',
  remember: true,
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const onFinish = async () => {
  if (loading.value) return
  loading.value = true
  try {
    await userStore.login({
      username: formState.username.trim(),
      password: formState.password,
    })
    message.success('登录成功')
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' && redirect ? redirect : '/portal')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
/* 旋转流光边框（需注册可动画角度变量） */
@property --spin {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* ====== 页面骨架 ====== */
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse 130% 100% at 50% 0%, #1c2158 0%, #141741 45%, #0b1026 100%);
}

/* ====== 玻璃登录面板 ====== */
.login-panel {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(920px, calc(100% - 48px));
  min-height: 520px;
  overflow: hidden;
  background: rgba(16, 22, 52, 0.55);
  border-radius: 18px;
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  animation: panel-in 0.6s ease backwards;

  /* 旋转流光描边 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    background: conic-gradient(
      from var(--spin),
      rgba(22, 119, 255, 0.9),
      rgba(0, 185, 107, 0.9) 0.35turn,
      rgba(124, 77, 255, 0.7) 0.6turn,
      rgba(22, 119, 255, 0.9) 1turn
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    pointer-events: none;
    animation: border-spin 8s linear infinite;
  }

  /* 扫描光束 */
  .scanline {
    position: absolute;
    top: -90px;
    right: 0;
    left: 0;
    height: 90px;
    pointer-events: none;
    background: linear-gradient(180deg, transparent, rgba(120, 180, 255, 0.07), transparent);
    animation: scan 7s ease-in-out infinite;
  }
}

@keyframes border-spin {
  to {
    --spin: 360deg;
  }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

@keyframes scan {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  82% {
    opacity: 1;
  }
  100% {
    transform: translateY(640px);
    opacity: 0;
  }
}

/* ====== 左侧品牌 / 轨道动效 ====== */
.panel-brand {
  position: relative;
  display: flex;
  flex: 1 1 46%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: radial-gradient(ellipse at 30% 20%, rgba(22, 119, 255, 0.14), transparent 60%);

  .orbit-wrap {
    position: relative;
    width: 260px;
    height: 260px;
    perspective: 600px;

    .ring {
      position: absolute;
      border: 1px dashed rgba(110, 168, 255, 0.45);
      border-radius: 50%;

      &.r1 {
        inset: 0;
        animation: orbit-spin 18s linear infinite;
      }

      &.r2 {
        inset: 38px;
        border-color: rgba(0, 185, 107, 0.45);
        animation: orbit-spin 13s linear infinite reverse;
      }

      &.r3 {
        inset: 76px;
        border-color: rgba(124, 77, 255, 0.5);
        animation: orbit-spin 8s linear infinite;
      }

      .sat {
        position: absolute;
        top: -4px;
        left: calc(50% - 4px);
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }

    .sat-blue {
      background: #7ee0ff;
      box-shadow: 0 0 12px #7ee0ff;
    }

    .sat-green {
      background: #69f0ae;
      box-shadow: 0 0 12px #69f0ae;
    }

    .sat-purple {
      background: #c9a7ff;
      box-shadow: 0 0 12px #c9a7ff;
    }

    .core {
      position: absolute;
      inset: calc(50% - 28px);
      background: radial-gradient(circle, #7cc4ff, #1677ff 45%, transparent 72%);
      border-radius: 50%;
      filter: blur(5px);
      animation: core-pulse 3s ease-in-out infinite;
    }
  }

  .brand-info {
    text-align: center;

    .brand-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      font-size: 26px;
      color: #fff;
      background: linear-gradient(135deg, #1677ff, #00b96b);
      border-radius: 14px;
      box-shadow:
        0 10px 26px -8px rgba(59, 130, 246, 0.7),
        0 0 24px rgba(34, 211, 238, 0.35);
    }

    .brand-name {
      margin: 14px 0 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
      background: linear-gradient(90deg, #6fb6ff, #4ade80);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-tagline {
      margin: 8px 0 0;
      font-size: 13px;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.45);
    }
  }
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes core-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

/* ====== 右侧表单 ====== */
.panel-form {
  position: relative;
  flex: 1 1 54%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 52px;

  .form-title {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 600;
    color: #fff;
  }

  .form-sub {
    margin: 0 0 28px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
  }

  :deep(.ant-form-item-label > label) {
    color: rgba(255, 255, 255, 0.65);
  }

  :deep(.ant-input-affix-wrapper) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.18);
    transition: all 0.3s;

    .ant-input {
      color: #fff;
      background: transparent;

      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }
    }

    .input-icon {
      color: rgba(255, 255, 255, 0.35);
    }

    .ant-input-password-icon {
      color: rgba(255, 255, 255, 0.4);
    }

    &:hover {
      border-color: rgba(110, 168, 255, 0.5);
    }

    &.ant-input-affix-wrapper-focused {
      border-color: #4d9fff;
      background: rgba(255, 255, 255, 0.08);
      box-shadow:
        0 0 0 2px rgba(22, 119, 255, 0.22),
        0 0 18px -4px rgba(22, 119, 255, 0.55);
    }
  }

  :deep(.ant-checkbox-wrapper) {
    color: rgba(255, 255, 255, 0.6);
  }

  .login-btn {
    height: 44px;
    font-weight: 600;
    letter-spacing: 6px;
    background: linear-gradient(90deg, #1677ff, #00b96b);
    border: none;
    box-shadow: 0 8px 22px -6px rgba(22, 119, 255, 0.6);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      filter 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      filter: brightness(1.12);
      box-shadow:
        0 12px 28px -6px rgba(22, 119, 255, 0.75),
        0 0 22px -4px rgba(0, 185, 107, 0.6);
    }
  }

  .demo-alert {
    margin-top: 4px;
    background: rgba(22, 119, 255, 0.1);
    border-color: rgba(110, 168, 255, 0.35);

    :deep(.ant-alert-message) {
      color: rgba(255, 255, 255, 0.65);
    }

    :deep(.ant-alert-icon) {
      color: #6fb6ff;
    }
  }
}

/* 窄屏：隐藏品牌区 */
@media (max-width: 860px) {
  .panel-brand {
    display: none;
  }

  .login-panel {
    width: min(440px, calc(100% - 32px));
  }
}
</style>
