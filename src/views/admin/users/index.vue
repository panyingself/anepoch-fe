<template>
  <a-card :bordered="false" class="page-card">
    <!-- 搜索栏 -->
    <a-form layout="inline" class="search-form" @submit.prevent="handleSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="query.keyword"
          placeholder="用户名 / 昵称 / 邮箱"
          allow-clear
          style="width: 220px"
          @press-enter="handleSearch"
        />
      </a-form-item>
      <a-form-item label="状态">
        <a-select
          v-model:value="query.status"
          placeholder="全部"
          allow-clear
          style="width: 120px"
        >
          <a-select-option :value="1">启用</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button @click="handleReset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <!-- 工具栏 -->
    <div class="table-toolbar">
      <span class="table-title">用户列表</span>
      <a-button type="primary" @click="openModal()">
        <template #icon><PlusOutlined /></template>
        新增用户
      </a-button>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      size="middle"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'roleIds'">
          <template v-if="record.roleIds?.length">
            <a-tag v-for="roleId in record.roleIds" :key="roleId" color="blue">
              {{ roleOptions.find((r) => r.id === roleId)?.name || `角色${roleId}` }}
            </a-tag>
          </template>
          <span v-else class="text-sub">未分配</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-popconfirm
            :title="
              record.status === 1
                ? `确定禁用用户「${record.nickname || record.username}」吗？禁用后将无法登录。`
                : `确定启用用户「${record.nickname || record.username}」吗？`
            "
            :ok-text="record.status === 1 ? '确定禁用' : '确定启用'"
            cancel-text="取消"
            @confirm="onToggleStatus(record)"
          >
            <a-switch
              :checked="record.status === 1"
              checked-children="启用"
              un-checked-children="禁用"
            />
          </a-popconfirm>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openModal(record)">编辑</a>
            <a-popconfirm title="确定删除该用户吗？" @confirm="onDelete(record)">
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增 / 编辑弹窗 -->
    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑用户' : '新增用户'"
      :confirm-loading="submitting"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="formState.username" :disabled="editing" placeholder="登录账号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="昵称" name="nickname">
              <a-input v-model:value="formState.nickname" placeholder="显示名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="formState.email" placeholder="example@mail.com" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机号" name="phone">
              <a-input v-model:value="formState.phone" placeholder="11 位手机号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部门" name="dept">
              <a-tree-select
                v-model:value="formState.dept"
                :tree-data="deptOptions"
                :field-names="{ children: 'children', label: 'name', value: 'name' }"
                placeholder="请选择部门"
                tree-default-expand-all
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色" name="roleIds">
              <a-select
                v-model:value="formState.roleIds"
                mode="multiple"
                placeholder="请选择角色（可多选）"
                :options="roleOptions.map((r) => ({ label: r.name, value: r.id }))"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-radio-group v-model:value="formState.status">
                <a-radio :value="1">启用</a-radio>
                <a-radio :value="0">禁用</a-radio>
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
import type { TableProps } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { fetchUsers, addUser, editUserById, removeUser } from '@/api/admin/user'
import type { UserItem, UserPayload } from '@/api/admin/user'
import { fetchDeptTree, buildDeptOptions } from '@/api/admin/dept'
import type { DeptOption } from '@/api/admin/dept'
import { fetchRoles } from '@/api/admin/role'
import type { RoleItem } from '@/api/admin/role'

const deptOptions = ref<DeptOption[]>([])
const roleOptions = ref<RoleItem[]>([])
const loading = ref(true)
const list = ref<UserItem[]>([])
const total = ref(0)

const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined,
})

const pagination = computed(() => ({
  current: query.page,
  pageSize: query.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`,
}))

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '邮箱', dataIndex: 'email', key: 'email', ellipsis: true },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '部门', dataIndex: 'dept', key: 'dept', width: 100 },
  { title: '角色', dataIndex: 'roleIds', key: 'roleIds', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

async function loadList() {
  loading.value = true
  try {
    const res = await fetchUsers({ ...query })
    list.value = res.list
    total.value = res.total
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadList()
}

function handleReset() {
  query.keyword = ''
  query.status = undefined
  handleSearch()
}

const onTableChange: TableProps['onChange'] = (pag) => {
  query.page = pag.current || 1
  query.pageSize = pag.pageSize || 10
  loadList()
}

// ---------- 新增 / 编辑 ----------
const modalOpen = ref(false)
const submitting = ref(false)
const editing = ref(false)
const formRef = ref<FormInstance>()

const formState = reactive<UserPayload>({
  id: undefined,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  dept: '',
  roleIds: [],
  status: 1,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, message: '3-20 位字母开头的字母/数字/下划线', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

function openModal(record?: UserItem) {
  editing.value = !!record
  Object.assign(formState, {
    id: record?.id,
    username: record?.username || '',
    nickname: record?.nickname || '',
    email: record?.email || '',
    phone: record?.phone || '',
    dept: record?.dept || '',
    roleIds: [...(record?.roleIds || [])],
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
      await editUserById({ ...formState })
      message.success('更新成功')
    } else {
      const { id: _id, ...payload } = formState
      await addUser(payload as UserPayload)
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

async function onToggleStatus(record: UserItem) {
  const next = record.status === 1 ? 0 : 1
  try {
    await editUserById({ ...record, status: next })
    record.status = next
    message.success(next === 1 ? '已启用' : '已禁用')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(record: UserItem) {
  try {
    await removeUser(record.id)
    message.success('删除成功')
    if (list.value.length === 1 && query.page > 1) {
      query.page -= 1
    }
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

async function loadMeta() {
  const [deptTree, roles] = await Promise.all([fetchDeptTree(), fetchRoles()])
  deptOptions.value = buildDeptOptions()
  roleOptions.value = roles
}

onMounted(() => {
  loadList()
  loadMeta()
})
</script>

<style scoped lang="less">
.page-card {
  border-radius: 8px;
}

.search-form {
  margin-bottom: 16px;
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

.text-sub {
  opacity: 0.45;
}

.danger-link {
  color: #ff4d4f;
}
</style>
