<template>
  <a-card :bordered="false" class="page-card">
    <div class="table-toolbar">
      <span class="table-title">资源列表</span>
      <a-space>
        <a-button @click="toggleExpand">
          <template #icon><ExpandOutlined v-if="!isAllExpanded" /><ShrinkOutlined v-else /></template>
          {{ isAllExpanded ? '全部折叠' : '全部展开' }}
        </a-button>
        <a-button type="primary" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          新增资源
        </a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="middle"
      :expanded-row-keys="expandedKeys"
      @expanded-rows-change="onExpandedChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="RESOURCE_TYPE_MAP[record.type as ResourceType]?.color">
            <component :is="typeIcon(record.type as ResourceType)" />
            {{ RESOURCE_TYPE_MAP[record.type as ResourceType]?.label }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'code'">
          <span class="code-text">{{ record.code }}</span>
        </template>
        <template v-else-if="column.key === 'path'">
          <code v-if="record.path" class="path-code">{{ record.path }}</code>
          <span v-else class="text-sub">—</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-badge
            :status="record.status === 1 ? 'success' : 'default'"
            :text="record.status === 1 ? '启用' : '停用'"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openModal(record)">编辑</a>
            <a v-if="record.type === 'catalog' || record.type === 'menu'" @click="openModal(undefined, record)">
              新增下级
            </a>
            <a-popconfirm title="确定删除该资源吗？" @confirm="onDelete(record)">
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增 / 编辑弹窗 -->
    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑资源' : '新增资源'"
      :confirm-loading="submitting"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="资源类型" name="type">
              <a-select v-model:value="formState.type">
                <a-select-option v-for="(meta, type) in RESOURCE_TYPE_MAP" :key="type" :value="type">
                  {{ meta.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="上级资源" name="parentId">
              <a-tree-select
                v-model:value="formState.parentId"
                :tree-data="parentTreeData"
                :field-names="{ children: 'children', label: 'name', value: 'id' }"
                placeholder="不选择则为顶级资源"
                allow-clear
                tree-default-expand-all
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="资源名称" name="name">
              <a-input v-model:value="formState.name" placeholder="如：用户管理" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="权限编码" name="code">
              <a-input v-model:value="formState.code" placeholder="如：admin:user:create" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="路径" name="path">
              <a-input v-model:value="formState.path" placeholder="路由 / 接口路径（选填）" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序" name="sort">
              <a-input-number v-model:value="formState.sort" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-radio-group v-model:value="formState.status">
                <a-radio :value="1">启用</a-radio>
                <a-radio :value="0">停用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import {
  PlusOutlined,
  ExpandOutlined,
  ShrinkOutlined,
  FolderOutlined,
  MenuOutlined,
  ControlOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue'
import {
  fetchResourceTree,
  createResource,
  updateResource,
  deleteResource,
  RESOURCE_TYPE_MAP,
} from '@/api/admin/resource'
import type { ResourceNode, ResourcePayload, ResourceType } from '@/api/admin/resource'

const TYPE_ICONS: Record<ResourceType, unknown> = {
  catalog: FolderOutlined,
  menu: MenuOutlined,
  button: ControlOutlined,
  api: ApiOutlined,
}

function typeIcon(type: ResourceType) {
  return TYPE_ICONS[type]
}

const loading = ref(true)
const list = ref<ResourceNode[]>([])

const columns = [
  { title: '资源名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '权限编码', dataIndex: 'code', key: 'code' },
  { title: '路径', dataIndex: 'path', key: 'path', ellipsis: true },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
]

// ---------- 展开 / 折叠（受控展开必须同步事件，否则箭头被重置） ----------
const expandedKeys = ref<number[]>([])

function flattenKeys(nodes: ResourceNode[], onlyParents = true): number[] {
  const keys: number[] = []
  const walk = (items: ResourceNode[]) => {
    items.forEach((n) => {
      if (!onlyParents || n.children?.length) keys.push(n.id)
      if (n.children) walk(n.children)
    })
  }
  walk(nodes)
  return keys
}

function onExpandedChange(keys: (number | string)[]) {
  expandedKeys.value = keys.map(Number)
}

const isAllExpanded = computed(() => {
  const parents = flattenKeys(list.value)
  return parents.length > 0 && expandedKeys.value.length >= parents.length
})

function toggleExpand() {
  expandedKeys.value = isAllExpanded.value ? [] : flattenKeys(list.value)
}

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchResourceTree()
    expandedKeys.value = flattenKeys(list.value)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

// ---------- 新增 / 编辑 ----------
const modalOpen = ref(false)
const submitting = ref(false)
const editing = ref(false)
const formRef = ref<FormInstance>()

const formState = reactive<ResourcePayload>({
  id: undefined,
  parentId: null,
  type: 'menu',
  name: '',
  code: '',
  path: '',
  sort: 1,
  status: 1,
})

/** 编辑时剔除自身子树，防止把上级选到自己下面 */
function stripNode(nodes: ResourceNode[], excludeId: number): ResourceNode[] {
  return nodes
    .filter((n) => n.id !== excludeId)
    .map((n) => ({ ...n, children: n.children ? stripNode(n.children, excludeId) : undefined }))
}

const parentTreeData = computed<ResourceNode[]>(() =>
  editing.value && formState.id ? stripNode(list.value, formState.id) : list.value,
)

const rules = {
  name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
}

function openModal(record?: ResourceNode, parent?: ResourceNode) {
  editing.value = !!record
  Object.assign(formState, {
    id: record?.id,
    parentId: record ? record.parentId : parent?.id ?? null,
    type: record?.type ?? 'menu',
    name: record?.name || '',
    code: record?.code || '',
    path: record?.path || '',
    sort: record?.sort ?? 1,
    status: record?.status ?? 1,
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
    if (editing.value) {
      await updateResource({ ...formState })
      message.success('更新成功')
    } else {
      await createResource({ ...formState })
      message.success('创建成功')
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete(record: ResourceNode) {
  try {
    await deleteResource(record.id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.page-card {
  border-radius: 8px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .table-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
  }
}

.code-text {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  opacity: 0.85;
}

.path-code {
  padding: 2px 8px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  border-radius: 4px;
  background: var(--accent-bg, rgba(0, 0, 0, 0.04));
}

.text-sub {
  opacity: 0.45;
}

.danger-link {
  color: #ff4d4f;
}
</style>
