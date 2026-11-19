<template>
  <div class="sms-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input v-model:value="phone" placeholder="手机号" class="filter-input" allow-clear />
        <a-select
          v-model:value="template"
          :options="templateOptions"
          placeholder="短信模板"
          class="filter-select"
          allow-clear
        />
        <a-input v-model:value="content" placeholder="短信内容" class="filter-input" allow-clear />
        <a-select v-model:value="statusFilter" :options="statusOptions" class="filter-select" />
        <a-button type="primary" @click="loadList">查询</a-button>
        <a-button @click="resetQuery">重置</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        row-key="id"
        size="middle"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'content'">
            <span class="sms-content">{{ record.content }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="SMS_STATUS[record.status].color">{{ SMS_STATUS[record.status].label }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  SMS_STATUS,
  fetchSmsRecords,
  fetchSmsTemplates,
  type SmsRecord,
  type SmsStatus,
} from '@/api/content'

const loading = ref(false)
const list = ref<SmsRecord[]>([])
const phone = ref('')
const template = ref<string>()
const content = ref('')
const statusFilter = ref<SmsStatus | ''>('')
const templateOptions = ref<{ label: string; value: string }[]>([])

const columns = [
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 150 },
  { title: '短信模板', dataIndex: 'template', key: 'template', width: 150 },
  { title: '短信内容', key: 'content', width: 360 },
  { title: '状态', key: 'status', width: 120 },
  { title: '发送时间', dataIndex: 'sentAt', key: 'sentAt', width: 170 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '发送成功', value: 'success' },
  { label: '发送失败', value: 'failed' },
  { label: '发送中', value: 'sending' },
]

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchSmsRecords({
      phone: phone.value,
      template: template.value,
      content: content.value,
      status: statusFilter.value,
    })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  phone.value = ''
  template.value = undefined
  content.value = ''
  statusFilter.value = ''
  loadList()
}

async function loadTemplateOptions() {
  const templates = await fetchSmsTemplates({ status: 1 })
  templateOptions.value = templates.map((t) => ({ label: t.name, value: t.name }))
}

onMounted(() => {
  loadList()
  loadTemplateOptions()
})
</script>

<style scoped lang="less">
.sms-page {
  .table-card {
    border-radius: 12px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;

    .filter-input {
      width: 260px;
    }

    .filter-select {
      width: 140px;
    }
  }

  .sms-content {
    color: var(--text-main);
  }
}
</style>
