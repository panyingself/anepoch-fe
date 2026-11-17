<template>
  <div ref="rootEl" class="site" :class="{ light: isLight }">
    <!-- 背景：极光 + 网格 + 扫描线 -->
    <div class="site-bg" aria-hidden="true">
      <span class="aurora aurora-a" />
      <span class="aurora aurora-b" />
      <span class="aurora aurora-c" />
      <span class="grid-plane" />
      <span class="beam" />
    </div>

    <div class="scroll-progress" aria-hidden="true">
      <span :style="{ transform: `scaleX(${progress})` }" />
    </div>
    <div ref="glowEl" class="cursor-glow" aria-hidden="true" />

    <!-- 顶部导航 -->
    <header class="site-header" :class="{ scrolled }">
      <div class="header-inner">
        <a class="brand" href="#home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M16 27.5c-6-3.1-9.2-7.2-9.2-12.3 0-5.9 3.6-9.6 9.2-11.2 5.6 1.6 9.2 5.3 9.2 11.2 0 5.1-3.2 9.2-9.2 12.3Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
              <path d="M16 23.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M16 14.2l4.6-2.6M16 18.6l-4.6-2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="brand-text">
            <strong>怡川塑业</strong>
            <em>YICHUAN · CIRCULAR PLASTIC</em>
          </span>
        </a>

        <nav class="nav">
          <a
            v-for="item in navs"
            :key="item.id"
            :href="`#${item.id}`"
            :class="{ active: activeId === item.id }"
          >
            {{ item.label }}
          </a>
        </nav>

        <button
          class="theme-toggle"
          type="button"
          :aria-label="isLight ? '切换到深色模式' : '切换到浅色模式'"
          :title="isLight ? '切换到深色模式' : '切换到浅色模式'"
          @click="toggleTheme"
        >
          <!-- 浅色模式下显示月亮图标（点击切回深色） -->
          <svg v-if="isLight" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
          <!-- 深色模式下显示太阳图标（点击切换浅色） -->
          <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" />
            <path
              d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <RouterLink class="portal-link" to="/portal">
          <AppstoreOutlined />
          中台门户
        </RouterLink>
      </div>
    </header>

    <main>
      <!-- ===== 首屏 ===== -->
      <section
        id="home"
        ref="heroEl"
        class="hero"
        @mousemove="onHeroMove"
        @mouseleave="onHeroLeave"
      >
        <div class="hero-inner">
          <div class="hero-copy" data-reveal>
            <span class="eyebrow">
              <span class="eyebrow-dot" />
              PLASTIC CIRCULAR TECH · 绿色智造
            </span>
            <h1>
              <span class="line">塑料物流制品</span>
              <span class="line grad">循环再生 · 绿色未来</span>
            </h1>
            <p class="lead">
              可循环 HDPE 原料，打造周转箱、物流箱、托盘、垃圾桶与仓储器具，
              为服装、电子、食品、医药与物流行业提供可重复使用的绿色包装物流方案。
            </p>
            <div class="hero-actions">
              <a class="btn primary" href="#products">
                探索产品矩阵
                <ArrowRightOutlined />
              </a>
              <a class="btn ghost" href="#eco">
                了解绿色循环
                <SyncOutlined />
              </a>
            </div>
            <ul class="hero-points">
              <li v-for="p in heroPoints" :key="p">
                <CheckCircleFilled />
                {{ p }}
              </li>
            </ul>
          </div>

          <div class="hero-visual" :style="{ transform: heroTilt }">
            <div class="globe-stage">
              <div class="globe-glow" aria-hidden="true" />
              <canvas ref="globeCanvas" class="globe-canvas" aria-hidden="true" />
              <span class="hud hud-tl" aria-hidden="true" />
              <span class="hud hud-br" aria-hidden="true" />
              <span class="hud-label hud-label-a" aria-hidden="true">CIRCULAR LOOP</span>
              <span class="hud-label hud-label-b" aria-hidden="true">CHONGQING · CN</span>
              <div class="orbit orbit-a" aria-hidden="true"><i /></div>
              <div class="orbit orbit-b" aria-hidden="true"><i /></div>
              <div class="orbit orbit-c" aria-hidden="true"><i /></div>
              <div class="orbit orbit-d" aria-hidden="true"><i /></div>
              <div class="chip chip-a">
                <span class="chip-dot" />
                可循环 HDPE
                <small>RECYCLABLE</small>
              </div>
              <div class="chip chip-b">
                <span class="chip-dot" />
                20+ 年制造经验
                <small>SINCE 2003</small>
              </div>
              <div class="chip chip-c">
                <span class="chip-dot" />
                支持定制加工
                <small>CUSTOM</small>
              </div>
            </div>
          </div>
        </div>
        <div class="scroll-hint">
          <span>SCROLL</span>
          <i />
        </div>
      </section>

      <!-- 滚动跑马灯 -->
      <div class="ticker" aria-hidden="true">
        <div class="ticker-track">
          <span v-for="(t, i) in tickerLoop" :key="i" class="ticker-item">
            {{ t }}
            <i />
          </span>
        </div>
      </div>

      <!-- ===== 数据条 ===== -->
      <section class="stats">
        <div
          v-for="(s, i) in stats"
          :key="s.label"
          class="stat"
          data-reveal
          :style="{ '--d': `${i * 90}ms` }"
        >
          <strong>
            <span class="num" :data-count="s.value">{{ s.value }}</span>
            <em>{{ s.suffix }}</em>
          </strong>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </section>

      <!-- ===== 产品展示 ===== -->
      <section id="products" class="section">
        <header class="section-head" data-reveal>
          <span class="section-tag"><b>01</b> PRODUCT MATRIX</span>
          <h2>产品矩阵</h2>
          <p>覆盖物流周转、仓储存储与环卫分类的全场景可循环塑料制品</p>
        </header>

        <!-- 展示形态切换：3D 空间 / 平面网格 / 横向轮播 -->
        <div class="view-switch" data-reveal>
          <span class="switch-glider" :style="{ transform: `translateX(${modeIndex * 100}%)` }" />
          <button
            v-for="m in viewModes"
            :key="m.key"
            class="switch-btn"
            :class="{ active: viewMode === m.key }"
            @click="viewMode = m.key"
          >
            <component :is="m.icon" />
            {{ m.label }}
          </button>
        </div>

        <!-- 3D 立体空间旋转 -->
        <div
          v-if="viewMode === 'space'"
          class="stage-3d"
          data-reveal
          @pointerdown="onRingPointerDown"
          @pointermove="onRingPointerMove"
          @pointerup="onRingPointerUp"
          @pointercancel="onRingPointerUp"
          @mouseenter="ringHover = true"
          @mouseleave="ringHover = false"
        >
          <span class="stage-glow" aria-hidden="true" />
          <span class="stage-floor" aria-hidden="true" />
          <span class="stage-ring" aria-hidden="true" />
          <div ref="ringEl" class="ring-3d">
            <article
              v-for="(p, i) in products"
              :key="p.name"
              class="p3d-card"
              :style="{ transform: `rotateY(${i * stepDeg}deg) translateZ(320px)` }"
            >
              <div class="p3d-thumb">
                <img :src="p.img" :alt="p.name" loading="lazy" />
                <span class="p3d-tag">{{ p.tag }}</span>
              </div>
              <div class="p3d-meta">
                <h3>{{ p.name }}</h3>
                <p>{{ p.desc }}</p>
              </div>
            </article>
          </div>
          <div class="stage-hint">
            <span />
            拖拽旋转 · 悬停暂停
          </div>
        </div>

        <!-- 平面网格 -->
        <div v-else-if="viewMode === 'grid'" class="product-grid">
          <article
            v-for="(p, i) in products"
            :key="p.name"
            class="product-card"
            data-reveal
            :style="{ '--d': `${(i % 4) * 70}ms` }"
            @mousemove="onCardMove"
            @mouseleave="onCardLeave"
          >
            <div class="product-thumb">
              <img :src="p.img" :alt="p.name" loading="lazy" />
              <span class="product-tag">{{ p.tag }}</span>
              <span class="thumb-glow" aria-hidden="true" />
            </div>
            <div class="product-body">
              <h3>{{ p.name }}</h3>
              <p>{{ p.desc }}</p>
              <span class="product-more">
                查看详情
                <ArrowRightOutlined />
              </span>
            </div>
            <span class="card-shine" aria-hidden="true" />
          </article>
        </div>

        <!-- 横向轮播 -->
        <div v-else class="carousel-wrap">
          <div ref="carouselEl" class="carousel">
            <div class="carousel-track">
              <article v-for="p in products" :key="p.name" class="carousel-card">
                <div class="carousel-thumb">
                  <img :src="p.img" :alt="p.name" loading="lazy" />
                  <span class="product-tag">{{ p.tag }}</span>
                  <span class="carousel-shine" aria-hidden="true" />
                </div>
                <div class="carousel-body">
                  <h3>{{ p.name }}</h3>
                  <p>{{ p.desc }}</p>
                </div>
              </article>
            </div>
          </div>
          <div class="carousel-nav">
            <button class="car-nav-btn" aria-label="上一个" @click="slide(-1)">
              <LeftOutlined />
            </button>
            <button class="car-nav-btn" aria-label="下一个" @click="slide(1)">
              <RightOutlined />
            </button>
          </div>
        </div>
      </section>

      <!-- ===== 绿色循环 ===== -->
      <section id="eco" class="section eco">
        <div class="eco-copy" data-reveal>
          <span class="section-tag"><b>02</b> GREEN CIRCULARITY</span>
          <h2>让每一次周转<br /><span class="grad">都更绿色</span></h2>
          <p class="eco-lead">
            塑料不是一次性的代名词。以可循环原料、可重复使用产品与可回收再生体系，
            让包装物流从线性消耗走向循环闭环。
          </p>
          <ul class="eco-list">
            <li v-for="(e, i) in ecoItems" :key="e.title" :style="{ '--d': `${i * 90}ms` }">
              <span class="eco-icon">
                <component :is="e.icon" />
              </span>
              <div>
                <h4>{{ e.title }}</h4>
                <p>{{ e.desc }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="eco-visual" data-reveal>
          <div class="eco-orbit">
            <span class="eco-ring ring-1" />
            <span class="eco-ring ring-2" />
            <span class="eco-ring ring-3" />
            <span class="eco-core">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path
                  d="M24 42c-9.6-4.6-14.5-11-14.5-19C9.5 14 14.9 7.9 24 5.5c9.1 2.4 14.5 8.5 14.5 17.5 0 8-4.9 14.4-14.5 19Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path d="M24 36V15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M24 22.5l7-4M24 28l-7-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              <em>CIRCULAR</em>
            </span>
            <span class="eco-node node-1">回收再生</span>
            <span class="eco-node node-2">低碳制造</span>
            <span class="eco-node node-3">循环物流</span>
          </div>
        </div>
      </section>

      <!-- ===== 核心优势 ===== -->
      <section id="why" class="section alt">
        <header class="section-head" data-reveal>
          <span class="section-tag"><b>03</b> WHY YICHUAN</span>
          <h2>为什么选择怡川</h2>
          <p>从原料、生产到交付，每一个环节都精益求精</p>
        </header>

        <div class="feature-grid">
          <article
            v-for="(f, i) in features"
            :key="f.title"
            class="feature-card"
            data-reveal
            :style="{ '--d': `${i * 80}ms` }"
          >
            <span class="feature-index">0{{ i + 1 }}</span>
            <span class="feature-icon">
              <component :is="f.icon" />
            </span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </article>
        </div>
      </section>

      <!-- ===== 关于我们 ===== -->
      <section id="about" class="section about">
        <div class="about-media" data-reveal>
          <span class="media-frame" aria-hidden="true" />
          <img :src="aboutImg" alt="塑料制品生产车间" loading="lazy" />
          <div class="media-badge">
            <strong>CHONGQING</strong>
            <span>重庆 · 生产基地</span>
          </div>
        </div>
        <div class="about-copy" data-reveal>
          <span class="section-tag"><b>04</b> ABOUT YICHUAN</span>
          <h2>关于我们</h2>
          <p>
            重庆怡川塑业有限公司是集塑料物流周转箱、中空板材、仓储笼等物流周转仓储器具设备的专业制造商。
            公司拥有生产技术团队与多年行业生产制造经验，生产设备完善，能够对产品质量与供货需求提供充分保障。
          </p>
          <p>
            依托志同道合的管理、销售、技术及生产一线员工，专业的技术储备、优良齐全的设备与完善的服务体系，
            我们持续为客户提供优良的产品与服务，让可循环塑料制品进入更多行业场景。
          </p>
          <ul class="about-points">
            <li v-for="a in aboutPoints" :key="a">
              <CheckCircleFilled />
              {{ a }}
            </li>
          </ul>
        </div>
      </section>

      <!-- ===== 案例展示 ===== -->
      <section id="cases" class="section alt">
        <header class="section-head" data-reveal>
          <span class="section-tag"><b>05</b> CASE STUDIES</span>
          <h2>落地案例</h2>
          <p>深入环卫、批发、公共设施与社区场景的实践</p>
        </header>

        <div class="case-grid">
          <article
            v-for="(c, i) in cases"
            :key="c.title"
            class="case-card"
            data-reveal
            :style="{ '--d': `${i * 80}ms` }"
          >
            <span class="case-index">0{{ i + 1 }}</span>
            <span class="case-icon">
              <component :is="c.icon" />
            </span>
            <h3>{{ c.title }}</h3>
            <p>{{ c.desc }}</p>
            <span class="case-arrow"><ArrowRightOutlined /></span>
          </article>
        </div>
      </section>

      <!-- ===== 新闻资讯 ===== -->
      <section id="news" class="section">
        <header class="section-head" data-reveal>
          <span class="section-tag"><b>06</b> INSIGHTS</span>
          <h2>新闻资讯</h2>
          <p>产品知识与选型建议，帮助你更高效地完成采购决策</p>
        </header>

        <div class="news-list">
          <article
            v-for="(n, i) in news"
            :key="n.title"
            class="news-row"
            data-reveal
            :style="{ '--d': `${i * 70}ms` }"
          >
            <span class="news-date">{{ n.month }}</span>
            <div class="news-body">
              <h3>{{ n.title }}</h3>
              <p>{{ n.summary }}</p>
            </div>
            <span class="news-arrow"><ArrowRightOutlined /></span>
          </article>
        </div>
      </section>

      <!-- ===== 联系我们 ===== -->
      <section id="contact" class="cta" data-reveal>
        <div class="cta-glow" aria-hidden="true" />
        <div class="cta-inner">
          <span class="section-tag"><b>07</b> CONTACT</span>
          <h2>让每一次周转<br /><span class="grad">都更绿色、更高效</span></h2>
          <p>厂家直销 · 支持按需定制 · 破损包退换 · 两年质保</p>
          <div class="cta-actions">
            <a class="btn primary" href="http://www.ycsycq.com/" target="_blank" rel="noreferrer">
              访问官方网站
              <ExportOutlined />
            </a>
            <RouterLink class="btn ghost" to="/portal">
              返回中台门户
              <AppstoreOutlined />
            </RouterLink>
          </div>
          <div class="cta-meta">
            <span><EnvironmentOutlined /> 重庆市 · 生产基地</span>
            <span><GlobalOutlined /> www.ycsycq.com</span>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="brand">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 27.5c-6-3.1-9.2-7.2-9.2-12.3 0-5.9 3.6-9.6 9.2-11.2 5.6 1.6 9.2 5.3 9.2 11.2 0 5.1-3.2 9.2-9.2 12.3Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path d="M16 23.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </span>
            <span class="brand-text">
              <strong>怡川塑业</strong>
              <em>YICHUAN · CIRCULAR PLASTIC</em>
            </span>
          </div>
          <p>专注塑料物流制品 · 厂家直销 · 支持定制</p>
        </div>
        <div class="footer-col">
          <h4>产品分类</h4>
          <span v-for="p in products.slice(0, 4)" :key="p.name">{{ p.name }}</span>
        </div>
        <div class="footer-col">
          <h4>快速导航</h4>
          <a v-for="item in navs.slice(0, 5)" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
        </div>
        <div class="footer-col">
          <h4>联系我们</h4>
          <span><EnvironmentOutlined /> 重庆市 · 生产基地</span>
          <span><GlobalOutlined /> www.ycsycq.com</span>
          <a class="footer-link" href="http://www.ycsycq.com/" target="_blank" rel="noreferrer">
            前往官网咨询
            <ExportOutlined />
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        ©{{ new Date().getFullYear() }} 重庆怡川塑业有限公司 · 内容参考 ycsycq.com
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  CloudOutlined,
  CustomerServiceOutlined,
  DeploymentUnitOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  SyncOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue'

/** 生成官网配图（SDXL 提示词 + 指定尺寸） */
function img(prompt: string, size: string): string {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

const aboutImg = img(
  'modern clean plastic injection molding factory interior, engineer inspecting recycled plastic granules, green energy lighting, cinematic teal and emerald tones, photorealistic, high detail',
  'landscape_4_3',
)

const navs = [
  { id: 'products', label: '产品展示' },
  { id: 'eco', label: '绿色循环' },
  { id: 'why', label: '核心优势' },
  { id: 'about', label: '关于我们' },
  { id: 'cases', label: '案例展示' },
  { id: 'news', label: '新闻资讯' },
  { id: 'contact', label: '联系我们' },
]

const heroPoints = ['新料 HDPE，抗压韧性强', '支持按需加工定制', '破损包退换 · 两年质保']

const tickerItems = [
  'RECYCLABLE HDPE',
  '可循环原料',
  '低碳制造',
  '重复使用',
  '16 道质检',
  '厂家直销',
  '支持定制',
  '两年质保',
]
const tickerLoop = [...tickerItems, ...tickerItems]

const stats = [
  { value: 20, suffix: '+', label: '年行业制造经验' },
  { value: 100, suffix: '+', label: '产品品类规格' },
  { value: 14, suffix: '+', label: '覆盖行业场景' },
  { value: 2, suffix: ' 年', label: '产品质保承诺' },
]

const products = [
  {
    name: '塑料周转箱',
    desc: '可堆叠结构，承重力强，适用于车间周转与仓储配送。',
    tag: '热销',
    img: img('stack of blue plastic turnover crates, studio product photography, clean dark gradient background with teal rim light, high detail', 'square'),
  },
  {
    name: '塑料物流箱',
    desc: '标准尺寸配套盖板，满足干线运输与分拣作业需求。',
    tag: '物流专用',
    img: img('red plastic logistics box with lid, studio product photography, clean dark gradient background with teal rim light, high detail', 'square'),
  },
  {
    name: '塑料垃圾桶',
    desc: '弹盖、脚踏、四轮多规格，适配社区与环卫分类场景。',
    tag: '环卫系列',
    img: img('green plastic outdoor recycling trash bin, studio product photography, clean dark gradient background with emerald rim light, high detail', 'square'),
  },
  {
    name: '塑料托盘',
    desc: '川字、田字与双面网格结构，适配叉车与货架存储。',
    tag: '仓储配套',
    img: img('blue plastic warehouse pallet, studio product photography, clean dark gradient background with teal rim light, high detail', 'square'),
  },
  {
    name: '可堆周转筐',
    desc: '网孔透气，堆码稳定，适合生鲜果蔬的流通与陈列。',
    tag: '果蔬流通',
    img: img('yellow stackable plastic basket crate, studio product photography, clean dark gradient background with warm rim light, high detail', 'square'),
  },
  {
    name: '铁耳反转套叠箱',
    desc: '铁耳加固，空箱套叠节省空间，满载状态稳定堆码。',
    tag: '结构加固',
    img: img('gray plastic nesting logistics box with metal ears, studio product photography, clean dark gradient background with teal rim light, high detail', 'square'),
  },
  {
    name: '组立零件盒',
    desc: '模块化组合与分类收纳，车间零件管理的实用选择。',
    tag: '精细收纳',
    img: img('set of small plastic parts storage boxes on shelf, studio product photography, clean dark gradient background with teal rim light, high detail', 'square'),
  },
]

const ecoItems = [
  {
    icon: SyncOutlined,
    title: '材料循环',
    desc: '严选可循环 HDPE 新料，抗压韧性好、色泽艳丽，用后可进入回收再生体系。',
  },
  {
    icon: ThunderboltOutlined,
    title: '低碳制造',
    desc: '完整生产流程与齐全设备，持续优化工艺与良品率，减少能耗与废料产生。',
  },
  {
    icon: CloudOutlined,
    title: '重复使用',
    desc: '周转箱、托盘可反复使用，替代一次性包装，降低包装损耗与物流成本。',
  },
]

const features = [
  {
    icon: SafetyCertificateOutlined,
    title: '专注塑料物流制品',
    desc: '优良的生产工艺与流程，严选新料 HDPE，抗压韧性好、色泽艳丽、承重力强，主要生产周转箱、物流箱、托盘、垃圾桶与仓储笼等器具。',
  },
  {
    icon: TeamOutlined,
    title: '生产技术团队',
    desc: '多年行业生产制造经验，持续提高良品率、节省成本，为客户提供完善的包装物流解决方案，每一个环节都精益求精。',
  },
  {
    icon: ExperimentOutlined,
    title: '优良生产设备',
    desc: '设备齐全、生产流程完整，可按要求加工定制，产品广泛应用于服装、五金、电子、食品、水产、医药、物流与立体仓储等行业。',
  },
  {
    icon: CustomerServiceOutlined,
    title: '完善售后服务',
    desc: '一对一售后服务与完善的服务流程，破损包退换、两年质保，提供定时定点物流配送与点对点对接服务。',
  },
]

const aboutPoints = [
  '塑料周转箱 / 物流箱 / 托盘 / 垃圾桶',
  '中空板材、仓储笼等仓储器具',
  '服装、塑胶、五金、电子、食品、医药等多行业应用',
]

const cases = [
  {
    icon: EnvironmentOutlined,
    title: '某街道采购大量环卫垃圾桶',
    desc: '批量交付分类垃圾桶，配合街道完成公共区域环卫设施升级。',
  },
  {
    icon: TrophyOutlined,
    title: '塑料周转箱批发案例展示',
    desc: '为批发客户提供多规格周转箱组合，兼顾周转效率与堆码稳定。',
  },
  {
    icon: GlobalOutlined,
    title: '公共场所塑料垃圾桶采购案例',
    desc: '面向公园、广场等人流密集区域，提供耐用易清洁的环卫产品。',
  },
  {
    icon: TeamOutlined,
    title: '某社区采购塑料垃圾桶案例',
    desc: '按社区分类投放需求配置容量与开盖方式，提升日常保洁效率。',
  },
]

const news = [
  {
    month: '2021-09',
    title: '浅析我国塑料托盘的重要特性',
    summary: '随着公路、铁路、水运、空运与多式联运的成熟，塑料托盘的应用越来越广泛，已成为世界公认的重要运输模式之一。',
  },
  {
    month: '2021-09',
    title: '怎么样去选择一款适合自己的塑料托盘',
    summary: '塑料托盘多采用 PE、PP 等热塑性原料加工而成，选购时需要结合使用环境、承重需求与仓储条件综合判断。',
  },
  {
    month: '2021-09',
    title: '简单讲解关于塑料周转箱的知识',
    summary: '塑料周转箱广泛用于成品、半成品与零件的转运，尺寸选择应首先明确自身应用要求，再匹配货物种类与周转方式。',
  },
  {
    month: '2021-09',
    title: '如何正确挑选塑料垃圾桶？',
    summary: '不同场景对垃圾桶容量、开盖方式与耐用性的要求差异明显，选型时应结合投放频次与使用环境进行评估。',
  },
]

/* ====================== 交互状态 ====================== */

const rootEl = ref<HTMLElement>()
const heroEl = ref<HTMLElement>()
const globeCanvas = ref<HTMLCanvasElement>()
const glowEl = ref<HTMLElement>()

const heroTilt = ref('')
const activeId = ref('home')
const scrolled = ref(false)
const progress = ref(0)

/* ====== 深色 / 浅色模式切换（默认深色，选择持久化） ====== */
const THEME_KEY = 'anepoch_website_theme'
type SiteTheme = 'dark' | 'light'
const theme = ref<SiteTheme>(localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark')
const isLight = computed(() => theme.value === 'light')
function toggleTheme() {
  theme.value = isLight.value ? 'dark' : 'light'
  localStorage.setItem(THEME_KEY, theme.value)
}

/* ====== 产品展示形态：立体空间 / 平面网格 / 轮播浏览 ====== */
type ViewMode = 'space' | 'grid' | 'slider'
const viewMode = ref<ViewMode>('space')
const viewModes: { key: ViewMode; label: string; icon: Component }[] = [
  { key: 'space', label: '立体空间', icon: DeploymentUnitOutlined },
  { key: 'grid', label: '平面网格', icon: AppstoreOutlined },
  { key: 'slider', label: '轮播浏览', icon: SwapOutlined },
]
const modeIndex = computed(() => Math.max(0, viewModes.findIndex((m) => m.key === viewMode.value)))
const stepDeg = 360 / products.length

const ringEl = ref<HTMLElement>()
const carouselEl = ref<HTMLElement>()
const ringHover = ref(false)
const productsVisible = ref(false)

let rafRing = 0
let ringRot = 0
let ringLast = 0
let ringDragging = false
let ringDragX = 0
let ringDragRot = 0
let productsObs: IntersectionObserver | null = null

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let rafGlobe = 0
let rafGlow = 0
let revealObs: IntersectionObserver | null = null
let navObs: IntersectionObserver | null = null
let onScroll: (() => void) | null = null
let onPointer: ((e: PointerEvent) => void) | null = null
let onGlobeResize: (() => void) | null = null

/** 首屏 3D 视差 */
function onHeroMove(e: MouseEvent) {
  const el = heroEl.value
  if (!el || reduceMotion) return
  const r = el.getBoundingClientRect()
  const nx = (e.clientX - r.left) / r.width - 0.5
  const ny = (e.clientY - r.top) / r.height - 0.5
  heroTilt.value = `perspective(1200px) rotateX(${(-ny * 8).toFixed(2)}deg) rotateY(${(nx * 12).toFixed(2)}deg)`
}
function onHeroLeave() {
  heroTilt.value = ''
}

/** 产品卡 3D 悬浮 */
function onCardMove(e: MouseEvent) {
  if (reduceMotion) return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${((px - 0.5) * 10).toFixed(2)}deg`)
  el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
  el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
}
function onCardLeave(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}

/* ====================== 3D 立体产品环 ====================== */

/** 逐帧计算每张卡片相对镜头的角度，驱动透明度与层级 */
function applyRing() {
  const ring = ringEl.value
  if (!ring) return
  ring.style.transform = `rotateY(${ringRot.toFixed(2)}deg)`
  const cards = ring.children
  for (let i = 0; i < cards.length; i++) {
    const el = cards[i] as HTMLElement
    let a = (((i * stepDeg + ringRot) % 360) + 360) % 360
    if (a > 180) a -= 360
    const face = Math.cos((a * Math.PI) / 180)
    const depth = (face + 1) / 2
    el.style.setProperty('--face', face.toFixed(3))
    el.style.opacity = (0.1 + depth * 0.9).toFixed(3)
    el.style.zIndex = String(Math.round(depth * 100))
    el.style.pointerEvents = face > 0.55 ? 'auto' : 'none'
  }
}

function startRing() {
  if (rafRing) return
  ringLast = performance.now()
  const tick = (now: number) => {
    rafRing = requestAnimationFrame(tick)
    const dt = Math.min(now - ringLast, 48)
    ringLast = now
    if (!ringDragging && !ringHover.value && productsVisible.value && !document.hidden) {
      ringRot += reduceMotion ? 0 : dt * 0.013
    }
    applyRing()
  }
  rafRing = requestAnimationFrame(tick)
}

function stopRing() {
  if (rafRing) cancelAnimationFrame(rafRing)
  rafRing = 0
}

function onRingPointerDown(e: PointerEvent) {
  ringDragging = true
  ringDragX = e.clientX
  ringDragRot = ringRot
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onRingPointerMove(e: PointerEvent) {
  if (!ringDragging) return
  ringRot = ringDragRot + (e.clientX - ringDragX) * 0.4
}

function onRingPointerUp() {
  ringDragging = false
}

/** 轮播：按卡片宽度平滑滚动 */
function slide(dir: number) {
  const el = carouselEl.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('.carousel-card')
  const step = (card?.offsetWidth ?? 300) + 20
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

watch(viewMode, (mode) => {
  if (mode === 'space') {
    nextTick(() => {
      ringRot = 0
      applyRing()
      startRing()
    })
  } else {
    stopRing()
  }
})

/* ====================== 3D 粒子地球 ====================== */

function initGlobe() {
  const canvas = globeCanvas.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const COUNT = 1250
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))
  const pts: { x: number; y: number; z: number }[] = []
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - ((i + 0.5) * 2) / COUNT
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const t = GOLDEN * i
    pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r })
  }

  let w = 0
  let h = 0
  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = rect.width
    h = rect.height
    canvas.width = Math.max(1, Math.round(w * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  onGlobeResize = resize
  window.addEventListener('resize', resize)
  resize()

  let angle = 0
  let last = performance.now()
  const tilt = -0.34
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)

  const draw = (now: number) => {
    rafGlobe = requestAnimationFrame(draw)
    if (document.hidden) return
    const dt = Math.min(now - last, 48)
    last = now
    if (!reduceMotion) angle += dt * 0.00022

    const cx = w / 2
    const cy = h / 2
    const R = Math.min(w, h) * 0.355
    const fov = 2.4
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    ctx.clearRect(0, 0, w, h)
    // 浅色模式下改用普通合成 + 深色粒子，避免 lighter 在亮底色上过曝
    const light = theme.value === 'light'
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter'

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      const x1 = p.x * cosA + p.z * sinA
      const z1 = -p.x * sinA + p.z * cosA
      const y1 = p.y
      const y2 = y1 * cosT - z1 * sinT
      const z2 = y1 * sinT + z1 * cosT
      const scale = fov / (fov + z2)
      const depth = (z2 + 1) / 2
      const alpha = light ? 0.08 + depth * 0.5 : 0.06 + depth * 0.7
      const size = (0.5 + depth * 1.2) * scale
      const hue = 168 + (y2 + 1) * 9
      const sat = light ? 72 : 92
      const lum = light ? 30 + depth * 12 : 58 + depth * 12
      ctx.fillStyle = `hsla(${hue.toFixed(0)}, ${sat}%, ${lum.toFixed(1)}%, ${alpha.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(cx + x1 * R * scale, cy + y2 * R * scale, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  rafGlobe = requestAnimationFrame(draw)
}

/* ====================== 滚动进度 / 章节高亮 / 入场动画 ====================== */

function animateCount(el: HTMLElement) {
  const target = Number(el.dataset.count || 0)
  if (!Number.isFinite(target)) return
  if (reduceMotion) {
    el.textContent = String(target)
    return
  }
  const start = performance.now()
  const duration = 1200
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function initObservers() {
  revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        el.classList.add('in')
        el.querySelectorAll<HTMLElement>('[data-count]').forEach(animateCount)
        revealObs?.unobserve(el)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  rootEl.value?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => revealObs?.observe(el))

  navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeId.value = (entry.target as HTMLElement).id
      })
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  ;['home', ...navs.map((n) => n.id)].forEach((id) => {
    const el = document.getElementById(id)
    if (el) navObs?.observe(el)
  })

  // 产品区离开视口时暂停 3D 环旋转，节省绘制开销
  const productsEl = document.getElementById('products')
  if (productsEl) {
    productsObs = new IntersectionObserver(
      (entries) => {
        productsVisible.value = !!entries[0]?.isIntersecting
      },
      { threshold: 0.05 },
    )
    productsObs.observe(productsEl)
  }
}

/* ====================== 光标光晕 ====================== */

function initCursorGlow() {
  if (!window.matchMedia('(pointer: fine)').matches) return
  let tx = 0
  let ty = 0
  let gx = 0
  let gy = 0

  const tick = () => {
    gx += (tx - gx) * 0.12
    gy += (ty - gy) * 0.12
    if (glowEl.value) {
      glowEl.value.style.transform = `translate3d(${(gx - 220).toFixed(1)}px, ${(gy - 220).toFixed(1)}px, 0)`
    }
    if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) {
      rafGlow = requestAnimationFrame(tick)
    } else {
      rafGlow = 0
    }
  }

  onPointer = (e: PointerEvent) => {
    tx = e.clientX
    ty = e.clientY
    if (!rafGlow) rafGlow = requestAnimationFrame(tick)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
}

onMounted(() => {
  document.title = '企业官网 - 怡川塑业'

  onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.value = max > 0 ? Math.min(window.scrollY / max, 1) : 0
    scrolled.value = window.scrollY > 24
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  initGlobe()
  initObservers()
  initCursorGlow()

  if (viewMode.value === 'space') {
    applyRing()
    startRing()
  }
})

onBeforeUnmount(() => {
  if (rafGlobe) cancelAnimationFrame(rafGlobe)
  if (rafGlow) cancelAnimationFrame(rafGlow)
  stopRing()
  productsObs?.disconnect()
  if (onScroll) window.removeEventListener('scroll', onScroll)
  if (onPointer) window.removeEventListener('pointermove', onPointer)
  if (onGlobeResize) window.removeEventListener('resize', onGlobeResize)
  revealObs?.disconnect()
  navObs?.disconnect()
})
</script>

<style scoped lang="less">
/* ====================== 基础 ====================== */
.site {
  --cyan: #22d3ee;
  --mint: #5eead4;
  --emerald: #34d399;
  --ink: #e8f4ff;
  --muted: rgba(196, 220, 246, 0.62);
  --line: rgba(110, 220, 255, 0.14);
  --bg: #04070f;
  position: relative;
  min-height: 100vh;
  color: var(--ink);
  background: var(--bg);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, -apple-system, sans-serif;
  overflow-x: clip;
  transition: background 0.4s ease, color 0.4s ease;
}

.site-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 20% -10%, rgba(14, 116, 144, 0.2), transparent 60%),
    radial-gradient(ellipse 70% 55% at 88% 8%, rgba(16, 185, 129, 0.14), transparent 62%),
    #04070f;

  .aurora {
    position: absolute;
    border-radius: 50%;
    opacity: 0.55;
    animation: aurora-drift 26s ease-in-out infinite alternate;
  }

  .aurora-a {
    top: -18vw;
    left: -10vw;
    width: 62vw;
    height: 62vw;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.18), transparent 64%);
  }

  .aurora-b {
    top: 12vw;
    right: -16vw;
    width: 58vw;
    height: 58vw;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.16), transparent 64%);
    animation-duration: 34s;
    animation-delay: -8s;
  }

  .aurora-c {
    bottom: -22vw;
    left: 24vw;
    width: 64vw;
    height: 64vw;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 66%);
    animation-duration: 30s;
    animation-delay: -14s;
  }

  .grid-plane {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(110, 220, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110, 220, 255, 0.05) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(ellipse 78% 62% at 50% 22%, #000 0%, transparent 78%);
    -webkit-mask-image: radial-gradient(ellipse 78% 62% at 50% 22%, #000 0%, transparent 78%);
  }

  /* 斜向扫光：低透明度、快速掠过，不遮挡文字 */
  .beam {
    position: absolute;
    top: -40%;
    left: 0;
    width: 26vw;
    height: 180%;
    background: linear-gradient(90deg, transparent, rgba(94, 234, 212, 0.07), rgba(34, 211, 238, 0.05), transparent);
    transform: rotate(18deg);
    animation: beam-sweep 11s linear infinite;
  }
}

@keyframes aurora-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(4vw, 3vw, 0) scale(1.08);
  }
}

