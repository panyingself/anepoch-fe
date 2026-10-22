<template>
  <div class="dept-page">
    <!-- 左：部门树 -->
    <a-card :bordered="false" class="dept-tree-card">
      <template #title>
        <span class="card-title">组织架构</span>
      </template>
      <template #extra>
        <a-button type="primary" size="small" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          新建组织
        </a-button>
      </template>
      <a-spin :spinning="loading">
        <a-tree
          v-if="tree.length"
          v-model:selectedKeys="selectedKeys"
          :tree-data="tree"
          :field-names="fieldNames"
          block-node
          default-expand-all
        >
          <template #title="node">
            <span class="tree-node">
              <span class="node-name">
                <a-badge :status="node.status === 1 ? 'success' : 'default'" />
                {{ node.name }}
              </span>
              <span class="node-actions" @click.stop>
                <a-tooltip title="新增下级组织">
                  <PlusCircleOutlined @click="openModal(undefined, node)" />
                </a-tooltip>
                <a-tooltip title="添加成员">
                  <UserAddOutlined @click="openMemberModal(node)" />
                </a-tooltip>
                <a-tooltip title="编辑">
                  <EditOutlined @click="openModal(node)" />
                </a-tooltip>
                <a-popconfirm title="确定删除该组织吗？" @confirm="onDelete(node)">
                  <DeleteOutlined class="danger-icon" />
                </a-popconfirm>
              </span>
            </span>
          </template>
        </a-tree>
        <a-empty v-else description="暂无组织数据" />
      </a-spin>
    </a-card>

    <!-- 右：详情 + 下级部门 -->
    <a-card :bordered="false" class="dept-detail-card">
      <template v-if="selected">
        <div class="detail-head">
          <span class="card-title">{{ selected.name }}</span>
          <a-tag :color="selected.status === 1 ? 'success' : 'default'">
            {{ selected.status === 1 ? '启用' : '停用' }}
          </a-tag>
        </div>
        <a-descriptions :column="{ xs: 1, sm: 2 }" bordered size="small" class="detail-desc">
          <a-descriptions-item label="组织编码">{{ selected.code }}</a-descriptions-item>
          <a-descriptions-item label="组织路径">{{ deptPath(selected.id) }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ selected.leader || '—' }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ selected.phone || '—' }}</a-descriptions-item>
          <a-descriptions-item label="排序">{{ selected.sort }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ selected.createdAt }}</a-descriptions-item>
        </a-descriptions>

        <a-tabs v-model:activeKey="activeTab" class="detail-tabs">
          <a-tab-pane key="children" tab="下级组织">
            <div class="sub-toolbar">
              <span class="sub-title">共 {{ selected.children?.length || 0 }} 个</span>
              <a-button size="small" @click="openModal(undefined, selected)">
                <template #icon><PlusOutlined /></template>
                新增下级组织
              </a-button>
            </div>
            <a-table
              :columns="subColumns"
              :data-source="selected.children || []"
              :pagination="false"
              :scroll="{ x: 700 }"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-badge
                    :status="record.status === 1 ? 'success' : 'default'"
                    :text="record.status === 1 ? '启用' : '停用'"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a @click="openModal(record)">编辑</a>
                    <a-popconfirm title="确定删除该组织吗？" @confirm="onDelete(record)">
                      <a class="danger-link">删除</a>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="members" tab="组织成员">
            <div class="sub-toolbar">
              <span class="sub-title">共 {{ members.length }} 人（含下级组织）</span>
              <a-button type="primary" size="small" @click="openMemberModal()">
                <template #icon><UserAddOutlined /></template>
                添加成员
              </a-button>
            </div>
            <a-table
              :columns="memberColumns"
              :data-source="members"
              :loading="membersLoading"
              :pagination="false"
              :scroll="{ x: 700 }"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'deptId'">
                  <span class="dept-path">{{ deptPath(record.deptId) }}</span>
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-badge
                    :status="record.status === 1 ? 'success' : 'default'"
                    :text="record.status === 1 ? '在职' : '离职'"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-popconfirm title="确定移除该成员吗？" @confirm="onDeleteMember(record)">
                    <a class="danger-link">移除</a>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </template>
      <a-empty v-else description="选择左侧组织查看详情" class="detail-empty" />
    </a-card>

    <!-- 新增 / 编辑弹窗 -->
    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑组织' : '新增组织'"
      :confirm-loading="submitting"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-form-item label="上级组织" name="parentId">
          <a-tree-select
            v-model:value="formState.parentId"
            :tree-data="parentOptions"
            :field-names="{ children: 'children', label: 'name', value: 'id' }"
            placeholder="不选择则为顶级部门"
            allow-clear
            tree-default-expand-all
            style="width: 100%"
          />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="组织名称" name="name">
              <a-input v-model:value="formState.name" placeholder="如：技术部" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="组织编码" name="code">
              <a-input v-model:value="formState.code" placeholder="如：TECH" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人" name="leader">
              <a-input v-model:value="formState.leader" placeholder="选填" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone">
              <a-input v-model:value="formState.phone" placeholder="选填" />
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

    <!-- 添加成员弹窗：任意组织节点下直接添加 -->
    <a-modal
      v-model:open="memberModalOpen"
      :title="`添加成员 - ${memberTarget?.name || ''}`"
      :confirm-loading="memberSubmitting"
      :mask-closable="false"
      @ok="handleMemberSubmit"
    >
      <a-form ref="memberFormRef" :model="memberForm" :rules="memberRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="memberForm.name" placeholder="成员姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职位" name="position">
              <a-input v-model:value="memberForm.position" placeholder="如：前端工程师" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone">
              <a-input v-model:value="memberForm.phone" placeholder="选填" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="memberForm.email" placeholder="选填" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-radio-group v-model:value="memberForm.status">
                <a-radio :value="1">在职</a-radio>
                <a-radio :value="0">离职</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons-vue'
