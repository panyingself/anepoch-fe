<template>
  <div class="points-page">
    <a-row :gutter="16" class="stat-row">
      <a-col v-for="item in statCards" :key="item.title" :xs="12" :sm="12" :lg="6">
        <a-card :bordered="false" class="stat-card" :loading="loading">
          <span class="stat-title">{{ item.title }}</span>
          <a-statistic :value="item.value" :precision="0" :suffix="item.suffix" />
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索会员 / 变动原因"
          class="filter-input"
          allow-clear
          @search="loadRecords"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openModal">
          <template #icon><PlusOutlined /></template>
          调整积分
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="records"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
        :scroll="{ x: 720 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <a-avatar :size="24" class="user-avatar">{{ record.user.slice(0, 1) }}</a-avatar>
            <span class="user-name">{{ record.user }}</span>
          </template>
          <template v-else-if="column.key === 'change'">
            <span :class="record.change >= 0 ? 'plus' : 'minus'">
              {{ record.change >= 0 ? '+' : '' }}{{ record.change }}
            </span>
          </template>
          <template v-else-if="column.key === 'reason'">
            <span class="text-sub">{{ record.reason }}</span>
          </template>
          <template v-else-if="column.key === 'occurredAt'">
            <span class="text-sub">{{ record.occurredAt }}</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      title="调整积分"
      :confirm-loading="submitting"
      width="480px"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="会员" name="user">
          <a-input v-model:value="form.user" placeholder="请输入会员姓名" />
        </a-form-item>
        <a-form-item label="变动值" name="change">
          <a-input-number v-model:value="form.change" :precision="0" :step="50" style="width: 100%" />
          <span class="form-tip">正数为发放，负数为扣减</span>
        </a-form-item>
        <a-form-item label="原因" name="reason">
          <a-input v-model:value="form.reason" placeholder="如：活动奖励 / 兑换扣减" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  adjustPoints,
  fetchPointRecords,
  fetchPointSummary,
  type PointRecord,
  type PointSummary,
} from '@/api/marketing'

const loading = ref(false)
const summary = ref<PointSummary>()
const records = ref<PointRecord[]>([])
const keyword = ref('')

const statCards = computed(() => [
  { title: '累计发放积分', value: summary.value?.issued ?? 0, suffix: '分' },
  { title: '累计消耗积分', value: summary.value?.consumed ?? 0, suffix: '分' },
  { title: '当前流通积分', value: summary.value?.circulating ?? 0, suffix: '分' },
  { title: '参与会员数', value: summary.value?.members ?? 0, suffix: '人' },
])

const columns = [
  { title: '会员', dataIndex: 'user', key: 'user', width: 140 },
  { title: '变动', dataIndex: 'change', key: 'change', width: 110 },
  { title: '原因', dataIndex: 'reason', key: 'reason', width: 200 },
  { title: '发生时间', dataIndex: 'occurredAt', key: 'occurredAt', width: 170 },
]

async function loadRecords() {
  loading.value = true
  try {
    const [s, r] = await Promise.all([
      fetchPointSummary(),
      fetchPointRecords({ keyword: keyword.value || undefined }),
    ])
    summary.value = s
    records.value = r
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  keyword.value = ''
  loadRecords()
}

/* ---------- 调整积分 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ user: '', change: 100, reason: '' })

const rules: Record<string, Rule[]> = {
  user: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
  change: [{ required: true, message: '请输入变动积分' }],
  reason: [{ required: true, message: '请输入变动原因', trigger: 'blur' }],
}

function openModal() {
  Object.assign(form, { user: '', change: 100, reason: '' })
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
    await adjustPoints(form.user.trim(), form.change, form.reason.trim())
    message.success('积分调整成功')
    modalOpen.value = false
    loadRecords()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadRecords)
</script>

<style scoped lang="less">
.points-page {
  .stat-row {
    margin-bottom: 16px;
  }

  .stat-card {
    border-radius: 12px;

    .stat-title {
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--text-sub);
    }

    :deep(.ant-statistic-content) {
      font-size: 22px;
      color: var(--text-main);
    }
  }

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

    .filter-spacer {
      flex: 1;
    }
  }

  .user-avatar {
    background: rgba(146, 84, 222, 0.16);
    color: #9254de;
  }

  .user-name {
    margin-left: 8px;
    font-weight: 500;
    color: var(--text-main);
  }

  .plus {
    font-weight: 600;
    color: #52c41a;
  }

  .minus {
    font-weight: 600;
    color: #ff7875;
  }

  .text-sub {
    font-size: 12px;
    color: var(--text-sub);
  }

  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: var(--text-sub);
  }
}
</style>