@keyframes beam-sweep {
  from {
    transform: translateX(-40vw) rotate(18deg);
  }
  to {
    transform: translateX(160vw) rotate(18deg);
  }
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  width: 100%;
  height: 2px;
  background: rgba(56, 189, 248, 0.08);

  span {
    display: block;
    width: 100%;
    height: 100%;
    transform-origin: left center;
    background: linear-gradient(90deg, var(--cyan), var(--emerald), #a3e635);
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.7);
  }
}

.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 440px;
  height: 440px;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.1), rgba(34, 211, 238, 0.05) 42%, transparent 68%);
}

/* ====================== 顶部导航 ====================== */
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  padding-top: 2px;
  background: rgba(4, 8, 16, 0.4);
  border-bottom: 1px solid transparent;
  transition: background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease;

  &.scrolled {
    background: rgba(5, 10, 20, 0.82);
    border-bottom-color: var(--line);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    backdrop-filter: blur(16px) saturate(140%);
  }
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 14px 28px;
}

.brand {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #d1fae5;
  background: linear-gradient(140deg, rgba(52, 211, 153, 0.22), rgba(34, 211, 238, 0.16));
  border: 1px solid rgba(94, 234, 212, 0.35);
  border-radius: 13px;
  box-shadow: 0 0 22px rgba(52, 211, 153, 0.28), inset 0 0 14px rgba(94, 234, 212, 0.12);

  svg {
    width: 24px;
    height: 24px;
  }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1.15;

  strong {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  em {
    font-size: 9px;
    font-style: normal;
    letter-spacing: 2.4px;
    color: rgba(148, 233, 214, 0.62);
  }
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;

  a {
    position: relative;
    padding: 8px 14px;
    font-size: 13px;
    color: var(--muted);
    text-decoration: none;
    border-radius: 999px;
    transition: color 0.25s ease, background 0.25s ease;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 4px;
      width: 0;
      height: 1px;
      background: linear-gradient(90deg, var(--cyan), var(--emerald));
      transform: translateX(-50%);
      transition: width 0.25s ease;
    }

    &:hover {
      color: #fff;
      background: rgba(94, 234, 212, 0.07);
    }

    &.active {
      color: #c7f9ea;

      &::after {
        width: 16px;
      }
    }
  }
}

