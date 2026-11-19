<template>
  <div class="material-detail-page">
    <a-card :bordered="false" class="table-card">
      <div class="page-head">
        <div class="page-intro">
          <div class="intro-title">物料明细</div>
          <div class="intro-desc">
            展示兑换券、折扣券、积分物料被哪些活动引用，以及各活动的引用库存数量
          </div>
        </div>
        <a-space :size="12" wrap>
          <a-select
            v-model:value="kindFilter"
            :options="kindOptions"
            class="kind-select"
            @change="loadList"
          />
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索物料名称"
            allow-clear
            class="keyword-input"
            @search="loadList"
          />
        </a-space>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        row-key="key"
        size="middle"
        :scroll="{ x: 1190 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <span class="row-index">{{ index + 1 }}</span>
          </template>
          <template v-else-if="column.key === 'kind'">
            <a-tag :color="kindColor(record.kind)">{{ kindLabel(record.kind) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="material-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'total'">
            <span>{{ record.total === null ? '不限' : `${record.total.toLocaleString()} ${record.unit}` }}</span>
          </template>
          <template v-else-if="column.key === 'claimed'">
            <span>{{ record.claimed === null ? '—' : `${record.claimed.toLocaleString()} ${record.unit}` }}</span>
          </template>
          <template v-else-if="column.key === 'remaining'">
            <span>{{ record.remaining === null ? '—' : `${record.remaining.toLocaleString()} ${record.unit}` }}</span>
          </template>
          <template v-else-if="column.key === 'referenceCount'">
            <a-tag v-if="record.references.length" color="purple">{{ record.references.length }} 个活动</a-tag>
            <span v-else class="text-sub">未引用</span>
          </template>
          <template v-else-if="column.key === 'referenceTotal'">
            <span :class="record.referenceTotal ? 'ref-total' : 'text-sub'">
              {{ record.referenceTotal.toLocaleString() }} {{ record.unit }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a :class="{ disabled: !record.references.length }" @click="openReferences(record)">
              引用明细
            </a>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:open="drawerOpen" title="物料引用明细" width="560px">
      <div v-if="currentMaterial" class="ref-head">
        <div class="ref-material">
          <a-tag :color="kindColor(currentMaterial.kind)">{{ kindLabel(currentMaterial.kind) }}</a-tag>
          <span class="ref-name">{{ currentMaterial.name }}</span>
        </div>
        <div class="ref-stats">
          <div class="ref-stat">
            <span class="ref-stat-label">引用活动</span>
            <span class="ref-stat-value">{{ currentMaterial.references.length }} 个</span>
          </div>
          <div class="ref-stat">
            <span class="ref-stat-label">引用库存合计</span>
            <span class="ref-stat-value is-highlight">
              {{ currentMaterial.referenceTotal.toLocaleString() }} {{ currentMaterial.unit }}
            </span>
          </div>
        </div>
      </div>

      <a-table
        v-if="currentMaterial"
        :columns="refColumns"
        :data-source="currentMaterial.references"
        :pagination="refPagination"
        row-key="campaignId"
        size="small"
        :locale="{ emptyText: '暂无活动引用该物料' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="STATUS_MAP[record.status].color">{{ STATUS_MAP[record.status].label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'quantity'">
            {{ record.quantity.toLocaleString() }} {{ currentMaterial?.unit }}
          </template>
        </template>
      </a-table>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  fetchMaterialDetails,
  type CampaignStatus,
  type MaterialDetail,
} from '@/api/marketing'

const STATUS_MAP: Record<CampaignStatus, { label: string; color: string }> = {
  running: { label: '进行中', color: 'green' },
  pending: { label: '待开始', color: 'blue' },
  ended: { label: '已结束', color: 'default' },
}

const kindFilter = ref<string>('')
const keyword = ref('')
const loading = ref(false)
const list = ref<MaterialDetail[]>([])

const kindOptions = [
  { label: '全部类别', value: '' },
  { label: '兑换券', value: 'exchange' },
  { label: '折扣券', value: 'discount' },
  { label: '积分', value: 'points' },
]

const columns = [
  { title: '序号', key: 'index', width: 60 },
  { title: '物料类别', key: 'kind', width: 110 },
  { title: '物料名称', key: 'name', width: 260 },
  { title: '库存总量', key: 'total', width: 130 },
  { title: '已领取', key: 'claimed', width: 120 },
  { title: '剩余库存', key: 'remaining', width: 130 },
  { title: '被引用', key: 'referenceCount', width: 120 },
  { title: '引用库存合计', key: 'referenceTotal', width: 150 },
  { title: '操作', key: 'action', width: 110, fixed: 'right' as const },
]

const refColumns = [
  { title: '活动名称', dataIndex: 'campaignName', key: 'campaignName' },
  { title: '活动状态', key: 'status', width: 100 },
  { title: '引用数量', key: 'quantity', width: 120, align: 'right' as const },
]

/** 引用明细分页配置（固定对象，避免视图更新时重置用户选择） */
const refPagination = {
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
}

function kindLabel(kind: MaterialDetail['kind']): string {
  if (kind === 'exchange') return '兑换券'
  if (kind === 'discount') return '折扣券'
  return '积分'
}

function kindColor(kind: MaterialDetail['kind']): string {
  if (kind === 'exchange') return 'green'
  if (kind === 'discount') return 'orange'
  return 'blue'
}

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchMaterialDetails({
      kind: kindFilter.value as MaterialDetail['kind'] | '',
      keyword: keyword.value,
    })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

/* ---------- 引用明细抽屉 ---------- */
const drawerOpen = ref(false)
const currentMaterial = ref<MaterialDetail>()

function openReferences(record: MaterialDetail) {
  if (!record.references.length) {
    message.info('该物料暂无活动引用')
    return
  }
  currentMaterial.value = record
  drawerOpen.value = true
}

onMounted(loadList)
</script>

<style scoped lang="less">
.material-detail-page {
  .table-card {
    border-radius: 12px;
  }

  .page-head {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 4px 2px 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.14);
  }

  .page-intro {
    flex: 1;
    min-width: 240px;

    .intro-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .intro-desc {
      margin-top: 4px;
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .kind-select {
    width: 140px;
  }

  .keyword-input {
    width: 220px;
  }

  .row-index {
    font-size: 12px;
    color: var(--text-sub);
  }

  .material-name {
    font-weight: 500;
    color: var(--text-main);
  }

  .ref-total {
    font-weight: 600;
    color: #9254de;
  }

  .text-sub {
    font-size: 12px;
    color: var(--text-sub);
  }

  .disabled {
    color: var(--text-sub);
    cursor: default;
    opacity: 0.5;
  }
}
</style>

<!-- 抽屉内容被 teleport 到 body，scoped 选择器无法命中，改用独立的全局样式 -->
<style lang="less">
.ref-head {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.14);
}

.ref-material {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;

  .ref-name {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text-main);
  }
}

.ref-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ref-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(146, 84, 222, 0.06);
  border: 1px solid rgba(146, 84, 222, 0.16);
  border-radius: 10px;
}

.ref-stat-label {
  font-size: 12px;
  color: var(--text-sub);
}

.ref-stat-value {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-main);

  &.is-highlight {
    color: #9254de;
  }
}
</style>
