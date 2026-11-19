<template>
  <div class="templates-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索模板名称 / 编码 / 类型 / 平台"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-tag class="summary-tag">共 {{ list.length }} 个模板</a-tag>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新增模板
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="pageList"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        size="middle"
        :scroll="{ x: 1600 }"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <span class="row-index">{{ (page - 1) * pageSize + index + 1 }}</span>
          </template>
          <template v-else-if="column.key === 'code'">
            <a-typography-text code>{{ record.code }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'name'">
            <div class="template-name">
              <span class="name">{{ record.name }}</span>
              <span class="desc">{{ record.scene }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag color="purple">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'platform'">
            <a-tag :color="platformColor(record.platform)">{{ record.platform }}</a-tag>
          </template>
          <template v-else-if="column.key === 'usedCount'">
            被引用 {{ record.usedCount }} 次
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
            <a-space>
              <a @click="openConfig(record)">配置</a>
              <a @click="openModal(record)">编辑</a>
              <a-popconfirm
                title="确定删除该模板吗？"
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
      :title="editing ? '编辑活动模板' : '新增活动模板'"
      :confirm-loading="submitting"
      width="560px"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="模板编码" name="code">
          <a-input
            v-model:value="form.code"
            :disabled="editing"
            placeholder="如 TPL_NEW_ARRIVAL"
          />
          <span class="form-tip">
            {{ editing ? '模板编码用于活动引用，创建后不可修改' : '大写字母、数字与下划线，创建后不可修改' }}
          </span>
        </a-form-item>
        <a-form-item label="模板名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入模板名称" />
        </a-form-item>
        <a-form-item label="活动类型" name="type">
          <a-select v-model:value="form.type" :options="typeOptions" />
        </a-form-item>
        <a-form-item label="活动平台" name="platform">
          <a-select v-model:value="form.platform" :options="platformOptions" />
          <span class="form-tip">决定模板配置适用的端（如微信小程序 / 抖音App / 小红书）</span>
        </a-form-item>
        <a-form-item label="适用场景" name="scene">
          <a-textarea v-model:value="form.scene" :rows="3" placeholder="请输入适用场景描述" />
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
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  ACTIVITY_PLATFORMS,
  CAMPAIGN_TYPES,
  createCampaignTemplate,
  deleteTemplate,
  fetchCampaignTemplates,
  toggleTemplateStatus,
  updateCampaignTemplate,
  type CampaignTemplate,
} from '@/api/marketing'

const loading = ref(false)
const list = ref<CampaignTemplate[]>([])
const keyword = ref('')
const router = useRouter()

function openConfig(record: CampaignTemplate) {
  router.push(`/marketing/campaign/templates/${record.id}/config`)
}

/* ---------- 分页 ---------- */
const page = ref(1)
const pageSize = ref(5)
const pageList = computed(() => list.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const pagination = computed(() => ({
  current: page.value,
  pageSize: pageSize.value,
  total: list.value.length,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: (total: number) => `共 ${total} 个模板`,
}))

function onTableChange(pag: { current?: number; pageSize?: number }) {
  page.value = pag.current ?? 1
  pageSize.value = pag.pageSize ?? pageSize.value
}

/* ---------- 表格列 ---------- */
const columns = [
  { title: '序号', key: 'index', width: 60 },
  { title: '模板编码', dataIndex: 'code', key: 'code', width: 210 },
  { title: '模板名称 / 适用场景', key: 'name', width: 280 },
  { title: '活动类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '活动平台', dataIndex: 'platform', key: 'platform', width: 120 },
  { title: '引用情况', dataIndex: 'usedCount', key: 'usedCount', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 90 },
  { title: '更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 90 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

const typeOptions = CAMPAIGN_TYPES.map((v) => ({ label: v, value: v }))
const platformOptions = ACTIVITY_PLATFORMS.map((v) => ({ label: v, value: v }))

/** 平台标签配色 */
function platformColor(platform: string): string {
  const map: Record<string, string> = {
    微信小程序: 'green',
    抖音App: 'default',
    小红书: 'red',
    微信H5: 'cyan',
    支付宝小程序: 'blue',
  }
  return map[platform] ?? 'default'
}

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchCampaignTemplates({ keyword: keyword.value || undefined })
    page.value = 1
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  keyword.value = ''
  loadList()
}

async function onToggle(record: CampaignTemplate, checked: boolean) {
  try {
    await toggleTemplateStatus(record.id, checked ? 1 : 0)
    record.status = checked ? 1 : 0
    message.success(checked ? '模板已启用' : '模板已停用')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(id: number) {
  try {
    await deleteTemplate(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

/* ---------- 新增 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const editing = ref(false)
const editingId = ref(0)
const formRef = ref<FormInstance>()
const form = reactive({
  code: '',
  name: '',
  type: CAMPAIGN_TYPES[0],
  platform: ACTIVITY_PLATFORMS[0],
  scene: '',
  status: 1 as 0 | 1,
})

const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '请输入模板编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: '仅支持大写字母、数字与下划线', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型' }],
  platform: [{ required: true, message: '请选择活动平台' }],
  scene: [{ required: true, message: '请输入适用场景描述', trigger: 'blur' }],
}

function resetForm() {
  Object.assign(form, {
    code: '',
    name: '',
    type: CAMPAIGN_TYPES[0],
    platform: ACTIVITY_PLATFORMS[0],
    scene: '',
    status: 1 as 0 | 1,
  })
}

function openCreate() {
  editing.value = false
  editingId.value = 0
  resetForm()
  modalOpen.value = true
  formRef.value?.clearValidate()
}

function openModal(record: CampaignTemplate) {
  editing.value = true
  editingId.value = record.id
  Object.assign(form, {
    code: record.code,
    name: record.name,
    type: record.type,
    platform: record.platform,
    scene: record.scene,
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
    if (editing.value) {
      await updateCampaignTemplate(editingId.value, {
        name: form.name.trim(),
        type: form.type,
        platform: form.platform,
        scene: form.scene.trim(),
        status: form.status,
      })
      message.success('模板更新成功')
    } else {
      await createCampaignTemplate({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        platform: form.platform,
        scene: form.scene.trim(),
        status: form.status,
      })
      message.success('模板创建成功')
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.templates-page {
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

    .summary-tag {
      color: #9254de;
      background: rgba(146, 84, 222, 0.1);
      border-color: rgba(146, 84, 222, 0.3);
    }
  }

  .row-index {
    font-size: 12px;
    color: var(--text-sub);
  }

  .template-name {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .name {
      font-weight: 500;
      color: var(--text-main);
    }

    .desc {
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .text-sub {
    font-size: 12px;
    color: var(--text-sub);
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