.portal-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  font-size: 13px;
  color: #bff3e4;
  text-decoration: none;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.28);
  border-radius: 999px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgba(52, 211, 153, 0.18);
    box-shadow: 0 0 22px rgba(52, 211, 153, 0.35);
    transform: translateY(-1px);
  }
}

/* 深浅模式切换按钮：默认透明无边框，悬停显示主题色反馈 */
.theme-toggle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 16px;
  color: #bff3e4;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 50%;
  transition: color 0.3s ease, background 0.3s ease, transform 0.5s ease, box-shadow 0.3s ease;

  &:hover {
    color: #fff;
    background: rgba(94, 234, 212, 0.14);
    box-shadow: 0 0 16px rgba(52, 211, 153, 0.3);
    transform: rotate(40deg);
  }

  &:active {
    transform: rotate(40deg) scale(0.92);
  }

  svg {
    width: 17px;
    height: 17px;
  }
}

/* ====================== 首屏 ====================== */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-height: calc(100vh - 70px);
  padding: 48px 0 80px;
}

.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(340px, 0.98fr);
  gap: 32px;
  align-items: center;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 28px;
}

.hero-copy {
  position: relative;
  z-index: 2;

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 7px 15px;
    font-size: 11px;
    letter-spacing: 2px;
    color: #9df0dd;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(94, 234, 212, 0.24);
    border-radius: 999px;
  }

  .eyebrow-dot {
    width: 6px;
    height: 6px;
    background: var(--emerald);
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
    animation: pulse-dot 2.4s ease-out infinite;
  }

  h1 {
    margin: 24px 0 0;
    font-size: clamp(36px, 4.9vw, 64px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.5px;

    .line {
      display: block;
    }

    .grad {
      background: linear-gradient(100deg, #a7f3d0 0%, #34d399 34%, #22d3ee 68%, #7dd3fc 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 26px rgba(52, 211, 153, 0.25));
    }
  }

  .lead {
    max-width: 560px;
    margin: 22px 0 0;
    font-size: 15px;
    line-height: 1.85;
    color: var(--muted);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 30px;
  }

  .hero-points {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 22px;
    margin: 28px 0 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      color: rgba(214, 235, 255, 0.72);

      :deep(.anticon) {
        font-size: 13px;
        color: var(--emerald);
      }
    }
  }
}