import {
  fetchDeptTree,
  createDept,
  updateDept,
  deleteDept,
  buildDeptOptions,
  flattenDeptNames,
  fetchDeptMembers,
  createDeptMember,
  deleteDeptMember,
} from '@/api/admin/dept'
import type { DeptNode, DeptPayload, DeptOption, DeptMember } from '@/api/admin/dept'

const fieldNames = { children: 'children', title: 'name', key: 'id' }

const loading = ref(true)
const tree = ref<DeptNode[]>([])
const selected = ref<DeptNode | null>(null)
const selectedKeys = ref<number[]>([])
const nameMap = ref<Record<number, string>>({})

const subColumns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 110, ellipsis: true },
  { title: '编码', dataIndex: 'code', key: 'code', width: 140, ellipsis: true },
  { title: '负责人', dataIndex: 'leader', key: 'leader', width: 80 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 55 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 75 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
  { title: '操作', key: 'action', width: 90 },
]

function findNode(nodes: DeptNode[], id: number): DeptNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const hit = node.children && findNode(node.children, id)
    if (hit) return hit
  }
  return undefined
}

/** 左树选中 → 右侧详情与下级列表联动 */
watch(selectedKeys, (keys) => {
  const id = keys[0]
  if (id != null) {
    selected.value = findNode(tree.value, id) || selected.value
  }
})

function deptPath(id: number): string {
  return nameMap.value[id] || '—'
}

