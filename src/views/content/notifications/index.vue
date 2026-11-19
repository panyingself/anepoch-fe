<template>
  <div class="notice-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索通知标题"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select v-model:value="statusFilter" :options="statusOptions" class="filter-select" @change="loadList" />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建通知
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        row-key="id"
        size="middle"
        :scroll="{ x: 1120 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <span class="notice-title">{{ record.title }}</span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="typeColor(record.type)">{{ typeLabel(record.type) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="NOTICE_STATUS[record.status].color">{{ NOTICE_STATUS[record.status].label }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openView(record)">查看</a>
              <a-popconfirm
                title="确定删除该通知吗？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="onDelete(record.id)"
              >
                <a class="danger-link">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      title="新建通知消息"
      width="600px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="通知标题" name="title">
          <a-input v-model:value="form.title" placeholder="请输入通知标题" />
        </a-form-item>
        <a-form-item label="通知类型" name="type">
          <a-select v-model:value="form.type" :options="NOTICE_TYPES" />
        </a-form-item>
        <a-form-item label="发送渠道" name="channel">
          <a-radio-group v-model:value="form.channel">
            <a-radio v-for="c in NOTICE_CHANNELS" :key="c" :value="c">{{ c }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="目标用户" name="target">
          <a-input v-model:value="form.target" placeholder="如 全部用户 / 全部会员" />
        </a-form-item>
        <a-form-item label="通知内容" name="content">
          <a-textarea v-model:value="form.content" :rows="4" placeholder="请输入通知内容" />
        </a-form-item>
        <a-form-item label="发送方式" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio value="sent">立即发送</a-radio>
            <a-radio value="scheduled">定时发送</a-radio>
            <a-radio value="draft">保存草稿</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:open="viewOpen" title="通知详情" width="520px">
      <div v-if="currentNotice" class="notice-detail">
        <div class="detail-title">{{ currentNotice.title }}</div>
        <a-descriptions :column="1" size="small" bordered>
          <a-descriptions-item label="类型">{{ typeLabel(currentNotice.type) }}</a-descriptions-item>
          <a-descriptions-item label="渠道">{{ currentNotice.channel }}</a-descriptions-item>
          <a-descriptions-item label="目标用户">{{ currentNotice.target }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ NOTICE_STATUS[currentNotice.status].label }}</a-descriptions-item>
          <a-descriptions-item label="发送人">{{ currentNotice.sender }}</a-descriptions-item>
          <a-descriptions-item label="发送时间">{{ currentNotice.sentAt }}</a-descriptions-item>
        </a-descriptions>
        <div class="detail-content">{{ currentNotice.content }}</div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  NOTICE_CHANNELS,
  NOTICE_STATUS,
  NOTICE_TYPES,
  createNotice,
  deleteNotice,
  fetchNotices,
  type NoticeItem,
  type NoticeStatus,
  type NoticeType,
} from '@/api/content'

const loading = ref(false)
const list = ref<NoticeItem[]>([])
const keyword = ref('')
const statusFilter = ref<NoticeStatus | ''>('')

const columns = [
  { title: '通知标题', key: 'title', width: 300 },
  { title: '类型', key: 'type', width: 110 },
  { title: '渠道', dataIndex: 'channel', key: 'channel', width: 100 },
  { title: '目标用户', dataIndex: 'target', key: 'target', width: 140 },
  { title: '状态', key: 'status', width: 110 },
  { title: '发送时间', dataIndex: 'sentAt', key: 'sentAt', width: 160 },
  { title: '发送人', dataIndex: 'sender', key: 'sender', width: 120 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '已发送', value: 'sent' },
  { label: '定时发送', value: 'scheduled' },
  { label: '草稿', value: 'draft' },
]

function typeLabel(type: NoticeType): string {
  return NOTICE_TYPES.find((t) => t.value === type)?.label ?? type
}

function typeColor(type: NoticeType): string {
  if (type === 'system') return 'purple'
  if (type === 'activity') return 'green'
  return 'blue'
}

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchNotices({ keyword: keyword.value, status: statusFilter.value })
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

/* ---------- 新建 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<{
  title: string
  type: NoticeType
  channel: (typeof NOTICE_CHANNELS)[number]
  target: string
  content: string
  status: NoticeStatus
}>({
  title: '',
  type: 'system',
  channel: '站内信',
  target: '全部用户',
  content: '',
  status: 'sent',
})

const rules: Record<string, Rule[]> = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  target: [{ required: true, message: '请输入目标用户', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
}

function openCreate() {
  Object.assign(form, {
    title: '',
    type: 'system',
    channel: '站内信',
    target: '全部用户',
    content: '',
    status: 'sent',
  })
  modalOpen.value = true
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    await createNotice({ ...form })
    message.success('通知已创建')
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '创建失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete(id: number) {
  try {
    await deleteNotice(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

/* ---------- 查看 ---------- */
const viewOpen = ref(false)
const currentNotice = ref<NoticeItem>()

function openView(record: NoticeItem) {
  currentNotice.value = record
  viewOpen.value = true
}

onMounted(loadList)
</script>

<style scoped lang="less">
.notice-page {
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

    .filter-spacer {
      flex: 1;
    }
  }

  .notice-title {
    font-weight: 500;
    color: var(--text-main);
  }

  .danger-link {
    color: #ff7875;
  }
}
</style>

<style lang="less">
/* 通知详情抽屉挂载到 body，使用全局样式 */
.notice-detail {
  .detail-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
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