@keyframes pulse-dot {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55);
  }
  70% {
    box-shadow: 0 0 0 9px rgba(52, 211, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
  }
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 13px 26px;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 999px;
  transition: transform 0.25s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 60%;
    height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.28), transparent);
    transform: skewX(-18deg);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);

    &::before {
      left: 130%;
    }
  }

  &.primary {
    color: #04231b;
    background: linear-gradient(100deg, #5eead4, #34d399 52%, #22d3ee);
    box-shadow: 0 12px 30px -12px rgba(52, 211, 153, 0.8), 0 0 22px rgba(34, 211, 238, 0.28);

    &:hover {
      box-shadow: 0 16px 38px -12px rgba(52, 211, 153, 0.95), 0 0 32px rgba(34, 211, 238, 0.4);
    }
  }

  &.ghost {
    color: #c7f9ea;
    background: rgba(9, 24, 36, 0.6);
    border: 1px solid rgba(94, 234, 212, 0.24);

    &:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(94, 234, 212, 0.55);
      box-shadow: 0 0 24px rgba(52, 211, 153, 0.22);
    }
  }
}

.hero-visual {
  position: relative;
  justify-self: center;
  width: min(540px, 100%);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
}

.globe-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  transform-style: preserve-3d;
}

.globe-glow {
  position: absolute;
  inset: 12%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.2), rgba(34, 211, 238, 0.1) 46%, transparent 70%);
  border-radius: 50%;
  animation: glow-breathe 6s ease-in-out infinite alternate;
}

