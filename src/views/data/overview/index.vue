<template>
  <div class="data-overview-page">
    <!-- 统计卡：软色图标 + 趋势徽标（随主题变量联动） -->
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
                :suffix="item.suffix"
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
        <a-card title="近 7 日数据接入量（亿条）" :bordered="false" class="chart-card">
          <template #extra>
            <a-tag color="blue" class="soft-tag">周合计 {{ weekTotal }} 亿条</a-tag>
          </template>
          <div class="bar-chart">
            <div v-for="point in data?.trend || []" :key="point.day" class="bar-item">
              <span class="bar-value">{{ point.value.toFixed(1) }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ height: barHeight(point.value) }"
                  :title="`${point.day}：${point.value} 亿条`"
                />
              </div>
              <span class="bar-label">{{ point.day }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card title="数据源状态" :bordered="false" class="chart-card">
          <a-list :data-source="data?.sources || []" :loading="loading" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span class="source-name">{{ item.name }}</span>
                  </template>
                  <template #description>
                    <span class="source-type">{{ item.type }}</span>
                  </template>
                  <template #avatar>
                    <a-avatar
                      :size="36"
                      :style="{ backgroundColor: statusBg(item.status), fontSize: '15px' }"
                    >
                      <ApiOutlined v-if="item.status !== '异常'" />
                      <WarningOutlined v-else />
                    </a-avatar>
                  </template>
                </a-list-item-meta>
                <template #extra>
                  <a-tag :color="statusColor(item.status)">{{ item.status }}</a-tag>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="热门数据表 TOP 5（今日查询次数）" :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="data?.hotTables || []"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'rank'">
            <span :class="['rank', { 'rank-top': index < 3 }]">{{ index + 1 }}</span>
          </template>
          <template v-else-if="column.key === 'name'">
            <a-typography-text code>{{ record.name }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'queries'">
            {{ Number(record.queries).toLocaleString() }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import {
  ApiOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'
import { fetchDataOverview } from '@/api/data/overview'
import type { DataOverviewData } from '@/api/data/overview'

const loading = ref(true)
const data = ref<DataOverviewData | null>(null)

const columns = [
  { title: '排名', key: 'rank', width: 70 },
  { title: '表名', dataIndex: 'name', key: 'name' },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
  { title: '今日查询', dataIndex: 'queries', key: 'queries', width: 120 },
  { title: '最近更新', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
]

/** 统计卡多元配置：每张卡独立软色图标 */
const statMetaMap: Record<string, { icon: Component; hue: string }> = {
  数据表总数: { icon: DatabaseOutlined, hue: '#4dd0c4' },
  '今日 API 调用量': { icon: ApiOutlined, hue: '#6fb6ff' },
  累计存储量: { icon: CloudServerOutlined, hue: '#f0c060' },
  运行中任务: { icon: PlayCircleOutlined, hue: '#b89af0' },
}

function statMeta(title: string) {
  return statMetaMap[title] ?? { icon: DatabaseOutlined, hue: '#4dd0c4' }
}

/** 趋势徽标（演示数据） */
const trendMap: Record<string, { dir: 'up' | 'down'; val: string }> = {
  数据表总数: { dir: 'up', val: '+2.1%' },
  '今日 API 调用量': { dir: 'up', val: '+8.4%' },
  累计存储量: { dir: 'up', val: '+0.3%' },
  运行中任务: { dir: 'down', val: '-4.2%' },
}

function statTrend(title: string) {
  return trendMap[title] ?? { dir: 'up', val: '+0.0%' }
}

const weekTotal = computed(() =>
  (data.value?.trend || []).reduce((sum, p) => sum + p.value, 0).toFixed(1),
)

const maxValue = computed(() =>
  Math.max(...(data.value?.trend || [{ value: 1 }]).map((p) => p.value)),
)

function barHeight(value: number) {
  const percent = Math.round((value / (maxValue.value || 1)) * 100)
  return `${Math.max(percent, 4)}%`
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    正常: 'success',
    同步中: 'processing',
    异常: 'error',
  }
  return map[status] || 'default'
}

function statusBg(status: string) {
  const map: Record<string, string> = {
    正常: '#52c41a',
    同步中: '#1677ff',
    异常: '#ff4d4f',
  }
  return map[status] || '#1677ff'
}

onMounted(async () => {
  try {
    data.value = await fetchDataOverview()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
.data-overview-page {
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
            color: var(--text-sub);
          }

          .stat-num {
            .ant-statistic-content {
              font-size: 22px;
              color: var(--text-main);
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
              color: var(--text-sub);
              opacity: 0.7;
            }

            &.up {
              color: var(--up-text);
              background: var(--up-bg);
            }

            &.down {
              color: var(--down-text);
              background: var(--down-bg);
            }
          }
        }
      }
    }
  }

  .chart-card,
  .table-card {
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .source-name {
    font-size: 14px;
    color: var(--text-main);
  }

  .source-type {
    font-size: 12px;
    color: var(--text-sub);
  }

  .rank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    color: var(--text-sub);
    background: var(--hover-bg);
    border-radius: 6px;

    &.rank-top {
      color: #fff;
      background: var(--logo-icon);
    }
  }
}

.soft-tag {
  color: var(--icon-hover);
  background: var(--hover-bg);
  border-color: var(--accent-border);
}

/* ====== 柱状图：主题网格底纹 + 主题渐变柱 ====== */
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
      color: var(--text-sub);
    }

    .bar-track {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      background-image: linear-gradient(var(--grid-line) 1px, transparent 1px);
      background-size: 100% 25%;

      .bar-fill {
        width: 56%;
        border-radius: 6px 6px 3px 3px;
        background: var(--bar-fill);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.25);
        transition: height 0.6s ease;

        &:hover {
          background: var(--bar-fill-hover);
        }
      }
    }

    .bar-label {
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-sub);
    }
  }
}
</style>
