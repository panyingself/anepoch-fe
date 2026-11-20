<template>
  <div class="dashboard-page">
    <!-- 欢迎横幅：浅绿渐变 + 装饰圆 + 日期区 -->
    <a-card class="welcome-card" :bordered="false">
      <div class="welcome-inner">
        <a-avatar :size="56" class="welcome-avatar">
          {{ (userStore.userInfo?.nickname || 'A').slice(0, 1) }}
        </a-avatar>
        <div class="welcome-text">
          <h2>{{ greeting }}，{{ userStore.userInfo?.nickname || '管理员' }}！</h2>
          <p>欢迎回来，祝您今天工作顺利。</p>
        </div>
        <div class="welcome-date">
          <span class="date-main">{{ todayText }}</span>
          <span class="date-week">{{ weekText }}</span>
        </div>
      </div>
    </a-card>

    <!-- 统计卡：多彩软色图标 + 趋势徽标 -->
    <a-row :gutter="16" class="stat-row">
      <a-col v-for="item in data?.stats || []" :key="item.title" :xs="24" :sm="12" :lg="6">
        <a-card :bordered="false" class="stat-card" :loading="loading">
          <div class="stat-body">
            <span
              class="stat-icon"
              :style="{ background: `${statMeta(item.title).hue}1c`, color: statMeta(item.title).hue }"
            >
              <component :is="statMeta(item.title).icon" />
            </span>
            <div class="stat-main">
              <span class="stat-title">{{ item.title }}</span>
              <a-statistic
                :value="item.value"
                :precision="item.precision"
                :prefix="item.prefix"
                class="stat-num"
              />
              <span class="stat-trend" :class="statTrend(item.title).dir">
                <ArrowUpOutlined v-if="statTrend(item.title).dir === 'up'" />
                <ArrowDownOutlined v-else />
                {{ statTrend(item.title).val }}
                <em>较上周</em>
              </span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="14">
        <a-card title="近 7 日访问量" :bordered="false" class="chart-card">
          <template #extra>
            <a-tag color="green" class="soft-tag">周合计 {{ formatNumber(weekTotal) }}</a-tag>
          </template>
          <div class="bar-chart">
            <div v-for="point in data?.weeklyVisits || []" :key="point.day" class="bar-item">
              <span class="bar-value">{{ formatNumber(point.value) }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: barHeight(point.value) }"
                  :title="`${point.day}：${point.value}`"
                />
              </div>
              <span class="bar-label">{{ point.day }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card title="订单状态分布" :bordered="false" class="chart-card">
          <template #extra>
            <a-tag color="green" class="soft-tag">共 {{ statusTotal }} 单</a-tag>
          </template>
          <div class="status-list">
            <div v-for="item in statusSummary" :key="item.name" class="status-item">
              <span class="status-name">
                <a-badge :color="item.color" :text="item.name" />
              </span>
              <a-progress
                :percent="item.percent"
                :stroke-color="item.color"
                :show-info="true"
                size="small"
              />
              <span class="status-count">{{ item.count }} 单</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="最新订单" :bordered="false" class="order-card">
      <template #extra>
        <a-button type="link" size="small" class="more-link">
          查看全部
          <RightOutlined />
        </a-button>
      </template>
      <a-table
        :columns="orderColumns"
        :data-source="data?.recentOrders || []"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'orderNo'">
            <a>{{ record.orderNo }}</a>
          </template>
          <template v-else-if="column.key === 'amount'">
            ¥{{ Number(record.amount).toFixed(2) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import type { Component } from 'vue'
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { fetchDashboard } from '@/api/admin/dashboard'
import type { DashboardData } from '@/api/admin/dashboard'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(true)
const data = ref<DashboardData | null>(null)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const todayText = dayjs().format('YYYY年M月D日')
const weekText = dayjs().format('dddd')

/** 统计卡多元配置：每张卡独立软色图标 */
const statMetaMap: Record<string, { icon: Component; hue: string }> = {
  总用户数: { icon: UserOutlined, hue: '#4dd0c4' },
  今日订单: { icon: ShoppingCartOutlined, hue: '#6fb6ff' },
  本月销售额: { icon: DollarOutlined, hue: '#f0c060' },
  今日访问量: { icon: EyeOutlined, hue: '#b89af0' },
}

function statMeta(title: string) {
  return statMetaMap[title] ?? { icon: UserOutlined, hue: '#4dd0c4' }
}

/** 趋势徽标（演示数据） */
const trendMap: Record<string, { dir: 'up' | 'down'; val: string }> = {
  总用户数: { dir: 'up', val: '+8.2%' },
  今日订单: { dir: 'up', val: '+3.4%' },
  本月销售额: { dir: 'up', val: '+12.5%' },
  今日访问量: { dir: 'down', val: '-1.8%' },
}

function statTrend(title: string) {
  return trendMap[title] ?? { dir: 'up', val: '+0.0%' }
}

const statusSummary = computed(() => {
  const orders = data.value?.recentOrders || []
  const colors: Record<string, string> = {
    已完成: '#6fe0a8',
    已支付: '#6fb6ff',
    待支付: '#f0c060',
  }
  const total = orders.length || 1
  const names = ['已完成', '已支付', '待支付']
  return names.map((name) => {
    const count = orders.filter((o) => o.status === name).length
    return {
      name,
      color: colors[name],
      count,
      percent: Math.round((count / total) * 100),
    }
  })
})

const statusTotal = computed(() => (data.value?.recentOrders || []).length)

const weekTotal = computed(() =>
  (data.value?.weeklyVisits || []).reduce((sum, p) => sum + p.value, 0),
)

const orderColumns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '客户', dataIndex: 'customer', key: 'customer', width: 100 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
]

const maxValue = computed(() => Math.max(...(data.value?.weeklyVisits || [{ value: 1 }]).map((p) => p.value)))

function barHeight(value: number) {
  const percent = Math.round((value / (maxValue.value || 1)) * 100)
  return `${Math.max(percent, 4)}%`
}

function formatNumber(value: number) {
  return value >= 10000 ? `${(value / 10000).toFixed(1)}w` : String(value)
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    已完成: 'success',
    已支付: 'processing',
    待支付: 'warning',
  }
  return map[status] || 'default'
}

onMounted(async () => {
  try {
    data.value = await fetchDashboard()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
.dashboard-page {
  /* ====== 欢迎横幅：浅绿渐变 + 装饰元素 ====== */
  .welcome-card {
    margin-bottom: 16px;
    overflow: hidden;

    :deep(.ant-card-body) {
      background:
        radial-gradient(circle at 88% 15%, rgba(77, 159, 255, 0.28), transparent 42%),
        radial-gradient(circle at 68% 130%, rgba(34, 211, 238, 0.22), transparent 46%),
        linear-gradient(115deg, rgba(44, 78, 158, 0.5) 0%, rgba(20, 38, 92, 0.55) 55%, rgba(14, 64, 84, 0.45) 100%);
      border: 1px solid rgba(110, 160, 255, 0.28);
      border-radius: 12px;
    }

    .welcome-inner {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 1;

      .welcome-avatar {
        font-size: 22px;
        color: #fff;
        background: var(--logo-icon);
        border: 3px solid rgba(255, 255, 255, 0.35);
        box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.35);
      }

      .welcome-text {
        flex: 1;

        h2 {
          margin: 0 0 4px;
          font-size: 18px;
          color: #e8f1ff;
        }

        p {
          margin: 0;
          color: rgba(190, 210, 255, 0.55);
        }
      }

      .welcome-date {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;

        .date-main {
          font-size: 14px;
          font-weight: 600;
          color: #bcd4ff;
        }

        .date-week {
          font-size: 12px;
          color: rgba(180, 200, 255, 0.5);
        }
      }
    }
  }

  /* ====== 统计卡：软色图标 + 趋势 ====== */
  .stat-row {
    margin-bottom: 16px;

    .stat-card {
      border-radius: 12px;
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px -10px rgba(77, 159, 255, 0.4);
      }

      .stat-body {
        display: flex;
        align-items: flex-start;
        gap: 14px;

        .stat-icon {
          display: flex;
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
            color: rgba(190, 210, 255, 0.55);
          }

          .stat-num {
            .ant-statistic-content {
              font-size: 22px;
              color: #e8f1ff;
            }
          }

          .stat-trend {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            margin-top: 6px;
            padding: 1px 8px;
            font-size: 12px;
            border-radius: 999px;

            em {
              font-style: normal;
              color: rgba(190, 210, 255, 0.4);
            }

            &.up {
              color: #6fe0a8;
              background: rgba(111, 224, 168, 0.14);
            }

            &.down {
              color: #ff9d9d;
              background: rgba(255, 120, 120, 0.14);
            }
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .order-card {
    border-radius: 12px;
  }
}

.soft-tag {
  color: #6fb6ff;
  background: rgba(77, 159, 255, 0.12);
  border-color: rgba(77, 159, 255, 0.3);
}

.more-link {
  color: #6fb6ff;
}

/* ====== 柱状图：网格底纹 + 渐变柱 ====== */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 240px;
  padding-top: 24px;

  .bar-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    height: 100%;

    .bar-value {
      margin-bottom: 8px;
      font-size: 12px;
      color: rgba(190, 210, 255, 0.55);
    }

    .bar-track {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      background-image: linear-gradient(rgba(120, 160, 255, 0.12) 1px, transparent 1px);
      background-size: 100% 25%;

      .bar-fill {
        width: 56%;
        border-radius: 6px 6px 3px 3px;
        background: linear-gradient(180deg, #56d4c8 0%, #2f8fa8 100%);
        box-shadow:
          inset 0 2px 0 rgba(255, 255, 255, 0.3),
          0 0 12px -2px rgba(86, 212, 200, 0.5);
        transition: height 0.6s ease;

        &:hover {
          background: linear-gradient(180deg, #7ce8dc 0%, #3fa8c0 100%);
        }
      }
    }

    .bar-label {
      margin-top: 8px;
      font-size: 12px;
      color: rgba(190, 210, 255, 0.55);
    }
  }
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;

  .status-item {
    .status-name {
      display: block;
      margin-bottom: 4px;
    }

    .status-count {
      display: block;
      font-size: 12px;
      color: rgba(190, 210, 255, 0.55);
      text-align: right;
    }
  }
}

</style>

<!-- 基础主题专属：干净清新，纯色/极浅背景，无可见阴影与底纹（不影响其他主题） -->
<style lang="less">
.theme-basic .dashboard-page {
  .welcome-card {
    .ant-card-body {
      background: var(--banner-bg);
      border: 1px solid var(--line);
    }

    .welcome-inner {
      .welcome-avatar {
        border-color: #fff;
        box-shadow: none;
      }

      .welcome-text h2 {
        color: var(--text-main);
      }

      .welcome-text p {
        color: var(--text-sub);
      }

      .welcome-date .date-main {
        color: var(--text-main);
      }

      .welcome-date .date-week {
        color: var(--text-sub);
      }
    }
  }

  .stat-row .stat-card:hover {
    box-shadow: none;
  }

  .stat-row .stat-card .stat-body .stat-main {
    .stat-title,
    .stat-trend em {
      color: var(--text-sub);
    }

    .stat-num .ant-statistic-content {
      color: var(--text-main);
    }
  }

  .bar-chart .bar-item {
    .bar-value,
    .bar-label {
      color: var(--text-sub);
    }

    .bar-track {
      background-image: none;
    }

    .bar-track .bar-fill {
      background: var(--bar-fill);
      box-shadow: none;

      &:hover {
        background: var(--bar-fill-hover);
      }
    }
  }

  .status-list .status-item .status-count {
    color: var(--text-sub);
  }

  .soft-tag {
    color: var(--icon-hover);
    background: var(--accent-bg);
    border-color: var(--accent-border);
  }

  .more-link {
    color: var(--icon-hover);
  }
}
</style>