@keyframes glow-breathe {
  from {
    opacity: 0.65;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1.06);
  }
}

.globe-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* HUD 装饰：四角括号 + 坐标标签，纯线条不遮挡内容 */
.hud {
  position: absolute;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(94, 234, 212, 0.35);
  pointer-events: none;

  &.hud-tl {
    top: 4%;
    left: 2%;
    border-right: 0;
    border-bottom: 0;
  }

  &.hud-br {
    right: 2%;
    bottom: 4%;
    border-top: 0;
    border-left: 0;
  }
}

.hud-label {
  position: absolute;
  font-size: 8px;
  letter-spacing: 2.4px;
  color: rgba(125, 211, 196, 0.5);
  pointer-events: none;

  &.hud-label-a {
    top: 3%;
    left: 13%;
  }

  &.hud-label-b {
    right: 11%;
    bottom: 3%;
  }
}

.orbit {
  --tilt-x: 72deg;
  --start-z: 0deg;
  position: absolute;
  inset: 6%;
  border: 1px solid rgba(94, 234, 212, 0.16);
  border-radius: 50%;
  transform: rotateX(var(--tilt-x)) rotateZ(var(--start-z));
  animation: orbit-spin 20s linear infinite;
  pointer-events: none;

  i {
    position: absolute;
    top: -3px;
    left: 50%;
    width: 6px;
    height: 6px;
    background: var(--mint);
    border-radius: 50%;
    box-shadow: 0 0 14px var(--mint);
  }

  &.orbit-b {
    --tilt-x: 64deg;
    --start-z: 24deg;
    inset: 14%;
    border-style: dashed;
    border-color: rgba(34, 211, 238, 0.18);
    animation-duration: 28s;
    animation-direction: reverse;

    i {
      width: 4px;
      height: 4px;
      background: var(--cyan);
      box-shadow: 0 0 12px var(--cyan);
    }
  }

  &.orbit-c {
    --tilt-x: 78deg;
    --start-z: -16deg;
    inset: 22%;
    border-color: rgba(163, 230, 53, 0.14);
    animation-duration: 16s;

    i {
      width: 5px;
      height: 5px;
      background: #a3e635;
      box-shadow: 0 0 12px #a3e635;
    }
  }

  &.orbit-d {
    --tilt-x: 58deg;
    --start-z: 44deg;
    inset: 0;
    border-color: rgba(34, 211, 238, 0.12);
    animation-duration: 12s;

    i {
      width: 4px;
      height: 4px;
      background: #7dd3fc;
      box-shadow: 0 0 14px #7dd3fc;
    }
  }
}

@keyframes orbit-spin {
  from {
    transform: rotateX(var(--tilt-x)) rotateZ(var(--start-z));
  }
  to {
    transform: rotateX(var(--tilt-x)) rotateZ(calc(var(--start-z) + 360deg));
  }
}

.chip {
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  font-size: 12px;
  color: #dff8ef;
  background: rgba(6, 20, 32, 0.78);
  border: 1px solid rgba(94, 234, 212, 0.24);
  border-radius: 12px;
  box-shadow: 0 14px 34px -18px rgba(0, 0, 0, 0.9), 0 0 20px rgba(52, 211, 153, 0.12);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transform: translateZ(46px);
  animation: chip-float 7s ease-in-out infinite;

  .chip-dot {
    position: absolute;
    top: 12px;
    left: -3px;
    width: 6px;
    height: 6px;
    background: var(--emerald);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--emerald);
  }

  small {
    margin-top: 3px;
    font-size: 9px;
    letter-spacing: 1.8px;
    color: rgba(125, 211, 196, 0.6);
  }

  &.chip-a {
    top: 8%;
    left: -2%;
  }

  &.chip-b {
    right: -3%;
    bottom: 24%;
    animation-delay: -2.4s;
  }

  &.chip-c {
    bottom: 4%;
    left: 8%;
    animation-delay: -4.6s;
  }
}

@keyframes chip-float {
  0%,
  100% {
    transform: translateZ(46px) translateY(0);
  }
  50% {
    transform: translateZ(46px) translateY(-10px);
  }
}

.scroll-hint {
  position: absolute;
  bottom: 22px;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 4px;
  color: rgba(160, 210, 230, 0.5);
  transform: translateX(-50%);

  i {
    width: 1px;
    height: 34px;
    background: linear-gradient(to bottom, rgba(94, 234, 212, 0.7), transparent);
    animation: scroll-line 2.2s ease-in-out infinite;
  }
}

@keyframes scroll-line {
  0% {
    opacity: 0;
    transform: scaleY(0.2);
    transform-origin: top;
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
  100% {
    opacity: 0;
    transform: scaleY(0.2);
    transform-origin: bottom;
  }
}

/* ====================== 跑马灯 ====================== */
.ticker {
  position: relative;
  z-index: 2;
  overflow: hidden;
  padding: 13px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: rgba(6, 14, 24, 0.6);
}

.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker-move 34s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 26px;
  padding-right: 26px;
  font-size: 11px;
  letter-spacing: 3px;
  white-space: nowrap;
  color: rgba(160, 235, 220, 0.55);

  i {
    width: 4px;
    height: 4px;
    background: var(--emerald);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--emerald);
  }
}

@keyframes ticker-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* ====================== 数据条 ====================== */
.stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 1240px;
  margin: 0 auto;
  padding: 54px 28px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
  border-right: 1px solid rgba(110, 220, 255, 0.1);

  &:last-child {
    border-right: 0;
  }

  strong {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-size: clamp(30px, 3.4vw, 44px);
    font-weight: 800;
    line-height: 1;
    color: #eafff9;
    text-shadow: 0 0 26px rgba(52, 211, 153, 0.35);

    em {
      font-size: 16px;
      font-style: normal;
      color: var(--emerald);
    }
  }

  .stat-label {
    font-size: 12px;
    letter-spacing: 1px;
    color: var(--muted);
  }
}

/* ====================== 通用章节 ====================== */
.section {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 96px 28px;

  &.alt::before {
    content: '';
    position: absolute;
    inset: 40px -40px;
    z-index: -1;
    background: linear-gradient(180deg, rgba(9, 22, 36, 0.5), rgba(6, 14, 26, 0.16));
    border-top: 1px solid rgba(110, 220, 255, 0.08);
    border-bottom: 1px solid rgba(110, 220, 255, 0.08);
    border-radius: 28px;
  }
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 660px;
  margin-bottom: 46px;

  h2 {
    margin: 0;
    font-size: clamp(26px, 3vw, 38px);
    font-weight: 700;
    letter-spacing: 0.5px;
    background: linear-gradient(100deg, #eaf7ff 0%, #ffffff 34%, #8ff2da 50%, #eaf7ff 66%, #ffffff 100%);
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: title-sheen 9s linear infinite;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: var(--muted);
  }
}

.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  letter-spacing: 2.6px;
  color: rgba(154, 240, 220, 0.72);

  b {
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 600;
    color: #04231b;
    background: linear-gradient(120deg, var(--mint), var(--emerald));
    border-radius: 4px;
    letter-spacing: 0;
  }
}

.grad {
  background: linear-gradient(100deg, #a7f3d0, #34d399 46%, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ====================== 产品 ====================== */
@keyframes title-sheen {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -100% 0;
  }
}

/* ====================== 产品展示形态切换 ====================== */
.view-switch {
  position: relative;
  display: inline-flex;
  gap: 2px;
  margin-bottom: 34px;
  padding: 4px;
  background: rgba(7, 20, 32, 0.7);
  border: 1px solid var(--line);
  border-radius: 999px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  .switch-glider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc((100% - 8px) / 3);
    height: calc(100% - 8px);
    background: linear-gradient(120deg, rgba(94, 234, 212, 0.2), rgba(34, 211, 238, 0.14));
    border: 1px solid rgba(94, 234, 212, 0.32);
    border-radius: 999px;
    box-shadow: 0 0 18px rgba(52, 211, 153, 0.18);
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .switch-btn {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex: 1 1 0;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 100px;
    padding: 8px 16px;
    font-family: inherit;
    font-size: 12px;
    letter-spacing: 1px;
    white-space: nowrap;
    color: rgba(190, 222, 240, 0.6);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 999px;
    transition: color 0.3s ease;

    &:hover {
      color: #d9fff4;
    }

    &.active {
      color: #eafff8;
    }
  }
}

/* 3D 立体空间 */
.stage-3d {
  position: relative;
  height: 472px;
  margin-top: 6px;
  overflow: hidden;
  perspective: 1500px;
  perspective-origin: 50% 44%;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.stage-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 620px;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(52, 211, 153, 0.18), rgba(34, 211, 238, 0.08) 42%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -44%);
  animation: stage-glow-breathe 6s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes stage-glow-breathe {
  from {
    opacity: 0.7;
    transform: translate(-50%, -44%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -44%) scale(1.06);
  }
}

.stage-floor {
  position: absolute;
  bottom: 22px;
  left: 50%;
  width: 680px;
  height: 190px;
  background: radial-gradient(ellipse at center, rgba(52, 211, 153, 0.24), rgba(34, 211, 238, 0.1) 42%, transparent 72%);
  border-radius: 50%;
  filter: blur(8px);
  transform: translateX(-50%) rotateX(74deg);
  pointer-events: none;
}

.stage-ring {
  position: absolute;
  bottom: 62px;
  left: 50%;
  width: 640px;
  height: 640px;
  border: 1px dashed rgba(94, 234, 212, 0.22);
  border-radius: 50%;
  transform: translate(-50%, 50%) rotateX(78deg);
  animation: stage-ring-spin 26s linear infinite;
  pointer-events: none;
}

@keyframes stage-ring-spin {
  from {
    transform: translate(-50%, 50%) rotateX(78deg) rotate(0deg);
  }
  to {
    transform: translate(-50%, 50%) rotateX(78deg) rotate(360deg);
  }
}

.ring-3d {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  will-change: transform;
}

.p3d-card {
  position: absolute;
  top: 46%;
  left: 50%;
  display: flex;
  flex-direction: column;
  width: 232px;
  height: 316px;
  margin: -158px 0 0 -116px;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(15, 33, 48, 0.96), rgba(6, 14, 25, 0.98));
  border: 1px solid rgba(94, 234, 212, 0.26);
  border-radius: 18px;
  box-shadow:
    0 34px 60px -34px rgba(0, 0, 0, 0.95),
    0 0 34px rgba(52, 211, 153, 0.12);
  transform-style: preserve-3d;
  backface-visibility: hidden;

  .p3d-thumb {
    position: relative;
    flex-shrink: 0;
    height: 214px;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 46%, rgba(6, 14, 25, 0.94));
    }
  }

  .p3d-tag {
    position: absolute;
    z-index: 1;
    top: 12px;
    left: 12px;
    padding: 3px 9px;
    font-size: 9px;
    letter-spacing: 1px;
    color: #b8f5e4;
    background: rgba(6, 24, 34, 0.8);
    border: 1px solid rgba(94, 234, 212, 0.3);
    border-radius: 999px;
  }

  .p3d-meta {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    margin-top: -18px;
    padding: 0 16px 16px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }

    p {
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      font-size: 11px;
      line-height: 1.6;
      color: var(--muted);
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

.stage-hint {
  position: absolute;
  bottom: 6px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 2.4px;
  color: rgba(160, 220, 235, 0.42);
  transform: translateX(-50%);

  span {
    width: 18px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94, 234, 212, 0.7));
    animation: hint-slide 2.4s ease-in-out infinite;
  }
}

