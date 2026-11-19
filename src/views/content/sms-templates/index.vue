<template>
  <div class="tpl-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索模板名称 / 编码"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select v-model:value="statusFilter" :options="statusOptions" class="filter-select" @change="loadList" />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新增短信模板
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
          <template v-if="column.key === 'name'">
            <div class="tpl-cell">
              <span class="tpl-name">{{ record.name }}</span>
              <span class="tpl-code">{{ record.code }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'content'">
            <span class="tpl-content">{{ record.content }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-popconfirm
              :title="`确定${record.status === 1 ? '停用' : '启用'}「${record.name}」吗？`"
              :ok-text="record.status === 1 ? '确定停用' : '确定启用'"
              cancel-text="取消"
              @confirm="onToggle(record, record.status !== 1)"
            >
              <a-switch :checked="record.status === 1" checked-children="启用" un-checked-children="停用" />
            </a-popconfirm>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openEdit(record)">编辑</a>
              <a-popconfirm
                title="确定删除该短信模板吗？"
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
      :title="editingId ? '编辑短信模板' : '新增短信模板'"
      width="620px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="模板编码" name="code">
          <a-input v-model:value="form.code" :disabled="!!editingId" placeholder="如 SMS_ACTIVITY" />
          <span class="tpl-tip">
            {{ editingId ? '编码创建后不可修改' : '大写字母、数字与下划线，创建后不可修改' }}
          </span>
        </a-form-item>
        <a-form-item label="模板名称" name="name">
          <a-input v-model:value="form.name" placeholder="如 活动开始提醒" />
        </a-form-item>
        <a-form-item label="短信内容" name="content">
          <a-textarea
            v-model:value="form.content"
            :rows="4"
            placeholder="支持变量占位符，如 您的验证码为 {code}，5 分钟内有效。"
            show-count
            :maxlength="200"
          />
          <span class="tpl-tip">占位符使用花括号包裹，发送时由业务参数替换</span>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
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
  createSmsTemplate,
  deleteSmsTemplate,
  fetchSmsTemplates,
  toggleSmsTemplate,
  updateSmsTemplate,
  type SmsTemplate,
  type TemplateStatus,
} from '@/api/content'

const loading = ref(false)
const list = ref<SmsTemplate[]>([])
const keyword = ref('')
const statusFilter = ref<TemplateStatus | ''>('')

const columns = [
  { title: '模板名称 / 编码', key: 'name', width: 220 },
  { title: '短信内容', key: 'content', width: 380 },
  { title: '状态', key: 'status', width: 110 },
  { title: '更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 130 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' as const },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
]

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchSmsTemplates({ keyword: keyword.value, status: statusFilter.value })
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

/* ---------- 新增 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const editingId = ref(0)
const formRef = ref<FormInstance>()
const form = reactive({
  code: '',
  name: '',
  content: '',
  status: 1 as TemplateStatus,
})

const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '请输入模板编码' },
    { pattern: /^[A-Za-z0-9_]+$/, message: '仅支持字母、数字与下划线' },
  ],
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入短信内容', trigger: 'blur' }],
}

function openCreate() {
  editingId.value = 0
  Object.assign(form, { code: '', name: '', content: '', status: 1 })
  modalOpen.value = true
  formRef.value?.clearValidate()
}

function openEdit(record: SmsTemplate) {
  editingId.value = record.id
  Object.assign(form, {
    code: record.code,
    name: record.name,
    content: record.content,
    status: record.status,
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
    if (editingId.value) {
      await updateSmsTemplate(editingId.value, { ...form })
      message.success('模板已更新')
    } else {
      await createSmsTemplate({ ...form })
      message.success('模板已新增')
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onToggle(record: SmsTemplate, checked: boolean) {
  try {
    await toggleSmsTemplate(record.id, checked ? 1 : 0)
    record.status = checked ? 1 : 0
    message.success(checked ? '已启用' : '已停用')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(id: number) {
  try {
    await deleteSmsTemplate(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.tpl-page {
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

    .filter-spacer {
      flex: 1;
    }
  }

  .tpl-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .tpl-name {
      font-weight: 500;
      color: var(--text-main);
    }

    .tpl-code {
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .tpl-content {
    color: var(--text-main);
  }

  .danger-link {
    color: #ff7875;
  }
}
</style>

<style lang="less">
/* 弹窗挂载到 body，提示文案使用全局样式 */
.tpl-tip {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-sub);
}
</style>
