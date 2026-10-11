<template>
  <div class="cosmic-bg" aria-hidden="true">
    <!-- 七彩星云 -->
    <div class="bg-nebula"><i class="n1" /><i class="n2" /><i class="n3" /></div>
    <!-- 闪烁星空 -->
    <div class="bg-stars"></div>
    <div class="bg-stars s2"></div>
    <!-- 空间镜像碎片 -->
    <div class="bg-shards">
      <i
        v-for="(s, i) in shards"
        :key="`sh-${i}`"
        :style="{
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          opacity: s.opacity,
          clipPath: s.shape,
          '--rot': `${s.rot}deg`,
          animationDuration: `${s.dur}s, ${4 + (i % 4)}s`,
          animationDelay: `${s.delay}s, ${-(i * 1.7)}s`,
        }"
      />
    </div>
    <!-- 流星雨 -->
    <div class="bg-meteors">
      <span
        v-for="(m, i) in meteors"
        :key="`mt-${i}`"
        :style="{
          left: `${m.left}%`,
          top: `${m.top}%`,
          background: `linear-gradient(90deg, ${m.color}, transparent)`,
          boxShadow: `0 0 8px ${m.color}`,
          animationDuration: `${m.duration}s`,
          animationDelay: `${m.delay}s`,
        }"
      />
    </div>
    <!-- 旋转行星（土星环 + 3D 卫星公转） -->
    <div class="bg-planets">
      <div class="planet p1">
        <i class="ring3d" />
        <div class="moon-orbit"><i class="moon" /></div>
      </div>
      <div class="planet p2" />
    </div>
    <!-- 霓虹线框立方体 -->
    <div class="bg-space">
      <div class="bg-cube cube-blue"><i /><i /><i /><i /><i /><i /></div>
      <div class="bg-cube cube-green"><i /><i /><i /><i /><i /><i /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 镜像碎片：多边形玻璃碎块，确定性伪随机分布 */
const shardShapes = [
  'polygon(0 18%, 70% 0, 100% 55%, 45% 100%, 8% 78%)',
  'polygon(20% 0, 100% 22%, 78% 100%, 0 70%)',
  'polygon(0 0, 100% 12%, 82% 90%, 12% 100%)',
  'polygon(10% 0, 100% 38%, 70% 100%, 0 62%)',
  'polygon(0 30%, 62% 0, 100% 70%, 38% 100%)',
  'polygon(15% 5%, 100% 0, 88% 82%, 0 100%)',
  'polygon(0 12%, 84% 0, 100% 64%, 55% 100%, 0 85%)',
  'polygon(8% 0, 100% 18%, 92% 100%, 0 78%)',
  'polygon(0 0, 88% 10%, 100% 100%, 18% 88%)',
]

const shards = Array.from({ length: 9 }, (_, i) => ({
  left: [4, 16, 30, 46, 58, 72, 84, 90, 24][i],
  top: [12, 64, 8, 70, 30, 12, 48, 78, 88][i],
  size: 46 + ((i * 23) % 60),
  rot: (i * 47) % 360,
  dur: 16 + ((i * 7) % 14),
  delay: -(i * 3.3),
  opacity: Number((0.35 + ((i * 13) % 30) / 100).toFixed(2)),
  shape: shardShapes[i % shardShapes.length],
}))

/** 流星雨：多彩交错划过 */
const meteorColors = ['#7ee0ff', '#c9a7ff', '#8affc1', '#ffd166', '#ff9ecd']
const meteors = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 11 + 5) % 92,
  top: (i * 7) % 34,
  duration: Number((5.5 + ((i * 17) % 40) / 10).toFixed(1)),
  delay: -Number(((i * 2.9) % 30).toFixed(1)),
  color: meteorColors[i % meteorColors.length],
}))
</script>