@keyframes hint-slide {
  0%,
  100% {
    opacity: 0.3;
    transform: translateX(-3px);
  }
  50% {
    opacity: 1;
    transform: translateX(3px);
  }
}

/* 横向轮播 */
.carousel {
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  padding-bottom: 12px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
}

.carousel-track {
  display: flex;
  gap: 20px;
}

.carousel-card {
  flex: 0 0 clamp(236px, 30%, 330px);
  overflow: hidden;
  scroll-snap-align: start;
  background: linear-gradient(165deg, rgba(14, 30, 46, 0.92), rgba(7, 15, 27, 0.96));
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 18px;
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;

  &:hover {
    border-color: rgba(94, 234, 212, 0.4);
    transform: translateY(-6px);
    box-shadow: 0 26px 50px -30px rgba(34, 211, 238, 0.55);

    .carousel-shine {
      opacity: 1;
    }
  }

  .carousel-thumb {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 54%, rgba(5, 12, 22, 0.88));
    }
  }

  &:hover .carousel-thumb img {
    transform: scale(1.06);
  }

  .carousel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: -30px;
    padding: 0 18px 18px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.7;
      color: var(--muted);
    }
  }
}

.carousel-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: radial-gradient(circle at 30% 20%, rgba(94, 234, 212, 0.18), transparent 58%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.carousel-nav {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.car-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  font-size: 14px;
  color: #bff3e4;
  cursor: pointer;
  background: rgba(9, 24, 36, 0.75);
  border: 1px solid rgba(94, 234, 212, 0.26);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgba(52, 211, 153, 0.16);
    border-color: rgba(94, 234, 212, 0.6);
    box-shadow: 0 0 22px rgba(52, 211, 153, 0.35);
    transform: translateY(-2px);
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 22px;
}

.product-card {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 50%;
  --lift: 0px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(14, 30, 46, 0.92), rgba(7, 15, 27, 0.95));
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 18px;
  transform: perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(var(--lift));
  transform-style: preserve-3d;
  transition: transform 0.25s ease-out, border-color 0.35s ease, box-shadow 0.35s ease;

  &:hover {
    --lift: -6px;
    border-color: rgba(94, 234, 212, 0.4);
    box-shadow: 0 26px 50px -30px rgba(34, 211, 238, 0.55), 0 0 0 1px rgba(94, 234, 212, 0.18) inset;

    .thumb-glow {
      opacity: 1;
    }

    .product-more {
      color: #a7f3d0;
      transform: translateX(3px);
    }
  }
}

.product-thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  background: radial-gradient(circle at 50% 40%, rgba(34, 211, 238, 0.12), rgba(6, 14, 26, 0.9) 72%);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 52%, rgba(5, 12, 22, 0.86));
  }

  .thumb-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: radial-gradient(circle at var(--mx) var(--my), rgba(94, 234, 212, 0.22), transparent 55%);
    transition: opacity 0.35s ease;
    pointer-events: none;
  }
}

.product-card:hover .product-thumb img {
  transform: scale(1.06);
}

.product-tag {
  position: absolute;
  top: 13px;
  left: 13px;
  z-index: 2;
  padding: 4px 10px;
  font-size: 10px;
  letter-spacing: 1px;
  color: #b8f5e4;
  background: rgba(6, 24, 34, 0.78);
  border: 1px solid rgba(94, 234, 212, 0.3);
  border-radius: 999px;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.product-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  margin-top: -34px;
  padding: 0 20px 20px;
  transform: translateZ(30px);

  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  p {
    flex: 1;
    margin: 0;
    font-size: 12.5px;
    line-height: 1.75;
    color: var(--muted);
  }

  .product-more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 11px;
    letter-spacing: 1px;
    color: rgba(125, 211, 196, 0.7);
    transition: color 0.3s ease, transform 0.3s ease;
  }
}

.card-shine {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(circle at var(--mx) var(--my), rgba(255, 255, 255, 0.09), transparent 42%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.product-card:hover .card-shine {
  opacity: 1;
}

/* ====================== 绿色循环 ====================== */
.eco {
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(320px, 0.94fr);
  gap: 64px;
  align-items: center;

  .eco-copy {
    h2 {
      margin: 14px 0 0;
      font-size: clamp(26px, 3.2vw, 40px);
      font-weight: 700;
      line-height: 1.25;
    }
  }

  .eco-lead {
    max-width: 520px;
    margin: 18px 0 0;
    font-size: 14px;
    line-height: 1.85;
    color: var(--muted);
  }
}

.eco-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: 15px;
    padding: 16px 18px;
    background: linear-gradient(120deg, rgba(12, 30, 44, 0.7), rgba(7, 16, 28, 0.4));
    border: 1px solid rgba(94, 234, 212, 0.12);
    border-radius: 14px;
    transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      border-color: rgba(94, 234, 212, 0.32);
      transform: translateX(4px);
      box-shadow: 0 16px 34px -26px rgba(34, 211, 238, 0.6);
    }

    h4 {
      margin: 0 0 5px;
      font-size: 14px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.7;
      color: var(--muted);
    }
  }

  .eco-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 18px;
    color: var(--mint);
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(94, 234, 212, 0.22);
    border-radius: 11px;
  }
}

.eco-visual {
  display: flex;
  justify-content: center;
}

.eco-orbit {
  position: relative;
  width: min(430px, 88vw);
  aspect-ratio: 1;
  transform-style: preserve-3d;
  animation: eco-tilt 14s ease-in-out infinite alternate;
}

@keyframes eco-tilt {
  from {
    transform: rotateX(8deg) rotateY(-6deg);
  }
  to {
    transform: rotateX(-4deg) rotateY(8deg);
  }
}

.eco-ring {
  position: absolute;
  border: 1px dashed rgba(94, 234, 212, 0.26);
  border-radius: 50%;
  animation: ring-spin 26s linear infinite;

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 7px;
    height: 7px;
    background: var(--emerald);
    border-radius: 50%;
    box-shadow: 0 0 14px var(--emerald);
  }

  &.ring-1 {
    inset: 7%;
  }

  &.ring-2 {
    inset: 20%;
    border-color: rgba(34, 211, 238, 0.24);
    animation-duration: 18s;
    animation-direction: reverse;

    &::after {
      background: var(--cyan);
      box-shadow: 0 0 14px var(--cyan);
    }
  }

  &.ring-3 {
    inset: 32%;
    border-color: rgba(163, 230, 53, 0.2);
    animation-duration: 12s;

    &::after {
      width: 5px;
      height: 5px;
      background: #a3e635;
      box-shadow: 0 0 12px #a3e635;
    }
  }
}

@keyframes ring-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.eco-core {
  position: absolute;
  inset: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #d9ffee;
  background: radial-gradient(circle at 34% 28%, #5eead4, #0f766e 58%, #042f2e 100%);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(52, 211, 153, 0.45), inset 0 0 26px rgba(255, 255, 255, 0.22), inset 0 -12px 26px rgba(0, 0, 0, 0.4);

  svg {
    width: 34%;
    height: 34%;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
  }

  em {
    margin-top: 5px;
    font-size: 7px;
    font-style: normal;
    letter-spacing: 1.6px;
    opacity: 0.8;
  }
}

.eco-node {
  position: absolute;
  padding: 6px 13px;
  font-size: 11px;
  letter-spacing: 1px;
  color: #c8f7ea;
  background: rgba(7, 22, 34, 0.85);
  border: 1px solid rgba(94, 234, 212, 0.26);
  border-radius: 999px;
  box-shadow: 0 0 18px rgba(52, 211, 153, 0.16);
  transform: translate(-50%, -50%);

  &.node-1 {
    top: 9%;
    left: 50%;
  }

  &.node-2 {
    top: 62%;
    left: 8%;
  }

  &.node-3 {
    top: 78%;
    left: 76%;
  }
}

/* ====================== 核心优势 ====================== */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
  gap: 20px;
}

.feature-card {
  position: relative;
  padding: 28px 24px 26px;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(13, 28, 42, 0.82), rgba(6, 14, 26, 0.62));
  border: 1px solid rgba(94, 234, 212, 0.12);
  border-radius: 16px;
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 70%;
    height: 130%;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.14), transparent 62%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    border-color: rgba(94, 234, 212, 0.32);
    transform: translateY(-5px);
    box-shadow: 0 24px 46px -32px rgba(34, 211, 238, 0.7);

    &::before {
      opacity: 1;
    }

    .feature-icon {
      transform: rotate(-8deg) scale(1.06);
      color: #d1fae5;
    }
  }

  h3 {
    position: relative;
    margin: 18px 0 10px;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    position: relative;
    margin: 0;
    font-size: 12.5px;
    line-height: 1.8;
    color: var(--muted);
  }
}

