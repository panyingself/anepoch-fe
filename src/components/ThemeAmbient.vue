<template>
  <div class="ambient">
    <!-- 星空主题：闪烁星星 + 流星 + 深空光球 -->
    <template v-if="mode === 'starry'">
      <span v-for="i in 64" :key="`s-${i}`" class="star" :style="starStyle(i)" />
      <span v-for="i in 10" :key="`m-${i}`" class="meteor" :style="meteorStyle(i)" />
      <span class="orb o-blue" />
      <span class="orb o-cyan" />
    </template>

    <!-- 炫彩星空：极光 + 瀑布流星雨 -->
    <template v-else-if="mode === 'nebula'">
      <span v-for="i in 42" :key="`n-${i}`" class="nebula-cloud" :style="cloudStyle(i)" />
      <span v-for="i in 14" :key="`r-${i}`" class="rain" :style="rainStyle(i)" />
    </template>

    <!-- 七彩梦幻泡沫：糖果泡泡 + 彩雾 -->
    <template v-else-if="mode === 'bubble'">
      <span class="rainbow-mist rm-1" />
      <span class="rainbow-mist rm-2" />
      <span class="rainbow-mist rm-3" />
      <span v-for="i in 28" :key="`c-${i}`" class="candy" :style="candyStyle(i)" />
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

/** 正弦哈希：生成无规律的确定性散点，避免线性取模形成斜线/网格 */
function hash(i: number, seed: number) {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453
  return v - Math.floor(v)
}

// ---------- 星空 ----------
function starStyle(i: number): CSSProperties {
  const size = 1.2 + hash(i, 4) * 2.2
  return {
    left: `${hash(i, 1) * 100}%`,
    top: `${hash(i, 2) * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${hash(i, 3) * 5}s`,
    animationDuration: `${2.2 + hash(i, 5) * 3.3}s`,
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
const rainColors = ['#ffb3f0', '#8ee9ff', '#9dffd9', '#c4b5fd']

const cloudPalette: Array<[string, string]> = [
  ['rgba(255, 122, 220, 0.9)', 'rgba(255, 90, 200, 0.45)'],
  ['rgba(186, 140, 255, 0.9)', 'rgba(150, 100, 255, 0.45)'],
  ['rgba(110, 224, 255, 0.9)', 'rgba(79, 200, 255, 0.45)'],
  ['rgba(140, 255, 220, 0.85)', 'rgba(111, 240, 201, 0.4)'],
  ['rgba(255, 160, 235, 0.85)', 'rgba(196, 120, 255, 0.4)'],
]

/** 小型星云：随机位置/尺寸/色相/漂移方向，全局缓慢游动 */
function cloudStyle(i: number): CSSProperties {
  const size = 48 + hash(i, 9) * 62
  const [c1, c2] = cloudPalette[(i - 1) % cloudPalette.length]
  return {
    left: `${hash(i, 7) * 100}%`,
    top: `${hash(i, 8) * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    '--c1': c1,
    '--c2': c2,
    '--dx': `${(hash(i, 10) - 0.5) * 260}px`,
    '--dy': `${(hash(i, 11) - 0.5) * 220}px`,
    '--ds': `${0.85 + hash(i, 12) * 0.5}`,
    animationDuration: `${8 + hash(i, 13) * 6}s`,
    animationDelay: `-${hash(i, 14) * 12}s`,
  } as CSSProperties
}

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
  const size = 22 + hash(i, 15) * 42
  const [c1, c2] = candyPalette[(i - 1) % candyPalette.length]
  return {
    left: `${hash(i, 16) * 100}%`,
    top: `${hash(i, 17) * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    '--c1': c1,
    '--c2': c2,
    animationDelay: `${hash(i, 18) * 8}s`,
    animationDuration: `${9 + hash(i, 19) * 7}s`,
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
.nebula-cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.72;
  mix-blend-mode: screen;
  background: radial-gradient(closest-side, var(--c1) 0%, var(--c2) 45%, transparent 80%);
  animation: nebula-float ease-in-out infinite alternate;
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
  opacity: 0.22;
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
  opacity: 0.6;
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

@keyframes nebula-float {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(var(--dx), var(--dy)) scale(var(--ds));
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
