<template>
  <a-card :bordered="false" class="page-card">
    <div class="table-toolbar">
      <span class="table-title">角色列表</span>
      <a-button type="primary" @click="openModal()">
        <template #icon><PlusOutlined /></template>
        新增角色
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
        <template v-if="column.key === 'code'">
          <a-tag color="blue">{{ record.code }}</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-badge :status="record.status === 1 ? 'success' : 'default'" :text="record.status === 1 ? '启用' : '禁用'" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openModal(record)">编辑</a>
            <a @click="openGrant(record)">分配权限</a>
            <a-popconfirm title="确定删除该角色吗？" @confirm="onDelete(record)">
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑角色' : '新增角色'"
      :confirm-loading="submitting"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="formState.name" placeholder="如：运营人员" />
        </a-form-item>
        <a-form-item label="角色编码" name="code">
          <a-input v-model:value="formState.code" :disabled="editing" placeholder="如：operator" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="角色职责说明（选填）" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配权限弹窗 -->
    <a-modal
      v-model:open="grantOpen"
      :title="`分配权限 - ${granting?.name || ''}`"
      :confirm-loading="grantSaving"
      :mask-closable="false"
      @ok="handleGrant"
    >
      <a-alert
        class="grant-tip"
        type="info"
        show-icon
        message="勾选资源后保存，该角色即拥有对应菜单与操作权限。"
      />
      <div class="grant-actions">
        <a-button size="small" @click="toggleGrantExpand">
          {{ grantAllExpanded ? '全部折叠' : '全部展开' }}
        </a-button>
      </div>
      <a-spin :spinning="grantLoading">
        <a-tree
          v-if="resourceTree.length"
          v-model:checked-keys="checkedKeys"
          v-model:expanded-keys="grantExpandedKeys"
          :tree-data="resourceTree"
          :field-names="{ children: 'children', title: 'name', key: 'id' }"
          checkable
          :selectable="false"
        />
      </a-spin>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { fetchRoles, addRole, editRoleById, removeRole } from '@/api/admin/role'
import type { RoleItem, RolePayload } from '@/api/admin/role'
import { fetchResourceTree, fetchRoleResourceIds, assignRoleResources } from '@/api/admin/resource'
import type { ResourceNode } from '@/api/admin/resource'

const loading = ref(true)
const list = ref<RoleItem[]>([])

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '角色编码', dataIndex: 'code', key: 'code' },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 180 },
]

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchRoles()
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

const formState = reactive<RolePayload>({
  id: undefined,
  name: '',
  code: '',
  description: '',
  status: 1,
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]{1,29}$/, message: '2-30 位小写字母开头的编码', trigger: 'blur' },
  ],
}

function openModal(record?: RoleItem) {
  editing.value = !!record
  Object.assign(formState, {
    id: record?.id,
    name: record?.name || '',
    code: record?.code || '',
    description: record?.description || '',
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
      await editRoleById({ ...formState })
      message.success('更新成功')
    } else {
      const { id: _id, ...payload } = formState
      await addRole(payload as RolePayload)
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

async function onDelete(record: RoleItem) {
  try {
    await removeRole(record.id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

// ---------- 分配权限 ----------
const grantOpen = ref(false)
const grantLoading = ref(false)
const grantSaving = ref(false)
const granting = ref<RoleItem | null>(null)
const resourceTree = ref<ResourceNode[]>([])
const checkedKeys = ref<number[]>([])
const grantExpandedKeys = ref<number[]>([])

function parentKeys(nodes: ResourceNode[]): number[] {
  const keys: number[] = []
  const walk = (items: ResourceNode[]) => {
    items.forEach((n) => {
      if (n.children?.length) {
        keys.push(n.id)
        walk(n.children)
      }
    })
  }
  walk(nodes)
  return keys
}

const grantAllExpanded = computed(() => {
  const parents = parentKeys(resourceTree.value)
  return parents.length > 0 && grantExpandedKeys.value.length >= parents.length
})

function toggleGrantExpand() {
  grantExpandedKeys.value = grantAllExpanded.value ? [] : parentKeys(resourceTree.value)
}

async function openGrant(record: RoleItem) {
  granting.value = record
  grantOpen.value = true
  grantLoading.value = true
  try {
    if (!resourceTree.value.length) {
      resourceTree.value = await fetchResourceTree()
    }
    checkedKeys.value = await fetchRoleResourceIds(record.id)
    grantExpandedKeys.value = parentKeys(resourceTree.value)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载资源失败')
  } finally {
    grantLoading.value = false
  }
}

async function handleGrant() {
  if (!granting.value) return
  grantSaving.value = true
  try {
    await assignRoleResources(granting.value.id, [...checkedKeys.value])
    message.success('权限已保存')
    grantOpen.value = false
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    grantSaving.value = false
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

.grant-tip {
  margin-bottom: 12px;
}

.grant-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.danger-link {
  color: #ff4d4f;
}
</style>
