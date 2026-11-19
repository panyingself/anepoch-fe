<template>
  <div class="marketing-overview">
    <a-row :gutter="16" class="stat-row">
      <a-col v-for="item in overview?.stats || []" :key="item.title" :xs="24" :sm="12" :lg="6">
        <a-card :bordered="false" class="stat-card" :loading="loading">
          <div class="stat-body">
            <span
              class="stat-icon"
              :style="{ background: `${metaOf(item.title).hue}1c`, color: metaOf(item.title).hue }"
            >
              <component :is="metaOf(item.title).icon" />
            </span>
            <div class="stat-main">
              <span class="stat-title">{{ item.title }}</span>
              <a-statistic :value="item.value" :precision="hasDecimal(item.value) ? 1 : 0" :suffix="item.suffix" />
              <span class="stat-trend" :class="item.trend >= 0 ? 'up' : 'down'">
                <ArrowUpOutlined v-if="item.trend >= 0" />
                <ArrowDownOutlined v-else />
                {{ Math.abs(item.trend) }}%
                <em>较上周</em>
              </span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="14">
        <a-card title="近 7 日活动曝光（万次）" :bordered="false" class="chart-card">
          <template #extra>
            <a-tag color="purple" class="soft-tag">周合计 {{ weekTotal }} 万次</a-tag>
          </template>
          <div class="bar-chart">
            <div v-for="point in overview?.trend || []" :key="point.day" class="bar-item">
              <span class="bar-value">{{ point.value }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: barHeight(point.value) }" />
              </div>
              <span class="bar-label">{{ point.day }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card title="渠道效果" :bordered="false" class="chart-card">
          <div v-for="ch in overview?.channels || []" :key="ch.id" class="channel-row">
            <div class="channel-head">
              <span class="channel-name">{{ ch.name }}</span>
              <a-tag :color="ch.type === '站内' ? 'blue' : ch.type === '私域' ? 'purple' : ch.type === '短信' ? 'cyan' : 'orange'">
                {{ ch.type }}
              </a-tag>
            </div>
            <div class="channel-metrics">
              <span>曝光 <b>{{ ch.exposure }} 万</b></span>
              <span>转化 <b>{{ ch.conversion }}%</b></span>
              <span>ROI <b>{{ ch.roi }}</b></span>
            </div>
            <div class="channel-track">
              <div class="channel-fill" :style="{ width: `${Math.min(ch.roi * 18, 100)}%` }" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  GiftOutlined,
  RiseOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { fetchMarketingOverview, type MarketingOverview } from '@/api/marketing'

const loading = ref(true)
const overview = ref<MarketingOverview>()

const META: Record<string, { icon: Component; hue: string }> = {
  进行中活动: { icon: RocketOutlined, hue: '#9254de' },
  活动曝光量: { icon: ThunderboltOutlined, hue: '#1677ff' },
  '券核销率': { icon: GiftOutlined, hue: '#13c2c2' },
  '营销 ROI': { icon: RiseOutlined, hue: '#52c41a' },
}
const metaOf = (title: string) => META[title] ?? { icon: RiseOutlined, hue: '#1677ff' }
const hasDecimal = (v: number) => !Number.isInteger(v)

const weekTotal = computed(() => overview.value?.trend.reduce((sum, p) => sum + p.value, 0) ?? 0)
const maxTrend = computed(() => Math.max(...(overview.value?.trend.map((p) => p.value) ?? [1])))
const barHeight = (v: number) => `${Math.round((v / maxTrend.value) * 100)}%`

onMounted(async () => {
  try {
    overview.value = await fetchMarketingOverview()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
.marketing-overview {
  .stat-row {
    margin-bottom: 16px;
  }

  .stat-card {
    border-radius: 12px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px -10px rgba(146, 84, 222, 0.35);
    }
  }

  .stat-body {
    display: flex;
    gap: 14px;
    align-items: flex-start;

    .stat-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      font-size: 20px;
      border-radius: 12px;
    }

    .stat-main {
      flex: 1;
      min-width: 0;

      .stat-title {
        display: block;
        margin-bottom: 2px;
        font-size: 13px;
        color: var(--text-sub);
      }

      :deep(.ant-statistic-content) {
        font-size: 22px;
        color: var(--text-main);
      }

      .stat-trend {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        margin-top: 6px;
        padding: 1px 8px;
        font-size: 12px;
        border-radius: 999px;

        &.up {
          color: #52c41a;
          background: rgba(82, 196, 26, 0.12);
        }

        &.down {
          color: #ff7875;
          background: rgba(255, 120, 117, 0.12);
        }

        em {
          font-style: normal;
          color: var(--text-sub);
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .bar-chart {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    height: 240px;
    padding-top: 10px;

    .bar-item {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      height: 100%;

      .bar-value {
        font-size: 12px;
        color: var(--text-sub);
      }

      .bar-track {
        display: flex;
        flex: 1;
        align-items: flex-end;
        width: 100%;
        max-width: 46px;
        background: rgba(146, 84, 222, 0.08);
        border-radius: 8px;
      }

      .bar-fill {
        width: 100%;
        background: linear-gradient(180deg, #b37feb, #722ed1);
        border-radius: 8px;
        transition: height 0.4s ease;
      }

      .bar-label {
        font-size: 12px;
        color: var(--text-sub);
      }
    }
  }

  .channel-row {
    padding: 10px 0;
    border-bottom: 1px solid rgba(128, 128, 128, 0.12);

    &:last-child {
      border-bottom: 0;
    }

    .channel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .channel-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-main);
      }
    }

    .channel-metrics {
      display: flex;
      gap: 16px;
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-sub);

      b {
        font-weight: 600;
        color: var(--text-main);
      }
    }

    .channel-track {
      height: 4px;
      margin-top: 8px;
      overflow: hidden;
      background: rgba(146, 84, 222, 0.1);
      border-radius: 999px;

      .channel-fill {
        height: 100%;
        background: linear-gradient(90deg, #722ed1, #b37feb);
        border-radius: 999px;
      }
    }
  }
}
</style>
