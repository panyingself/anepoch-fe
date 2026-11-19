<template>
  <div class="channels-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="query.keyword"
          placeholder="搜索渠道 / 负责人"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select
          v-model:value="query.type"
          placeholder="渠道类型"
          allow-clear
          class="filter-select"
          :options="typeOptions"
          @change="loadList"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openModal">
          <template #icon><PlusOutlined /></template>
          新增渠道
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
        :scroll="{ x: 820 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="channel-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="typeColor(record.type)">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'budget'">
            ¥{{ record.budget.toLocaleString() }}
          </template>
          <template v-else-if="column.key === 'conversion'">
            <span class="conversion">{{ record.conversion }}%</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.status === 1"
              checked-children="启用"
              un-checked-children="停用"
              @change="(checked: boolean) => onToggle(record, checked)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-popconfirm
              title="确定删除该渠道吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="onDelete(record.id)"
            >
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      title="新增投放渠道"
      :confirm-loading="submitting"
      width="480px"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="渠道名称" name="name">
          <a-input v-model:value="form.name" placeholder="如：站内首页 Banner" />
        </a-form-item>
        <a-form-item label="渠道类型" name="type">
          <a-select v-model:value="form.type" :options="typeOptions" />
        </a-form-item>
        <a-form-item label="负责人" name="owner">
          <a-input v-model:value="form.owner" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="月预算（元）" name="budget">
          <a-input-number v-model:value="form.budget" :min="0" :step="5000" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  CHANNEL_TYPES,
  createChannel,
  deleteChannel,
  fetchChannels,
  toggleChannelStatus,
  type ChannelItem,
} from '@/api/marketing'

const loading = ref(false)
const list = ref<ChannelItem[]>([])
const query = reactive<{ keyword: string; type?: string }>({ keyword: '' })
const typeOptions = CHANNEL_TYPES.map((v) => ({ label: v, value: v }))

const columns = [
  { title: '渠道名称', dataIndex: 'name', key: 'name', width: 190 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
  { title: '月预算', dataIndex: 'budget', key: 'budget', width: 120 },
  { title: '转化率', dataIndex: 'conversion', key: 'conversion', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 90, fixed: 'right' as const },
]

const typeColor = (type: string) =>
  type === '站内' ? 'blue' : type === '私域' ? 'purple' : type === '短信' ? 'cyan' : 'orange'

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchChannels({
      keyword: query.keyword || undefined,
      type: query.type || undefined,
    })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.keyword = ''
  query.type = undefined
  loadList()
}

/* ---------- 新增 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ name: '', type: CHANNEL_TYPES[0], owner: '', budget: 50000 })

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择渠道类型' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  budget: [{ required: true, message: '请输入月预算' }],
}

function openModal() {
  Object.assign(form, { name: '', type: CHANNEL_TYPES[0], owner: '', budget: 50000 })
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
    await createChannel({
      name: form.name.trim(),
      type: form.type,
      owner: form.owner.trim(),
      budget: form.budget,
      conversion: 0,
      status: 1,
    })
    message.success('渠道创建成功')
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function onToggle(record: ChannelItem, checked: boolean) {
  try {
    await toggleChannelStatus(record.id, checked ? 1 : 0)
    record.status = checked ? 1 : 0
    message.success(checked ? '渠道已启用' : '渠道已停用')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(id: number) {
  try {
    await deleteChannel(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.channels-page {
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

  .channel-name {
    font-weight: 500;
    color: var(--text-main);
  }

  .conversion {
    font-weight: 600;
    color: #52c41a;
  }

  .danger-link {
    color: #ff7875;
  }
}
</style>
