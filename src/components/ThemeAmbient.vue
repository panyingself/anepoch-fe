<template>
  <div class="ambient">
    <!-- 星空主题：闪烁星星 + 流星 + 深空光球 -->
    <template v-if="mode === 'starry'">
      <span v-for="i in 28" :key="`s-${i}`" class="star" :style="starStyle(i)" />
      <span v-for="i in 10" :key="`m-${i}`" class="meteor" :style="meteorStyle(i)" />
      <span class="orb o-blue" />
      <span class="orb o-cyan" />
    </template>

    <!-- 炫彩星空：极光 + 瀑布流星雨 -->
    <template v-else-if="mode === 'nebula'">
      <span class="aurora au-pink" />
      <span class="aurora au-violet" />
      <span class="aurora au-blue" />
      <span v-for="i in 14" :key="`r-${i}`" class="rain" :style="rainStyle(i)" />
    </template>

    <!-- 七彩梦幻泡沫：糖果泡泡 + 彩雾 -->
    <template v-else-if="mode === 'bubble'">
      <span class="rainbow-mist rm-1" />
      <span class="rainbow-mist rm-2" />
      <span class="rainbow-mist rm-3" />
      <span v-for="i in 16" :key="`c-${i}`" class="candy" :style="candyStyle(i)" />
    </template>

    <!-- 画墨：远山 + 飞雁 -->
    <template v-else-if="mode === 'ink'">
      <span class="mountain mt-1" />
      <span class="mountain mt-2" />
      <span v-for="i in 11" :key="`b-${i}`" class="bird" :style="birdStyle(i)">
        <i class="wing wl" />
        <i class="wing wr" />
      </span>
    </template>

    <!-- 宝石绿：仅保留树叶飘落 -->
    <template v-else-if="mode === 'emerald'">
      <span v-for="i in 12" :key="`l-${i}`" class="leaf" :style="leafStyle(i)" />
    </template>

    <!-- 基础主题：干净清新，无氛围动效 -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const mode = computed(() => themeStore.current)

/** 确定性伪随机：同一索引每次渲染分布一致，避免 HMR 抖动 */
function rnd(i: number, min: number, max: number) {
  return min + (((i * 137 + 41) % 100) / 100) * (max - min)
}

// ---------- 星空 ----------
function starStyle(i: number): CSSProperties {
  const size = rnd(i, 1.5, 3)
  return {
    left: `${rnd(i, 0, 100)}%`,
    top: `${rnd(i, 0, 100)}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${rnd(i, 0, 5)}s`,
    animationDuration: `${rnd(i, 2.2, 5)}s`,
  }
}

function meteorStyle(i: number): CSSProperties {
  return {
    left: `${rnd(i, 4, 84)}%`,
    top: `${rnd(i, 2, 42)}%`,
    animationDelay: `${rnd(i, 0, 6)}s`,
    animationDuration: `${rnd(i, 3.5, 7)}s`,
  }
}

// ---------- 炫彩星空：瀑布流星雨 ----------
const rainColors = ['#ff9ff3', '#c4b5fd', '#93c5fd']

function rainStyle(i: number): CSSProperties {
  return {
    left: `${rnd(i, 2, 94)}%`,
    top: `${rnd(i, -12, 6)}%`,
    background: `linear-gradient(90deg, transparent 0%, ${rainColors[(i - 1) % rainColors.length]} 100%)`,
    animationDelay: `${rnd(i, 0, 7)}s`,
    animationDuration: `${rnd(i, 2.6, 5)}s`,
  }
}

// ---------- 七彩梦幻泡沫 ----------
const candyPalette: Array<[string, string]> = [
  ['#fda4d3', '#f472b6'], // 粉
  ['#d8b4fe', '#a855f7'], // 紫
  ['#93c5fd', '#3b82f6'], // 蓝
  ['#86efac', '#22c55e'], // 绿
  ['#fde68a', '#f59e0b'], // 金
  ['#fca5a5', '#f43f5e'], // 玫
]

function candyStyle(i: number): CSSProperties {
  const size = rnd(i, 26, 64)
  const [c1, c2] = candyPalette[(i - 1) % candyPalette.length]
  return {
    left: `${rnd(i, 3, 92)}%`,
    top: `${rnd(i, 8, 78)}%`,
    width: `${size}px`,
    height: `${size}px`,
    '--c1': c1,
    '--c2': c2,
    animationDelay: `${rnd(i, 0, 8)}s`,
    animationDuration: `${rnd(i, 9, 16)}s`,
  } as CSSProperties
}

// ---------- 画墨 ----------
function birdStyle(i: number): CSSProperties {
  return {
    top: `${rnd(i, 6, 38)}%`,
    animationDelay: `${rnd(i, 0, 30)}s`,
    animationDuration: `${rnd(i, 30, 48)}s`,
  }
}

// ---------- 宝石绿 ----------
function leafStyle(i: number): CSSProperties {
  return {
    left: `${rnd(i, 2, 96)}%`,
    animationDelay: `${rnd(i, 0, 10)}s`,
    animationDuration: `${rnd(i, 9, 16)}s`,
  }
}

</script>

<style scoped lang="less">
.ambient {
  position: fixed;
  inset: 0;
  z-index: 900;
  overflow: hidden;
  pointer-events: none;
}

/* ====== 星空 ====== */
.star {
  position: absolute;
  border-radius: 50%;
  background: #cfe4ff;
  box-shadow: 0 0 6px 1px rgba(160, 200, 255, 0.7);
  animation: twinkle ease-in-out infinite alternate;
}