.feature-index {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: rgba(94, 234, 212, 0.1);
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 19px;
  color: var(--mint);
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.22);
  border-radius: 12px;
  transition: transform 0.4s ease, color 0.4s ease;
}

/* ====================== 关于我们 ====================== */
.about {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 56px;
  align-items: center;
}

.about-media {
  position: relative;
  padding: 12px;
  transform-style: preserve-3d;

  .media-frame {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(94, 234, 212, 0.28);
    border-radius: 20px;
    transform: translate3d(12px, 12px, 0);
    pointer-events: none;
  }

  img {
    display: block;
    width: 100%;
    border-radius: 16px;
    filter: saturate(1.06) contrast(1.04);
    box-shadow: 0 30px 60px -34px rgba(0, 0, 0, 0.9);
  }

  .media-badge {
    position: absolute;
    right: 24px;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 18px;
    background: rgba(5, 18, 30, 0.82);
    border: 1px solid rgba(94, 234, 212, 0.3);
    border-radius: 12px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);

    strong {
      font-size: 12px;
      letter-spacing: 2px;
      color: var(--mint);
    }

    span {
      font-size: 11px;
      color: var(--muted);
    }
  }
}

.about-copy {
  h2 {
    margin: 14px 0 0;
    font-size: clamp(26px, 3vw, 36px);
    font-weight: 700;
  }

  p {
    margin: 16px 0 0;
    font-size: 13.5px;
    line-height: 1.9;
    color: var(--muted);
  }
}

.about-points {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    color: rgba(214, 235, 255, 0.76);

    :deep(.anticon) {
      color: var(--emerald);
    }
  }
}

/* ====================== 案例 ====================== */
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.case-card {
  position: relative;
  padding: 26px 24px 24px;
  overflow: hidden;
  background: linear-gradient(150deg, rgba(11, 26, 40, 0.86), rgba(6, 14, 26, 0.66));
  border: 1px solid rgba(94, 234, 212, 0.12);
  border-radius: 16px;
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;

  &::after {
    content: '';
    position: absolute;
    inset: auto -30% -60% -30%;
    height: 120px;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.18), transparent 66%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    border-color: rgba(94, 234, 212, 0.34);
    transform: translateY(-5px);
    box-shadow: 0 24px 46px -32px rgba(34, 211, 238, 0.6);

    &::after {
      opacity: 1;
    }

    .case-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  h3 {
    margin: 16px 0 8px;
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.75;
    color: var(--muted);
  }
}

.case-index {
  position: absolute;
  top: 20px;
  right: 22px;
  font-size: 30px;
  font-weight: 800;
  color: rgba(94, 234, 212, 0.1);
}

.case-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 17px;
  color: var(--mint);
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(94, 234, 212, 0.2);
  border-radius: 11px;
}

.case-arrow {
  position: absolute;
  right: 24px;
  bottom: 22px;
  font-size: 13px;
  color: var(--mint);
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

/* ====================== 新闻 ====================== */
.news-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(110, 220, 255, 0.12);
}

.news-row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) 26px;
  gap: 24px;
  align-items: center;
  padding: 24px 12px;
  border-bottom: 1px solid rgba(110, 220, 255, 0.1);
  transition: background 0.35s ease, padding 0.35s ease;

  &:hover {
    padding-left: 20px;
    background: linear-gradient(90deg, rgba(52, 211, 153, 0.08), transparent 72%);

    .news-arrow {
      color: var(--mint);
      opacity: 1;
      transform: translateX(0);
    }

    h3 {
      color: #d6fff2;
    }
  }

  h3 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    transition: color 0.3s ease;
  }

  p {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.75;
    color: var(--muted);
  }
}

.news-date {
  font-size: 11px;
  letter-spacing: 1.4px;
  color: rgba(125, 211, 196, 0.66);
}

.news-arrow {
  font-size: 13px;
  color: rgba(148, 233, 214, 0.4);
  opacity: 0.4;
  transform: translateX(-6px);
  transition: all 0.35s ease;
}

/* ====================== CTA ====================== */
.cta {
  position: relative;
  z-index: 1;
  max-width: 1184px;
  margin: 40px auto 90px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(34, 211, 238, 0.08) 52%, rgba(7, 16, 28, 0.9));
  border: 1px solid rgba(94, 234, 212, 0.24);
  border-radius: 26px;

  .cta-glow {
    position: absolute;
    top: -40%;
    left: 50%;
    width: 620px;
    height: 620px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.24), transparent 62%);
    transform: translateX(-50%);
    animation: glow-breathe 7s ease-in-out infinite alternate;
    pointer-events: none;
  }
}

.cta-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 28px;
  text-align: center;

  h2 {
    margin: 16px 0 0;
    font-size: clamp(26px, 3.2vw, 40px);
    font-weight: 700;
    line-height: 1.28;
  }

  p {
    margin: 16px 0 0;
    font-size: 13px;
    letter-spacing: 2px;
    color: var(--muted);
  }

  .cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: center;
    margin-top: 30px;
  }

  .cta-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 30px;
    justify-content: center;
    margin-top: 34px;
    font-size: 12px;
    color: rgba(180, 214, 236, 0.6);

    span {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
  }
}

/* ====================== 页脚 ====================== */
.site-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(110, 220, 255, 0.1);
  background: rgba(4, 9, 17, 0.8);
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 40px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 56px 28px 40px;
}

.footer-brand {
  p {
    margin: 16px 0 0;
    font-size: 12px;
    letter-spacing: 1px;
    color: var(--muted);
  }
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;

  h4 {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #c7f9ea;
  }

  span,
  a {
    font-size: 12px;
    color: rgba(180, 214, 236, 0.55);
    text-decoration: none;
    transition: color 0.25s ease;
  }

  a:hover {
    color: var(--mint);
  }
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: var(--mint) !important;
}

.footer-bottom {
  padding: 16px 28px 24px;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: rgba(160, 195, 220, 0.38);
  text-align: center;
  border-top: 1px solid rgba(110, 220, 255, 0.07);
}

/* ====================== 入场动画 ====================== */
[data-reveal] {
  opacity: 0;
  filter: blur(10px);
  transform: translateY(30px) scale(0.98);
  transition:
    opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--d, 0ms);

  &.in {
    opacity: 1;
    filter: none;
    transform: none;
  }
}

