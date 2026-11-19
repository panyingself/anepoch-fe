<template>
  <div class="supplier-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索供应商名称 / 编码"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-select
          v-model:value="category"
          :options="categoryOptions"
          class="filter-select"
          @change="loadList"
        />
        <a-select
          v-model:value="statusFilter"
          :options="statusOptions"
          class="filter-select"
          @change="loadList"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新增供应商
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        row-key="id"
        size="middle"
        :scroll="{ x: 1240 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="name-cell">
              <span class="name">{{ record.name }}</span>
              <span class="code">{{ record.code }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'level'">
            <a-tag :color="levelColor(record.level)">{{ record.level }} 级</a-tag>
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
                title="确定删除该供应商吗？"
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
      :title="editingId ? '编辑物料供应商' : '新增物料供应商'"
      width="600px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="供应商编码" name="code">
          <a-input v-model:value="form.code" :disabled="!!editingId" placeholder="如 SUP009" />
          <span v-if="editingId" class="form-tip">编码创建后不可修改</span>
        </a-form-item>
        <a-form-item label="供应商名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入供应商名称" />
        </a-form-item>
        <a-form-item label="供货品类" name="category">
          <a-select v-model:value="form.category" :options="categoryOptions1" />
        </a-form-item>
        <a-form-item label="等级" name="level">
          <a-select v-model:value="form.level" :options="levelOptions" />
        </a-form-item>
        <a-form-item label="联系人" name="contact">
          <a-input v-model:value="form.contact" placeholder="请输入联系人" />
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="form.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="地址" name="address">
          <a-input v-model:value="form.address" placeholder="请输入供应商地址" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_LEVELS,
  createMaterialSupplier,
  deleteMaterialSupplier,
  fetchMaterialSuppliers,
  toggleMaterialSupplier,
  updateMaterialSupplier,
  type MaterialSupplier,
  type MaterialSupplierPayload,
} from '@/api/supply'

const loading = ref(false)
const list = ref<MaterialSupplier[]>([])
const keyword = ref('')
const category = ref('')
const statusFilter = ref<0 | 1 | ''>('')

const columns = [
  { title: '供应商名称 / 编码', key: 'name', width: 260 },
  { title: '供货品类', dataIndex: 'category', key: 'category', width: 140 },
  { title: '联系人', dataIndex: 'contact', key: 'contact', width: 110 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 150 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 200 },
  { title: '等级', key: 'level', width: 100 },
  { title: '状态', key: 'status', width: 110 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 130 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const },
]

const categoryOptions = computed(() => [
  { label: '全部品类', value: '' },
  ...SUPPLIER_CATEGORIES.map((v) => ({ label: v, value: v })),
])
const categoryOptions1 = SUPPLIER_CATEGORIES.map((v) => ({ label: v, value: v }))
const levelOptions = SUPPLIER_LEVELS.map((v) => ({ label: `${v} 级`, value: v }))
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
]

function levelColor(level: string): string {
  if (level === 'A') return 'green'
  if (level === 'B') return 'blue'
  return 'default'
}

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchMaterialSuppliers({
      keyword: keyword.value,
      category: category.value || undefined,
      status: statusFilter.value,
    })
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  keyword.value = ''
  category.value = ''
  statusFilter.value = ''
  loadList()
}

/* ---------- 新增 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const editingId = ref(0)
const formRef = ref<FormInstance>()
const form = reactive<MaterialSupplierPayload>({
  code: '',
  name: '',
  category: SUPPLIER_CATEGORIES[0],
  contact: '',
  phone: '',
  address: '',
  level: 'B',
  status: 1,
})

const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '请输入供应商编码' },
    { pattern: /^[A-Za-z0-9-]+$/, message: '仅支持字母、数字与短横线' },
  ],
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
}

function resetForm() {
  Object.assign(form, {
    code: '',
    name: '',
    category: SUPPLIER_CATEGORIES[0],
    contact: '',
    phone: '',
    address: '',
    level: 'B',
    status: 1,
  })
}

function openCreate() {
  editingId.value = 0
  resetForm()
  modalOpen.value = true
  formRef.value?.clearValidate()
}

function openEdit(record: MaterialSupplier) {
  editingId.value = record.id
  Object.assign(form, {
    code: record.code,
    name: record.name,
    category: record.category,
    contact: record.contact,
    phone: record.phone,
    address: record.address,
    level: record.level,
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
      await updateMaterialSupplier(editingId.value, { ...form })
      message.success('供应商已更新')
    } else {
      await createMaterialSupplier({ ...form })
      message.success('供应商已新增')
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onToggle(record: MaterialSupplier, checked: boolean) {
  try {
    await toggleMaterialSupplier(record.id, checked ? 1 : 0)
    record.status = checked ? 1 : 0
    message.success(checked ? '已启用' : '已停用')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(id: number) {
  try {
    await deleteMaterialSupplier(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.supplier-page {
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

  .name-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .name {
      font-weight: 500;
      color: var(--text-main);
    }

    .code {
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .danger-link {
    color: #ff7875;
  }

  .form-tip {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-sub);
  }
}
</style>