.meteor {
  position: absolute;
  width: 140px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 225, 255, 0.9) 100%);
  animation: meteor-fall linear infinite;
  opacity: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: float-slow 12s ease-in-out infinite alternate;

  &.o-blue {
    left: -60px;
    bottom: -80px;
    width: 260px;
    height: 260px;
    background: rgba(77, 159, 255, 0.16);
  }

  &.o-cyan {
    right: -40px;
    top: -60px;
    width: 200px;
    height: 200px;
    background: rgba(34, 211, 238, 0.13);
    animation-delay: -6s;
  }
}

/* ====== 炫彩星空 ====== */
.aurora {
  position: absolute;
  width: 560px;
  height: 220px;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.42;
  animation: aurora-drift 14s ease-in-out infinite alternate;

  &.au-pink {
    left: -6%;
    top: -6%;
    background: rgba(255, 121, 198, 0.4);
  }

  &.au-violet {
    right: -8%;
    top: 8%;
    background: rgba(167, 139, 250, 0.36);
    animation-delay: -5s;
  }

  &.au-blue {
    left: 30%;
    bottom: -10%;
    background: rgba(96, 165, 250, 0.3);
    animation-delay: -9s;
  }
}

.rain {
  position: absolute;
  width: 130px;
  height: 2.5px;
  border-radius: 2px;
  animation: rain-fall linear infinite;
  opacity: 0;
}

/* ====== 七彩梦幻泡沫 ====== */
.rainbow-mist {
  position: absolute;
  width: 480px;
  height: 320px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: mist-drift 14s ease-in-out infinite alternate;

  &.rm-1 {
    left: -8%;
    top: -8%;
    background: rgba(244, 114, 182, 0.4);
  }

  &.rm-2 {
    right: -10%;
    top: 6%;
    background: rgba(56, 189, 248, 0.35);
    animation-delay: -5s;
  }

  &.rm-3 {
    left: 28%;
    bottom: -12%;
    background: rgba(192, 132, 252, 0.32);
    animation-delay: -9s;
  }
}

.candy {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 26%, rgba(255, 255, 255, 0.9) 0%, var(--c1) 42%, var(--c2) 100%);
  box-shadow:
    0 10px 26px -8px var(--c2),
    inset 0 0 14px rgba(255, 255, 255, 0.4);
  opacity: 0.85;
  animation: candy-float ease-in-out infinite alternate;
}

/* ====== 画墨 ====== */
.mountain {
  position: absolute;
  bottom: 0;
  left: -5%;
  width: 110%;

  &.mt-1 {
    height: 24vh;
    background: rgba(62, 58, 51, 0.07);
    clip-path: polygon(0 68%, 9% 44%, 18% 60%, 30% 30%, 42% 56%, 54% 22%, 67% 52%, 78% 36%, 88% 58%, 100% 40%, 100% 100%, 0 100%);
    animation: sway-x 16s ease-in-out infinite alternate;
  }

  &.mt-2 {
    height: 16vh;
    background: rgba(62, 58, 51, 0.05);
    clip-path: polygon(0 50%, 12% 26%, 24% 48%, 37% 18%, 50% 44%, 63% 28%, 75% 50%, 87% 30%, 100% 46%, 100% 100%, 0 100%);
    animation: sway-x-rev 16s ease-in-out infinite alternate;
  }
}

/* ====== 画墨飞雁 ====== */
.bird {
  position: absolute;
  left: -40px;
  width: 26px;
  height: 8px;
  animation: fly linear infinite;

  .wing {
    position: absolute;
    top: 0;
    width: 13px;
    height: 8px;
    border-top: 2px solid rgba(62, 58, 51, 0.6);
    border-radius: 50% 50% 0 0;
  }

  .wl {
    left: 0;
    transform-origin: right bottom;
    animation: flap 0.9s ease-in-out infinite alternate;
  }

  .wr {
    right: 0;
    transform-origin: left bottom;
    animation: flap 0.9s ease-in-out infinite alternate-reverse;
  }
}

/* ====== 宝石绿 ====== */
.leaf {
  position: absolute;
  top: -30px;
  width: 18px;
  height: 18px;
  border-radius: 0 50% 0 50%;
  background: linear-gradient(135deg, #34d399, #059669);
  opacity: 0;
  animation: leaf-fall linear infinite;

  &:nth-child(4n + 2) {
    background: linear-gradient(135deg, #a3e635, #65a30d);
  }
}

/* ====== 动画 ====== */
@keyframes twinkle {
  from {
    opacity: 0.15;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes meteor-fall {
  0% {
    transform: rotate(32deg) translateX(0);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(32deg) translateX(70vw);
    opacity: 0;
  }
}

@keyframes float-slow {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(40px, -30px);
  }
}

@keyframes aurora-drift {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(60px, 30px) scale(1.12);
  }
}

@keyframes rain-fall {
  0% {
    transform: rotate(68deg) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: rotate(68deg) translateX(150vh);
    opacity: 0;
  }
}

@keyframes mist-drift {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(-50px, 40px) scale(1.1);
  }
}

@keyframes candy-float {
  from {
    transform: translateY(0) rotate(0deg);
  }
  to {
    transform: translateY(-34px) rotate(14deg);
  }
}

@keyframes sway-x {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-46px);
  }
}

@keyframes sway-x-rev {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(46px);
  }
}

@keyframes flap {
  from {
    transform: rotate(18deg);
  }
  to {
    transform: rotate(-26deg);
  }
}

@keyframes fly {
  from {
    transform: translateX(-15vw);
  }
  to {
    transform: translateX(115vw);
  }
}

@keyframes leaf-fall {
  0% {
    transform: translate(0, -4vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.75;
  }
  50% {
    transform: translate(5vw, 50vh) rotate(260deg);
  }
  90% {
    opacity: 0.75;
  }
  100% {
    transform: translate(-3vw, 108vh) rotate(540deg);
    opacity: 0;
  }
}
</style>
