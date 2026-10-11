<template>
  <div class="sources-page">
    <a-card :bordered="false" class="table-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <a-input-search
          v-model:value="query.keyword"
          placeholder="搜索名称 / 主机 / 描述"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select
          v-model:value="query.type"
          placeholder="数据源类型"
          allow-clear
          class="filter-select"
          :options="typeOptions"
          @change="loadList"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          新建数据源
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="conn-name">
              <span class="conn-title">{{ record.name }}</span>
              <span v-if="record.description" class="conn-desc">{{ record.description }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="typeColor(record.type)">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'endpoint'">
            <a-typography-text code>{{ record.host }}:{{ record.port }}/{{ record.database }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="record.status === 1 ? 'success' : 'error'"
              :text="record.status === 1 ? '已连接' : '已断开'"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a :disabled="testingId === record.id" @click="onTest(record)">
                <LoadingOutlined v-if="testingId === record.id" />
                {{ testingId === record.id ? '测试中' : '测试连接' }}
              </a>
              <a @click="openModal(record)">编辑</a>
              <a-popconfirm title="确定删除该数据源吗？" @confirm="onDelete(record)">
                <a class="danger-link">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建 / 编辑弹窗 -->
    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑数据源' : '新建数据源'"
      :confirm-loading="submitting"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据源名称" name="name">
              <a-input v-model:value="formState.name" placeholder="如：MySQL 订单从库" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据源类型" name="type">
              <a-select v-model:value="formState.type" :options="typeOptions" placeholder="请选择类型" />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item label="主机地址" name="host">
              <a-input v-model:value="formState.host" placeholder="如：10.20.1.11 或域名" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="端口" name="port">
              <a-input-number v-model:value="formState.port" :min="1" :max="65535" class="port-input" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据库 / Topic" name="database">
              <a-input v-model:value="formState.database" placeholder="如：anepoch_order" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人" name="owner">
              <a-input v-model:value="formState.owner" placeholder="负责人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="同步频率" name="syncFrequency">
              <a-radio-group v-model:value="formState.syncFrequency">
                <a-radio value="实时">实时</a-radio>
                <a-radio value="每小时">每小时</a-radio>
                <a-radio value="每日">每日</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="连接状态" name="status">
              <a-switch
                v-model:checked="statusChecked"
                checked-children="已连接"
                un-checked-children="已断开"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="描述" name="description">
              <a-textarea
                v-model:value="formState.description"
                placeholder="用途说明（选填）"
                :rows="2"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import {
  CONNECTION_TYPES,
  fetchConnections,
  createConnection,
  updateConnection,
  deleteConnection,
  testConnection,
} from '@/api/data/datasource'
import type { DataConnection, DataConnectionPayload } from '@/api/data/datasource'

const loading = ref(true)
const list = ref<DataConnection[]>([])
const query = reactive<{ keyword: string; type?: string }>({ keyword: '', type: undefined })

const typeOptions = CONNECTION_TYPES.map((t) => ({ label: t, value: t }))

const typeColorMap: Record<string, string> = {
  MySQL: 'blue',
  PostgreSQL: 'cyan',
  MongoDB: 'green',
  Redis: 'red',
  Kafka: 'purple',
  Elasticsearch: 'orange',
  Hive: 'gold',
  'HTTP API': 'magenta',
}

function typeColor(type: string) {
  return typeColorMap[type] || 'default'
}

const columns = [
  { title: '数据源', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 130 },
  { title: '连接信息', key: 'endpoint', width: 280 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 90 },
  { title: '同步频率', dataIndex: 'syncFrequency', key: 'syncFrequency', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '最近同步', dataIndex: 'lastSyncAt', key: 'lastSyncAt', width: 140 },
  { title: '操作', key: 'action', width: 190 },
]

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchConnections({ keyword: query.keyword || undefined, type: query.type })
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

// ---------- 新建 / 编辑 ----------
const modalOpen = ref(false)
const submitting = ref(false)
const editing = ref<DataConnection | null>(null)
const formRef = ref<FormInstance>()

const formState = reactive({
  name: '',
  type: 'MySQL' as string,
  host: '',
  port: 3306,
  database: '',
  owner: '',
  syncFrequency: '实时' as DataConnectionPayload['syncFrequency'],
  status: 1 as 0 | 1,
  description: '',
})

const statusChecked = computed({
  get: () => formState.status === 1,
  set: (val: boolean) => {
    formState.status = val ? 1 : 0
  },
})

const rules = {
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

function openModal(record?: DataConnection) {
  editing.value = record || null
  Object.assign(formState, {
    name: record?.name || '',
    type: record?.type || 'MySQL',
    host: record?.host || '',
    port: record?.port ?? 3306,
    database: record?.database || '',
    owner: record?.owner || '',
    syncFrequency: record?.syncFrequency || '实时',
    status: record?.status ?? 1,
    description: record?.description || '',
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
    const payload: DataConnectionPayload = { ...formState }
    if (editing.value) {
      await updateConnection({ ...payload, id: editing.value.id })
      message.success('数据源已更新')
    } else {
      await createConnection(payload)
      message.success('数据源已创建')
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

// ---------- 测试连接 / 删除 ----------
const testingId = ref<number | null>(null)

async function onTest(record: DataConnection) {
  testingId.value = record.id
  try {
    const tip = await testConnection(record.id)
    message.success(`${record.name}：${tip}`)
  } catch (err) {
    message.warning(err instanceof Error ? err.message : '连接失败')
  } finally {
    testingId.value = null
  }
}

async function onDelete(record: DataConnection) {
  try {
    await deleteConnection(record.id)
    message.success('已删除')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.sources-page {
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
      width: 160px;
    }

    .filter-spacer {
      flex: 1;
    }
  }

  .conn-name {
    display: flex;
    flex-direction: column;

    .conn-title {
      font-weight: 500;
      color: var(--text-main);
    }

    .conn-desc {
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .danger-link {
    color: #ff7875;
  }
}

.port-input {
  width: 100%;
}
</style>