<style scoped lang="less">
.cosmic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ====== 七彩星云 ====== */
.bg-nebula {
  position: absolute;
  inset: 0;

  i {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.5;
    animation:
      nebula-hue 18s linear infinite,
      nebula-drift 22s ease-in-out infinite alternate;
  }

  .n1 {
    top: -15%;
    left: -10%;
    width: 520px;
    height: 420px;
    background: radial-gradient(circle at 35% 35%, #3b2f8f, #6a3df0 45%, transparent 72%);
  }

  .n2 {
    right: -8%;
    bottom: -18%;
    width: 560px;
    height: 460px;
    background: radial-gradient(circle at 60% 40%, #0e7a8f, #22d3ee 40%, #7c3aed 70%, transparent 78%);
    animation-delay: -6s, -3s;
  }

  .n3 {
    top: 28%;
    left: 38%;
    width: 420px;
    height: 360px;
    opacity: 0.35;
    background: radial-gradient(circle at 50% 50%, #b32e8f, #ec4899 40%, transparent 75%);
    animation-delay: -12s, -9s;
  }
}

@keyframes nebula-hue {
  to {
    filter: blur(90px) hue-rotate(360deg);
  }
}

@keyframes nebula-drift {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(40px, -30px) scale(1.08);
  }
}

/* ====== 闪烁星空 ====== */
.bg-stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 25px 35px, rgba(255, 255, 255, 0.9), transparent 55%),
    radial-gradient(1px 1px at 120px 90px, rgba(255, 255, 255, 0.7), transparent 55%),
    radial-gradient(1.5px 1.5px at 200px 40px, rgba(255, 255, 255, 0.85), transparent 55%),
    radial-gradient(1px 1px at 300px 160px, rgba(255, 255, 255, 0.6), transparent 55%),
    radial-gradient(1.5px 1.5px at 80px 200px, rgba(255, 255, 255, 0.75), transparent 55%),
    radial-gradient(1px 1px at 260px 240px, rgba(255, 255, 255, 0.65), transparent 55%);
  background-size: 340px 260px;
  animation: star-twinkle 4s ease-in-out infinite alternate;

  &.s2 {
    background-size: 220px 180px;
    background-position: 60px 30px;
    opacity: 0.6;
    animation-duration: 6s;
    animation-direction: alternate-reverse;
  }
}

@keyframes star-twinkle {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
}

/* ====== 空间镜像碎片（3D 漂浮玻璃碎块 + 高光闪烁）====== */
.bg-shards {
  position: absolute;
  inset: 0;
  perspective: 1000px;

  i {
    position: absolute;
    background: linear-gradient(
      135deg,
      rgba(190, 225, 255, 0.42),
      rgba(255, 255, 255, 0.05) 42%,
      rgba(120, 160, 255, 0.22) 78%,
      rgba(255, 255, 255, 0.4)
    );
    filter: drop-shadow(0 0 8px rgba(140, 180, 255, 0.35));
    animation:
      shard-float ease-in-out infinite alternate,
      shard-glint 5s ease-in-out infinite;
  }
}

@keyframes shard-float {
  from {
    transform: translate3d(0, 0, 0) rotate(var(--rot, 0deg)) rotateX(0deg);
  }
  to {
    transform: translate3d(14px, -22px, 40px) rotate(calc(var(--rot, 0deg) + 14deg)) rotateX(8deg);
  }
}

@keyframes shard-glint {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(140, 180, 255, 0.35)) brightness(1);
  }
  50% {
    filter: drop-shadow(0 0 14px rgba(170, 205, 255, 0.6)) brightness(1.55);
  }
}

/* ====== 流星雨 ====== */
.bg-meteors {
  position: absolute;
  inset: 0;
  overflow: hidden;

  span {
    position: absolute;
    width: 150px;
    height: 2px;
    border-radius: 2px;
    opacity: 0;
    transform: rotate(-32deg);
    animation: meteor-fly linear infinite;
  }
}

@keyframes meteor-fly {
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(-32deg);
  }
  8% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-38vw, 26vh) rotate(-32deg);
  }
}