async function loadTree(keepSelection = true) {
  loading.value = true
  try {
    tree.value = await fetchDeptTree()
    nameMap.value = flattenDeptNames()
    if (keepSelection && selected.value) {
      selected.value = findNode(tree.value, selected.value.id) || null
    }
    if (!selected.value && tree.value.length) {
      selected.value = tree.value[0]
    }
    if (selected.value) {
      selectedKeys.value = [selected.value.id]
    }
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

const formState = reactive<DeptPayload>({
  id: undefined,
  parentId: null,
  name: '',
  code: '',
  leader: '',
  phone: '',
  sort: 1,
  status: 1,
})

const parentOptions = computed<DeptOption[]>(() =>
  buildDeptOptions(editing.value ? formState.id : undefined),
)

const rules = {
  name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入组织编码', trigger: 'blur' }],
}

function openModal(record?: DeptNode, parent?: DeptNode) {
  editing.value = !!record
  Object.assign(formState, {
    id: record?.id,
    parentId: record ? record.parentId : parent?.id ?? null,
    name: record?.name || '',
    code: record?.code || '',
    leader: record?.leader || '',
    phone: record?.phone || '',
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
      await updateDept({ ...formState })
      message.success('更新成功')
    } else {
      await createDept({ ...formState })
      message.success('创建成功')
    }
    modalOpen.value = false
    loadTree()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete(record: DeptNode) {
  try {
    await deleteDept(record.id)
    message.success('删除成功')
    if (selected.value?.id === record.id) {
      selected.value = null
    }
    loadTree(false)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

// ---------- 组织成员：选中组织即联动加载，可任意节点直接添加 ----------
const activeTab = ref<'children' | 'members'>('children')
const members = ref<DeptMember[]>([])
const membersLoading = ref(false)
const memberModalOpen = ref(false)
const memberSubmitting = ref(false)
const memberTarget = ref<DeptNode | null>(null)
const memberFormRef = ref<FormInstance>()
const memberForm = reactive({ name: '', position: '', phone: '', email: '', status: 1 as 0 | 1 })

const memberRules = {
  name: [{ required: true, message: '请输入成员姓名', trigger: 'blur' }],
  phone: [{ pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }],
  email: [{ type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' }],
}

const memberColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 95 },
  { title: '职位', dataIndex: 'position', key: 'position', width: 85 },
  { title: '所属组织', dataIndex: 'deptId', key: 'deptId', width: 190 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 110 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 105, ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 60 },
  { title: '操作', key: 'action', width: 55 },
]

/** 收集当前组织及全部下级组织 id（递归） */
function collectDeptIds(node: DeptNode): number[] {
  return [node.id, ...(node.children ?? []).flatMap(collectDeptIds)]
}

async function loadMembers() {
  const target = selected.value
  if (!target) {
    members.value = []
    return
  }
  membersLoading.value = true
  try {
    // 组织成员需包含递归子集：并行拉取当前组织及所有下级组织的成员后合并
    const groups = await Promise.all(collectDeptIds(target).map((id) => fetchDeptMembers(id)))
    // 快速切换组织时丢弃过期响应
    if (selected.value?.id !== target.id) return
    members.value = groups.flat()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '成员加载失败')
  } finally {
    if (selected.value?.id === target.id) membersLoading.value = false
  }
}

watch(selected, () => loadMembers())

function openMemberModal(node?: DeptNode) {
  memberTarget.value = node || selected.value
  if (!memberTarget.value) return
  Object.assign(memberForm, { name: '', position: '', phone: '', email: '', status: 1 })
  memberModalOpen.value = true
  memberFormRef.value?.clearValidate()
}

async function handleMemberSubmit() {
  try {
    await memberFormRef.value?.validate()
  } catch {
    return
  }
  if (!memberTarget.value) return
  memberSubmitting.value = true
  try {
    await createDeptMember({ ...memberForm, deptId: memberTarget.value.id })
    message.success('成员已添加')
    memberModalOpen.value = false
    // 目标组织在当前选中组织的子树内时刷新（成员列表含下级组织成员）
    if (selected.value && collectDeptIds(selected.value).includes(memberTarget.value.id)) {
      loadMembers()
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    memberSubmitting.value = false
  }
}

async function onDeleteMember(record: DeptMember) {
  try {
    await deleteDeptMember(record.id)
    message.success('已移除')
    loadMembers()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '移除失败')
  }
}

onMounted(() => loadTree(false))
</script>

<style scoped lang="less">
.dept-page {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.dept-tree-card {
  width: 250px;
  flex-shrink: 0;
}

.dept-detail-card {
  flex: 1;
  min-width: 0;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 4px;

  .node-name {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 4px;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--text-main);
  }

  .node-actions {
    display: none;
    flex-shrink: 0;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--icon-color, rgba(0, 0, 0, 0.65));

    .anticon {
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--icon-hover, #1677ff);
      }

      &.danger-icon:hover {
        color: #ff4d4f;
      }
    }
  }

  &:hover .node-actions {
    display: inline-flex;
  }
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-desc {
  margin-bottom: 20px;
}

.sub-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .sub-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
  }
}

.detail-empty {
  margin-top: 80px;
}

.danger-link {
  color: #ff4d4f;
}

/* 成员所属组织层级路径 */
.dept-path {
  color: var(--text-main);
  opacity: 0.85;
}

@media (max-width: 900px) {
  .dept-page {
    flex-direction: column;
  }

  .dept-tree-card {
    width: 100%;
  }
}
</style>