/* ====================== 响应式 ====================== */
@media (max-width: 1080px) {
  .nav {
    display: none;
  }

  .hero {
    min-height: auto;
    padding-top: 56px;
  }

  .hero-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .hero-visual {
    width: min(460px, 92vw);
  }

  .eco {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .about {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 720px) {
  .section {
    padding: 68px 20px;

    &.alt::before {
      inset: 24px 0;
      border-radius: 20px;
    }
  }

  .header-inner {
    padding: 12px 20px;
  }

  .brand-text em {
    display: none;
  }

  .hero-inner {
    padding: 0 20px;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 26px 0;
    padding: 42px 20px;
  }

  .stat:nth-child(2) {
    border-right: 0;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .view-switch {
    width: 100%;
    margin-bottom: 26px;

    .switch-btn {
      min-width: 0;
      padding: 8px 8px;
      font-size: 11px;
      letter-spacing: 0;
    }
  }

  .stage-3d {
    height: 396px;
  }

  .p3d-card {
    width: 194px;
    height: 276px;
    margin: -138px 0 0 -97px;

    .p3d-thumb {
      height: 176px;
    }

    .p3d-meta {
      padding: 0 13px 13px;

      h3 {
        font-size: 14px;
      }

      p {
        -webkit-line-clamp: 2;
      }
    }
  }

  .stage-floor {
    width: 460px;
    height: 140px;
  }

  .stage-ring {
    width: 460px;
    height: 460px;
    bottom: 66px;
  }

  .footer-inner {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    padding: 44px 20px 30px;
  }

  .news-row {
    grid-template-columns: 1fr 24px;
    gap: 12px;

    .news-date {
      display: none;
    }
  }

  .cta {
    margin: 20px 16px 64px;
  }

  .cta-inner {
    padding: 46px 22px;
  }

  .chip {
    font-size: 11px;
    padding: 8px 12px;
  }

  .chip-a {
    left: 0;
  }

  .chip-b {
    right: 0;
  }

  .scroll-hint {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero-points {
    flex-direction: column;
    gap: 8px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
  }
}

/* 减弱动效偏好：关闭动画与视差 */
@media (prefers-reduced-motion: reduce) {
  .site *,
  .site *::before,
  .site *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }

  [data-reveal] {
    opacity: 1;
    transform: none;
  }

  .cursor-glow {
    display: none;
  }
}

/* ====================== 浅色模式覆盖层 ====================== */
.site.light {
  --cyan: #0891b2;
  --mint: #0d9488;
  --emerald: #059669;
  --ink: #0f2437;
  --muted: rgba(35, 64, 92, 0.66);
  --line: rgba(8, 80, 110, 0.16);
  --bg: #eef5f7;
  color-scheme: light;

  /* ---- 背景层 ---- */
  .site-bg {
    background:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(8, 145, 178, 0.12), transparent 60%),
      radial-gradient(ellipse 70% 55% at 88% 8%, rgba(5, 150, 105, 0.1), transparent 62%),
      var(--bg);

    .aurora {
      opacity: 0.4;
    }

    .grid-plane {
      background-image:
        linear-gradient(rgba(8, 80, 110, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(8, 80, 110, 0.06) 1px, transparent 1px);
    }

    .beam {
      background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.06), rgba(8, 145, 178, 0.05), transparent);
    }
  }

  .scroll-progress {
    background: rgba(8, 80, 110, 0.1);
  }

  .cursor-glow {
    background: radial-gradient(circle, rgba(5, 150, 105, 0.08), rgba(8, 145, 178, 0.04) 42%, transparent 68%);
  }

  /* ---- 顶部导航 ---- */
  .site-header {
    background: rgba(255, 255, 255, 0.45);

    &.scrolled {
      background: rgba(255, 255, 255, 0.85);
    }
  }

  .brand-mark {
    color: #0f766e;
    background: linear-gradient(140deg, rgba(5, 150, 105, 0.16), rgba(8, 145, 178, 0.12));
    border-color: rgba(13, 148, 136, 0.35);
    box-shadow: 0 0 22px rgba(5, 150, 105, 0.18), inset 0 0 14px rgba(13, 148, 136, 0.1);
  }

  .brand-text em {
    color: rgba(13, 110, 100, 0.65);
  }

  .nav a {
    &:hover {
      color: var(--ink);
    }

    &.active {
      color: #0f766e;
      background: rgba(13, 148, 136, 0.1);
    }
  }

  .portal-link {
    color: #0f766e;
    background: rgba(5, 150, 105, 0.08);
    border-color: rgba(13, 148, 136, 0.3);

    &:hover {
      color: #0b3b34;
      background: rgba(5, 150, 105, 0.15);
      box-shadow: 0 0 22px rgba(5, 150, 105, 0.22);
    }
  }

  .theme-toggle {
    color: #0f766e;

    &:hover {
      color: #0b3b34;
      background: rgba(13, 148, 136, 0.12);
      box-shadow: 0 0 16px rgba(5, 150, 105, 0.22);
    }
  }

  /* ---- 首屏 ---- */
  .eyebrow {
    color: #0f766e;
    background: rgba(5, 150, 105, 0.08);
    border-color: rgba(13, 148, 136, 0.28);
  }

  .grad {
    background: linear-gradient(100deg, #0f766e, #059669 46%, #0891b2);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-points li {
    color: rgba(35, 64, 92, 0.78);
  }

  .btn.ghost {
    color: #0f766e;
    background: rgba(255, 255, 255, 0.65);
    border-color: rgba(13, 148, 136, 0.32);

    &:hover {
      background: rgba(5, 150, 105, 0.1);
      border-color: rgba(13, 148, 136, 0.5);
    }
  }

  .hud {
    border-color: rgba(13, 148, 136, 0.4);
  }

  .hud-label {
    color: rgba(13, 110, 100, 0.55);
  }

  .orbit {
    border-color: rgba(13, 148, 136, 0.2);

    &.orbit-b {
      border-color: rgba(8, 145, 178, 0.2);
    }

    &.orbit-c {
      border-color: rgba(101, 163, 13, 0.18);
    }

    &.orbit-d {
      border-color: rgba(8, 145, 178, 0.14);
    }
  }

  .chip {
    color: #134e4a;
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(13, 148, 136, 0.3);
    box-shadow: 0 14px 34px -18px rgba(15, 60, 70, 0.25), 0 0 20px rgba(5, 150, 105, 0.1);

    small {
      color: rgba(13, 110, 100, 0.6);
    }
  }

  .scroll-hint {
    color: rgba(35, 64, 92, 0.5);
  }

  /* ---- 滚动条带 / 统计 ---- */
  .ticker {
    background: rgba(255, 255, 255, 0.55);
  }

  .ticker-item {
    color: rgba(13, 90, 85, 0.6);
  }

  .stat {
    border-right-color: rgba(8, 80, 110, 0.12);

    strong {
      color: var(--ink);
      text-shadow: 0 0 26px rgba(5, 150, 105, 0.25);
    }
  }

  /* ---- 章节 ---- */
  .section.alt::before {
    background: linear-gradient(180deg, rgba(214, 233, 239, 0.6), rgba(214, 233, 239, 0.2));
    border-top-color: rgba(8, 80, 110, 0.1);
    border-bottom-color: rgba(8, 80, 110, 0.1);
  }

  .section-head h2 {
    background: linear-gradient(100deg, #0f2437 0%, #1d4060 34%, #0d9488 50%, #0f2437 66%, #1d4060 100%);
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-tag {
    color: rgba(13, 110, 100, 0.75);
  }

  /* ---- 展示形态切换 ---- */
  .view-switch {
    background: rgba(255, 255, 255, 0.7);
  }

  .switch-glider {
    background: linear-gradient(120deg, rgba(13, 148, 136, 0.18), rgba(8, 145, 178, 0.12));
    border-color: rgba(13, 148, 136, 0.32);
  }

  .switch-btn {
    color: rgba(35, 64, 92, 0.6);

    &:hover {
      color: #0f766e;
    }

    &.active {
      color: #0b3b34;
    }
  }

  /* ---- 3D 立体空间 ---- */
  .p3d-card {
    background: linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(238, 246, 249, 0.98));
    border-color: rgba(13, 148, 136, 0.3);
    box-shadow:
      0 34px 60px -34px rgba(15, 60, 70, 0.28),
      0 0 34px rgba(5, 150, 105, 0.1);
  }

  .p3d-thumb::after {
    background: linear-gradient(180deg, transparent 46%, rgba(238, 246, 249, 0.95));
  }

  .p3d-tag {
    color: #0f766e;
    background: rgba(255, 255, 255, 0.88);
    border-color: rgba(13, 148, 136, 0.32);
  }

  .stage-hint {
    color: rgba(35, 64, 92, 0.45);
  }

  /* ---- 轮播 ---- */
  .carousel-card {
    background: linear-gradient(165deg, rgba(255, 255, 255, 0.95), rgba(238, 246, 249, 0.98));
    border-color: rgba(13, 148, 136, 0.18);

    &:hover {
      border-color: rgba(13, 148, 136, 0.42);
      box-shadow: 0 26px 50px -30px rgba(8, 145, 178, 0.35);
    }
  }

  .carousel-thumb::after {
    background: linear-gradient(180deg, transparent 54%, rgba(238, 246, 249, 0.88));
  }

  .car-nav-btn {
    color: #0f766e;
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(13, 148, 136, 0.3);

    &:hover {
      color: #0b3b34;
      background: rgba(5, 150, 105, 0.14);
      border-color: rgba(13, 148, 136, 0.5);
    }
  }

  /* ---- 平面网格 ---- */
  .product-card {
    background: linear-gradient(165deg, rgba(255, 255, 255, 0.95), rgba(238, 246, 249, 0.98));
    border-color: rgba(13, 148, 136, 0.16);

    &:hover {
      border-color: rgba(13, 148, 136, 0.42);
      box-shadow: 0 26px 50px -30px rgba(8, 145, 178, 0.35);
    }
  }

  .product-thumb {
    background: radial-gradient(circle at 50% 40%, rgba(8, 145, 178, 0.1), rgba(226, 240, 244, 0.9) 72%);

    &::after {
      background: linear-gradient(180deg, transparent 52%, rgba(238, 246, 249, 0.88));
    }
  }

  .product-tag {
    color: #0f766e;
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(13, 148, 136, 0.3);
  }

  .product-more {
    color: rgba(13, 110, 100, 0.75);
  }

  /* ---- 绿色循环 ---- */
  .eco-list li {
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.8), rgba(238, 246, 249, 0.5));
    border-color: rgba(13, 148, 136, 0.16);

    &:hover {
      border-color: rgba(13, 148, 136, 0.36);
      box-shadow: 0 16px 34px -26px rgba(8, 145, 178, 0.35);
    }
  }

  .eco-icon {
    background: rgba(5, 150, 105, 0.1);
    border-color: rgba(13, 148, 136, 0.25);
  }

  .eco-orbit {
    border-color: rgba(13, 148, 136, 0.3);
  }

  .eco-node {
    color: #0f766e;
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(13, 148, 136, 0.3);
  }

  /* ---- 核心优势 ---- */
  .feature-card {
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.85), rgba(238, 246, 249, 0.65));
    border-color: rgba(13, 148, 136, 0.16);

    &:hover {
      border-color: rgba(13, 148, 136, 0.38);
      box-shadow: 0 24px 46px -32px rgba(8, 145, 178, 0.35);

      .feature-icon {
        color: #0b3b34;
      }
    }
  }

  .feature-index {
    color: rgba(13, 148, 136, 0.14);
  }

  .feature-icon {
    background: rgba(5, 150, 105, 0.1);
    border-color: rgba(13, 148, 136, 0.24);
  }

  /* ---- 关于我们 ---- */
  .media-frame {
    border-color: rgba(13, 148, 136, 0.3);
    box-shadow: 0 30px 60px -34px rgba(15, 60, 70, 0.3);
  }

  .media-badge {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(13, 148, 136, 0.32);
  }

  .about-points li {
    color: rgba(35, 64, 92, 0.78);
  }

  /* ---- 案例展示 ---- */
  .case-card {
    background: linear-gradient(150deg, rgba(255, 255, 255, 0.88), rgba(238, 246, 249, 0.68));
    border-color: rgba(13, 148, 136, 0.16);

    &:hover {
      border-color: rgba(13, 148, 136, 0.38);
      box-shadow: 0 24px 46px -32px rgba(8, 145, 178, 0.35);
    }
  }

  .case-index {
    color: rgba(13, 148, 136, 0.14);
  }

  .case-icon {
    background: rgba(5, 150, 105, 0.1);
    border-color: rgba(13, 148, 136, 0.24);
  }

  /* ---- 新闻资讯 ---- */
  .news-row {
    border-bottom-color: rgba(8, 80, 110, 0.12);

    &:hover {
      background: linear-gradient(90deg, rgba(5, 150, 105, 0.07), transparent 72%);

      h3 {
        color: #0f766e;
      }
    }
  }

  .news-date {
    color: rgba(13, 110, 100, 0.6);
  }

  .news-arrow {
    color: rgba(13, 110, 100, 0.45);
  }

  /* ---- 联系我们 ---- */
  .cta {
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(8, 145, 178, 0.07) 52%, rgba(255, 255, 255, 0.92));
    border-color: rgba(13, 148, 136, 0.28);
  }

  .cta-inner p {
    color: rgba(35, 64, 92, 0.7);
  }

  .cta-meta {
    color: rgba(35, 64, 92, 0.6);
  }

  /* ---- 页脚 ---- */
  .site-footer {
    background: rgba(255, 255, 255, 0.7);
    border-top-color: rgba(8, 80, 110, 0.12);
  }

  .footer-col {
    h4 {
      color: #0f766e;
    }

    span,
    a {
      color: rgba(35, 64, 92, 0.6);
    }

    a:hover {
      color: var(--mint);
    }
  }

  .footer-bottom {
    color: rgba(35, 64, 92, 0.45);
    border-top-color: rgba(8, 80, 110, 0.1);
  }
}
</style>
