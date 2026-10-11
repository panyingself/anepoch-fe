<template>
  <div class="portal-page">
    <!-- 宇宙深空共享背景：星云 / 星空 / 镜像碎片 / 流星雨 / 行星 / 立方体 -->
    <CosmicBackground />
    <div class="bg-bubbles" aria-hidden="true">
      <span
        v-for="(b, i) in bubbles"
        :key="i"
        :style="{
          left: `${b.left}%`,
          width: `${b.size}px`,
          height: `${b.size}px`,
          border: `1px solid ${b.color}`,
          boxShadow: `0 0 12px ${b.color}, inset 0 0 6px rgba(255,255,255,0.55)`,
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 62%)`,
          '--o': b.opacity,
          animationDuration: `${b.duration}s`,
          animationDelay: `${b.delay}s`,
        }"
      />
    </div>

    <header class="portal-header">
      <!-- 品牌 + 标题（左上角） -->
      <div class="brand-block">
        <div class="brand-row">
          <div class="brand-logo">
            <AppstoreFilled />
          </div>
          <div class="brand-text">
            <div class="brand-row-line">
              <span class="brand-name">AnEpoch</span>
              <span class="brand-badge">数字中台 · 统一门户</span>
            </div>
            <p class="brand-sub">
              <span class="en">MID-PLATFORM PORTAL</span>
              <span class="divider" />
              共 {{ systems.length }} 个中台 · {{ onlineCount }} 个已上线
            </p>
          </div>
        </div>
      </div>

      <a-dropdown>
        <span class="user-chip">
          <a-avatar :size="30" style="background-color: #1677ff; font-size: 14px">
            {{ (userStore.userInfo?.nickname || 'A').slice(0, 1) }}
          </a-avatar>
          <span class="user-name">{{ userStore.userInfo?.nickname || '未登录' }}</span>
        </span>
        <template #overlay>
          <a-menu>
            <a-menu-item key="logout" @click="onLogout">
              <LogoutOutlined />
              <span style="margin-left: 6px">退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </header>

    <main class="portal-main">
      <!--
        斜切竖长卡片网格（黄金比例），auto-fill 自适应，
        卡片数量增减只影响行数，不影响整体布局。
      -->
      <div class="card-grid">
        <div
          v-for="(s, i) in systems"
          :key="s.key"
          class="sys-card"
          :class="{ building: s.status === 'building', last: s.key === lastSystem }"
          :style="{
            '--sys-color': s.color,
            animationDelay: `${i * 40}ms`,
            transform: tiltMap[s.key],
          }"
          @mousemove="onTilt($event, s.key)"
          @mouseleave="clearTilt(s.key)"
          @click="enterSystem(s)"
        >
          <div class="card-clip" aria-hidden="true"></div>
          <span class="card-index">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="card-status">
            <template v-if="s.status === 'online'">
              <span class="dot" />
              已上线
            </template>
            <template v-else>建设中</template>
          </div>
          <div class="card-body">
            <div class="card-icon">
              <component :is="s.icon" />
            </div>
            <div class="card-text">
              <div class="card-name">
                {{ s.name }}
                <span v-if="s.key === lastSystem" class="last-chip">上次使用</span>
              </div>
              <p class="card-desc">{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="portal-footer">
      AnEpoch 数字中台 ©{{ new Date().getFullYear() }} · Powered by Vue3 + Ant Design Vue
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppstoreFilled, LogoutOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { SYSTEMS } from '@/config/systems'
import type { SystemMeta } from '@/config/systems'
import CosmicBackground from '@/components/CosmicBackground.vue'

const LAST_SYSTEM_KEY = 'anepoch_last_system'

const router = useRouter()
const userStore = useUserStore()

const systems = SYSTEMS
const onlineCount = computed(() => systems.filter((s) => s.status === 'online').length)
const lastSystem = ref('')

/** 彩色气泡：确定性伪随机，避免每次渲染跳动 */
const bubbles = Array.from({ length: 18 }, (_, i) => {
  const colors = ['#3b82f6', '#22d3ee', '#34d399', '#a78bfa', '#f472b6', '#facc15']
  return {
    left: (i * 7.3 + 4) % 98,
    size: 8 + ((i * 37) % 30),
    color: colors[i % colors.length],
    duration: 14 + ((i * 13) % 12),
    delay: -((i * 5.7) % 24),
    opacity: Number((0.25 + ((i * 11) % 30) / 100).toFixed(2)),
  }
})

/** 鼠标跟随 3D 倾斜 */
const tiltMap = ref<Record<string, string>>({})
const onTilt = (e: MouseEvent, key: string) => {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width - 0.5
  const py = (e.clientY - r.top) / r.height - 0.5
  tiltMap.value = {
    ...tiltMap.value,
    [key]: `perspective(900px) rotateY(${(px * 16).toFixed(1)}deg) rotateX(${(-py * 16).toFixed(1)}deg) translateY(-6px)`,
  }
}
const clearTilt = (key: string) => {
  const { [key]: _removed, ...rest } = tiltMap.value
  tiltMap.value = rest
}

onMounted(() => {
  lastSystem.value = localStorage.getItem(LAST_SYSTEM_KEY) || ''
})

function enterSystem(s: SystemMeta) {
  if (s.status === 'building') {
    message.info(`「${s.name}」正在建设中，敬请期待`)
    return
  }
  localStorage.setItem(LAST_SYSTEM_KEY, s.key)
  // 新标签页打开中台系统
  const { href } = router.resolve(s.home || '/')
  window.open(href, '_blank')
}

const onLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped lang="less">
/* 旋转霓虹流光边框（需注册可动画角度变量） */
@property --spin {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* 彩色发光气泡上升 */
.bg-bubbles {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  span {
    position: absolute;
    bottom: -40px;
    border-radius: 50%;
    opacity: 0;
    animation: bubble-rise linear infinite;
  }
}

@keyframes bubble-rise {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0);
  }
  12% {
    opacity: var(--o, 0.3);
  }
  82% {
    opacity: var(--o, 0.3);
  }
  100% {
    opacity: 0;
    transform: translateY(-112vh) translateX(24px);
  }
}

/* ====== 页面骨架 ====== */
.portal-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow-x: hidden; /* 兜底：防止斜切包围盒产生横向滚动 */
  overflow-x: clip;
  background: radial-gradient(ellipse 130% 90% at 50% 0%, #1c2158 0%, #141741 42%, #0b1026 100%);
}

.portal-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 22px 28px 6px;

  .brand-block {
    .brand-row-line {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-name {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
      text-shadow: 0 0 18px rgba(120, 160, 255, 0.6);
    }

    .brand-badge {
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 500;
      color: #9fc2ff;
      background: rgba(96, 140, 255, 0.14);
      border: 1px solid rgba(122, 162, 255, 0.45);
      border-radius: 999px;
      box-shadow: 0 0 12px rgba(96, 140, 255, 0.25);
    }

    .brand-sub {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 6px 0 0 2px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);

      .en {
        letter-spacing: 3px;
        color: rgba(140, 170, 255, 0.65);
      }

      .divider {
        width: 1px;
        height: 10px;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .brand-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 24px;
    color: #fff;
    background: linear-gradient(135deg, #1677ff, #00b96b);
    border-radius: 14px;
    box-shadow:
      0 10px 26px -8px rgba(59, 130, 246, 0.7),
      0 0 24px rgba(34, 211, 238, 0.35);
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-name {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.portal-main {
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 44px 28px 48px;
}

/* ====== 斜切竖长卡片网格（黄金比例 宽:高 ≈ 1:1.618）====== */
/* 斜切加在网格容器上：所有卡片同处一个斜切平面，列边缘为连续斜直线，
   既保留倾斜感又保证每列卡片完全对齐（不会出现单卡斜切的锯齿跳位） */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  align-items: start; /* 禁用拉伸，保证 aspect-ratio 生效 */
  gap: 18px 20px;
  transform: skewX(-6deg);
}

.sys-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 0.618;
  min-height: 190px;
  padding: 18px 10px 16px;
  cursor: pointer;
  animation: card-in 0.5s backwards;
  transition:
    transform 0.2s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  /* 行间浅虚线：左右各延伸 10px 与相邻卡片相连，横贯整排 */
  &::before {
    content: '';
    position: absolute;
    top: calc(100% + 8px);
    right: -10px;
    left: -10px;
    border-top: 1px dashed rgba(255, 255, 255, 0.16);
  }

  &:hover {
    transform: translateY(-5px);
  }

  /* 视觉盒：默认即「点亮」态——主题色边框 + 染色背景 + 霓虹光晕 */
  .card-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.96),
      color-mix(in srgb, var(--sys-color) 12%, #fff)
    );
    border: 1px solid var(--sys-color);
    border-radius: 8px;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    box-shadow:
      0 0 22px -2px color-mix(in srgb, var(--sys-color) 55%, transparent),
      0 14px 30px -14px rgba(0, 0, 0, 0.5);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    /* 旋转霓虹流光边框 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 2px;
      background: conic-gradient(
        from var(--spin),
        transparent 0turn 0.5turn,
        var(--sys-color) 0.72turn,
        color-mix(in srgb, var(--sys-color) 40%, #fff) 0.82turn,
        transparent 0.95turn
      );
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      mask-composite: exclude;
      opacity: 1;
      pointer-events: none;
      animation: border-spin 2.6s linear infinite;
      transition: opacity 0.3s ease;
    }

    /* 扫光特效（悬停触发） */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -60%;
      width: 40%;
      height: 100%;
      background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.6), transparent);
      transform: skewX(18deg);
      pointer-events: none;
      transition: left 0.6s ease;
    }
  }

  &:hover .card-clip {
    box-shadow:
      0 18px 38px -12px rgba(0, 0, 0, 0.6),
      0 0 32px 0 color-mix(in srgb, var(--sys-color) 80%, transparent);

    &::after {
      left: 130%;
    }
  }

  .card-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    transform: skewX(6deg); /* 反向抵消网格斜切，内容保持水平 */
  }

  .card-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 17px;
    color: #fff;
    background: var(--sys-color);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--sys-color) 78%, #fff),
      var(--sys-color) 55%,
      color-mix(in srgb, var(--sys-color) 70%, #000)
    );
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    box-shadow: 0 0 14px -2px color-mix(in srgb, var(--sys-color) 75%, transparent);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  &:hover .card-icon {
    transform: translateY(-3px) scale(1.16) rotate(-6deg);
    box-shadow: 0 0 22px -2px color-mix(in srgb, var(--sys-color) 90%, transparent);
  }

  .card-text {
    min-width: 0;
    width: 100%;
    text-align: center;

    .card-name {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #2a394d;
      transition: color 0.2s;
    }

    .card-desc {
      display: -webkit-box;
      margin: 4px 0 0;
      overflow: hidden;
      font-size: 10px;
      line-height: 15px;
      color: rgba(0, 0, 0, 0.45);
      text-overflow: ellipsis;
      word-break: break-all;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
  }

  .card-status {
    position: absolute;
    z-index: 1;
    top: 7px;
    right: 8px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 9px;
    color: rgba(0, 0, 0, 0.4);
    transform: skewX(6deg);

    .dot {
      position: relative;
      width: 4px;
      height: 4px;
      background: #00b96b;
      border-radius: 50%;

      /* 脉冲扩散特效 */
      &::after {
        content: '';
        position: absolute;
        inset: -2px;
        border: 1px solid #00b96b;
        border-radius: 50%;
        animation: dot-pulse 2s ease-out infinite;
      }
    }
  }

  .card-index {
    position: absolute;
    z-index: 1;
    right: 8px;
    bottom: 5px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
    color: color-mix(in srgb, var(--sys-color) 26%, transparent);
    transform: skewX(6deg);
  }

  /* 上次使用：绿色小标签（跟随系统名显示） */
  .last-chip {
    flex-shrink: 0;
    padding: 0 4px;
    font-size: 9px;
    font-weight: 400;
    line-height: 13px;
    color: #fff;
    background: #00b96b;
    border-radius: 7px;
    box-shadow: 0 0 8px rgba(0, 185, 107, 0.6);
  }

  /* 建设中：弱化，关闭点亮态与流光 */
  &.building .card-clip {
    background: rgba(255, 255, 255, 0.6);
    border: 1px dashed rgba(255, 255, 255, 0.4);
    box-shadow: none;

    /* 建设中：关闭霓虹流光 */
    &::before {
      display: none;
    }
  }

  &.building {
    .card-icon {
      color: #fff;
      background: #b7c9d3;
      box-shadow: none;
    }

    .card-name {
      color: rgba(0, 0, 0, 0.45);
    }

    .card-index {
      color: rgba(0, 0, 0, 0.08);
    }

    &:hover .card-clip {
      border-color: rgba(255, 255, 255, 0.7);
      box-shadow: 0 14px 26px -14px rgba(0, 0, 0, 0.5);
    }
  }
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes border-spin {
  to {
    --spin: 360deg;
  }
}

@keyframes dot-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}

.portal-footer {
  position: relative;
  z-index: 1;
  padding: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}
</style>
