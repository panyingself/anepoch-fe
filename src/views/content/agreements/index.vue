<template>
  <div class="agreement-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索协议名称"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select v-model:value="statusFilter" :options="statusOptions" class="filter-select" @change="loadList" />
        <a-button @click="resetQuery">重置</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        row-key="id"
        size="middle"
        :scroll="{ x: 960 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="agreement-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="AGREEMENT_STATUS[record.status].color">
              {{ AGREEMENT_STATUS[record.status].label }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openView(record)">查看</a>
              <a-popconfirm
                v-if="record.status === 'active'"
                title="确定下线该协议吗？下线后对应端将不再展示。"
                ok-text="确定下线"
                cancel-text="取消"
                @confirm="onToggle(record, 'offline')"
              >
                <a class="danger-link">下线</a>
              </a-popconfirm>
              <a-popconfirm
                v-else-if="record.status !== 'active'"
                title="确定上线该协议吗？上线后对应端将展示该版本。"
                ok-text="确定上线"
                cancel-text="取消"
                @confirm="onToggle(record, 'active')"
              >
                <a>上线</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:open="viewOpen" title="协议详情" width="560px">
      <div v-if="currentAgreement" class="agreement-detail">
        <div class="detail-title">
          {{ currentAgreement.name }}
          <a-tag :color="AGREEMENT_STATUS[currentAgreement.status].color">
            {{ AGREEMENT_STATUS[currentAgreement.status].label }}
          </a-tag>
        </div>
        <a-descriptions :column="1" size="small" bordered>
          <a-descriptions-item label="版本">{{ currentAgreement.version }}</a-descriptions-item>
          <a-descriptions-item label="适用平台">{{ currentAgreement.platform }}</a-descriptions-item>
          <a-descriptions-item label="更新人">{{ currentAgreement.updatedBy }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentAgreement.updatedAt }}</a-descriptions-item>
        </a-descriptions>
        <div class="detail-content">{{ currentAgreement.content }}</div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  AGREEMENT_STATUS,
  fetchAgreements,
  toggleAgreement,
  type AgreementItem,
  type AgreementStatus,
} from '@/api/content'

const loading = ref(false)
const list = ref<AgreementItem[]>([])
const keyword = ref('')
const statusFilter = ref<AgreementStatus | ''>('')

const columns = [
  { title: '协议名称', key: 'name', width: 240 },
  { title: '版本', dataIndex: 'version', key: 'version', width: 100 },
  { title: '适用平台', dataIndex: 'platform', key: 'platform', width: 140 },
  { title: '状态', key: 'status', width: 110 },
  { title: '更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 130 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' as const },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '生效中', value: 'active' },
  { label: '草稿', value: 'draft' },
  { label: '已下线', value: 'offline' },
]

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchAgreements({ keyword: keyword.value, status: statusFilter.value })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  keyword.value = ''
  statusFilter.value = ''
  loadList()
}

async function onToggle(record: AgreementItem, status: AgreementStatus) {
  try {
    await toggleAgreement(record.id, status)
    record.status = status
    message.success(status === 'active' ? '协议已上线' : '协议已下线')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

const viewOpen = ref(false)
const currentAgreement = ref<AgreementItem>()

function openView(record: AgreementItem) {
  currentAgreement.value = record
  viewOpen.value = true
}

onMounted(loadList)
</script>

<style scoped lang="less">
.agreement-page {
  .table-card {
    border-radius: 12px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;

    .filter-input {
      width: 240px;
    }

    .filter-select {
      width: 140px;
    }
  }

  .agreement-name {
    font-weight: 500;
    color: var(--text-main);
  }

  .danger-link {
    color: #ff7875;
  }
}
</style>

<style lang="less">
/* 详情抽屉挂载到 body，使用全局样式 */
.agreement-detail {
  .detail-title {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
  }

  .detail-content {
    padding: 16px;
    margin-top: 16px;
    font-size: 13px;
    line-height: 1.9;
    color: var(--text-sub);
    background: rgba(128, 128, 128, 0.04);
    border: 1px solid rgba(128, 128, 128, 0.14);
    border-radius: 10px;
  }
}
</style>