/* ====== 旋转行星（3D 卫星公转）====== */
.bg-planets {
  position: absolute;
  inset: 0;
  perspective: 800px;

  .planet {
    position: absolute;
    border-radius: 50%;
  }

  /* 主行星：带星环与公转卫星 */
  .p1 {
    top: 14%;
    right: 9%;
    width: 110px;
    height: 110px;
    background: radial-gradient(circle at 32% 28%, #a8ccff 0%, #4a7fe0 38%, #16244d 75%, #0a1226 100%);
    box-shadow:
      inset -18px -14px 34px rgba(0, 0, 10, 0.7),
      inset 6px 6px 18px rgba(160, 200, 255, 0.25),
      0 0 34px -6px rgba(90, 140, 255, 0.4);
    transform-style: preserve-3d;
    animation: planet-drift 26s ease-in-out infinite alternate;

    .ring3d {
      position: absolute;
      inset: -26%;
      border: 2px solid rgba(160, 200, 255, 0.4);
      border-radius: 50%;
      transform: rotateX(74deg);
      box-shadow: 0 0 12px rgba(120, 170, 255, 0.35);
    }

    .moon-orbit {
      position: absolute;
      inset: -34%;
      transform-style: preserve-3d;
      animation: moon-orbit 14s linear infinite;

      .moon {
        position: absolute;
        top: 50%;
        left: -7px;
        width: 14px;
        height: 14px;
        margin-top: -7px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #e8f2ff, #8fa8c8 55%, #3a4a66 90%);
        box-shadow: 0 0 10px rgba(200, 225, 255, 0.6);
      }
    }
  }

  /* 次行星：紫色小星体 */
  .p2 {
    bottom: 15%;
    left: 7%;
    width: 64px;
    height: 64px;
    background: radial-gradient(circle at 34% 30%, #e2c8ff, #8a5cd6 42%, #241447 78%, #120a26 100%);
    box-shadow:
      inset -10px -8px 22px rgba(0, 0, 12, 0.7),
      0 0 26px -6px rgba(150, 100, 255, 0.45);
    animation: planet-drift 34s ease-in-out infinite alternate-reverse;
  }
}

@keyframes moon-orbit {
  from {
    transform: rotateX(16deg) rotateY(0deg);
  }
  to {
    transform: rotateX(16deg) rotateY(360deg);
  }
}

@keyframes planet-drift {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-18px);
  }
}

/* ====== 霓虹线框立方体 ====== */
.bg-space {
  position: absolute;
  inset: 0;
  perspective: 900px;
}

.bg-cube {
  position: absolute;
  transform-style: preserve-3d;
  opacity: 0.32;
  animation:
    cube-spin 20s linear infinite,
    cube-hue 12s linear infinite;

  i {
    position: absolute;
    inset: 0;
    border: 1.5px solid #6ea8ff;
    background: rgba(110, 168, 255, 0.08);
    box-shadow: 0 0 18px rgba(110, 168, 255, 0.35);
  }

  i:nth-child(1) { transform: rotateY(0deg) translateZ(85px); }
  i:nth-child(2) { transform: rotateY(90deg) translateZ(85px); }
  i:nth-child(3) { transform: rotateY(180deg) translateZ(85px); }
  i:nth-child(4) { transform: rotateY(270deg) translateZ(85px); }
  i:nth-child(5) { transform: rotateX(90deg) translateZ(85px); }
  i:nth-child(6) { transform: rotateX(-90deg) translateZ(85px); }
}

.cube-blue {
  top: 9%;
  right: 22%;
  width: 170px;
  height: 170px;
}

.cube-green {
  bottom: 8%;
  left: 20%;
  width: 110px;
  height: 110px;
  opacity: 0.28;
  animation:
    cube-spin 30s linear infinite reverse,
    cube-hue 12s linear infinite;

  i {
    border-color: #4ade80;
    background: rgba(74, 222, 128, 0.08);
    box-shadow: 0 0 14px rgba(74, 222, 128, 0.35);
  }

  i:nth-child(1) { transform: rotateY(0deg) translateZ(55px); }
  i:nth-child(2) { transform: rotateY(90deg) translateZ(55px); }
  i:nth-child(3) { transform: rotateY(180deg) translateZ(55px); }
  i:nth-child(4) { transform: rotateY(270deg) translateZ(55px); }
  i:nth-child(5) { transform: rotateX(90deg) translateZ(55px); }
  i:nth-child(6) { transform: rotateX(-90deg) translateZ(55px); }
}

@keyframes cube-spin {
  from {
    transform: rotateX(-20deg) rotateY(0deg);
  }
  to {
    transform: rotateX(-20deg) rotateY(360deg);
  }
}

@keyframes cube-hue {
  to {
    filter: hue-rotate(360deg);
  }
}
</style>
