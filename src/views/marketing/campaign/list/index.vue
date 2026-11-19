<template>
  <div class="campaigns-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="query.keyword"
          placeholder="搜索活动名称 / 类型"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select
          v-model:value="query.status"
          placeholder="活动状态"
          allow-clear
          class="filter-select"
          :options="statusOptions"
          @change="loadList"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          新建活动
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
        :scroll="{ x: 1080 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="campaign-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag color="purple">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'channel'">
            <span class="text-sub">{{ record.channel }}</span>
          </template>
          <template v-else-if="column.key === 'period'">
            <span class="text-sub">{{ record.startAt }} ~ {{ record.endAt }}</span>
          </template>
          <template v-else-if="column.key === 'budget'">
            ¥{{ record.budget.toLocaleString() }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="STATUS_MAP[record.status as CampaignStatus].color">
              {{ STATUS_MAP[record.status as CampaignStatus].label }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'materials'">
            <a-tooltip v-if="record.materials.length" :title="materialSummary(record)">
              <a-tag color="purple" class="material-tag">{{ record.materials.length }} 项物料</a-tag>
            </a-tooltip>
            <span v-else class="text-sub">未关联</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="goMaterials(record)">物料配置</a>
              <a @click="openModal(record)">编辑</a>
              <a-popconfirm
                title="确定删除该活动吗？"
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
      :title="editing ? '编辑活动' : '新建活动'"
      :confirm-loading="submitting"
      width="560px"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="活动名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入活动名称" />
        </a-form-item>
        <a-form-item label="活动类型" name="type">
          <a-select v-model:value="form.type" :options="typeOptions" placeholder="请选择活动类型" />
        </a-form-item>
        <a-form-item label="投放渠道" name="channel">
          <a-select v-model:value="form.channel" :options="channelOptions" placeholder="请选择投放渠道" />
        </a-form-item>
        <a-form-item label="活动时间" name="period">
          <a-range-picker
            v-model:value="form.period"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="预算（元）" name="budget">
          <a-input-number v-model:value="form.budget" :min="0" :step="1000" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="form.status" :options="statusOptions" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_TYPES,
  createCampaign,
  deleteCampaign,
  fetchCampaigns,
  updateCampaign,
  type Campaign,
  type CampaignStatus,
} from '@/api/marketing'

const router = useRouter()

const STATUS_MAP: Record<CampaignStatus, { label: string; color: string }> = {
  running: { label: '进行中', color: 'green' },
  pending: { label: '待开始', color: 'blue' },
  ended: { label: '已结束', color: 'default' },
}

const loading = ref(false)
const list = ref<Campaign[]>([])
const query = reactive<{ keyword: string; status?: CampaignStatus }>({ keyword: '' })
const statusOptions = [
  { label: '进行中', value: 'running' },
  { label: '待开始', value: 'pending' },
  { label: '已结束', value: 'ended' },
]
const typeOptions = CAMPAIGN_TYPES.map((v) => ({ label: v, value: v }))
const channelOptions = CAMPAIGN_CHANNELS.map((v) => ({ label: v, value: v }))

const columns = [
  { title: '活动名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '渠道', dataIndex: 'channel', key: 'channel', width: 90 },
  { title: '活动时间', key: 'period', width: 200 },
  { title: '预算', dataIndex: 'budget', key: 'budget', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '关联物料', key: 'materials', width: 130 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
]

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchCampaigns({
      keyword: query.keyword || undefined,
      status: query.status || undefined,
    })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.keyword = ''
  query.status = undefined
  loadList()
}

/* ---------- 新建 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const editing = ref(false)
const editingId = ref(0)
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  type: CAMPAIGN_TYPES[0],
  channel: CAMPAIGN_CHANNELS[0],
  period: [] as string[],
  budget: 50000,
  status: 'pending' as CampaignStatus,
})

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型' }],
  channel: [{ required: true, message: '请选择投放渠道' }],
  period: [{ required: true, message: '请选择活动时间' }],
  budget: [{ required: true, message: '请输入预算' }],
}

function defaultPeriod(): string[] {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 7)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return [fmt(start), fmt(end)]
}

function openModal(record?: Campaign) {
  editing.value = !!record
  editingId.value = record?.id ?? 0
  Object.assign(form, {
    name: record?.name ?? '',
    type: record?.type ?? CAMPAIGN_TYPES[0],
    channel: record?.channel ?? CAMPAIGN_CHANNELS[0],
    period: record ? [record.startAt, record.endAt] : defaultPeriod(),
    budget: record?.budget ?? 50000,
    status: record?.status ?? 'pending',
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
    const payload = {
      name: form.name.trim(),
      type: form.type,
      channel: form.channel,
      startAt: form.period[0],
      endAt: form.period[1],
      budget: form.budget,
      status: form.status,
    }
    if (editing.value) {
      await updateCampaign(editingId.value, payload)
      message.success('活动更新成功')
    } else {
      await createCampaign(payload)
      message.success('活动创建成功')
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete(id: number) {
  try {
    await deleteCampaign(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

/** 物料摘要（列表「关联物料」列悬停展示） */
function materialSummary(record: Campaign): string {
  return record.materials.map((m) => `${m.name} ×${m.quantity}`).join('、')
}

/** 跳转活动物料管理页，并带入当前活动 */
function goMaterials(record: Campaign) {
  router.push({ path: '/marketing/campaign/materials', query: { campaignId: String(record.id) } })
}

onMounted(loadList)
</script>

<style scoped lang="less">
.campaigns-page {
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
      width: 150px;
    }

    .filter-spacer {
      flex: 1;
    }
  }

  .campaign-name {
    font-weight: 500;
    color: var(--text-main);
  }

  .text-sub {
    font-size: 12px;
    color: var(--text-sub);
  }

  .danger-link {
    color: #ff7875;
  }
}
</style>
