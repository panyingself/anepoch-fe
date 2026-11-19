<template>
  <div class="config-templates-page">
    <a-card :bordered="false" class="table-card">
      <div class="page-head">
        <div class="page-intro">
          <div class="intro-title">活动配置模板</div>
          <div class="intro-desc">
            按活动平台维护统一的页面配置（游戏互动页、规则弹窗、领奖中心、异常提示、中奖弹窗、分享），同平台的活动模板共用一套配置。
          </div>
        </div>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新增模板
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
        :scroll="{ x: 1080 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <span class="row-index">{{ index + 1 }}</span>
          </template>
          <template v-else-if="column.key === 'name'">
            <div class="name-cell">
              <span class="name">
                {{ record.name }}
                <a-tag v-if="!record.builtin" class="custom-tag">自定义</a-tag>
              </span>
              <span class="desc">{{ record.description }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'platform'">
            <a-tag :color="platformColor(record.platform)">{{ record.platform }}</a-tag>
          </template>
          <template v-else-if="column.key === 'itemCount'">
            {{ record.itemCount }} 项
          </template>
          <template v-else-if="column.key === 'templateCount'">
            {{ record.templateCount }} 个
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="record.status === 1 ? 'success' : 'default'"
              :text="record.status === 1 ? '已启用' : '已停用'"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openConfig(record)">配置</a>
              <a @click="openEdit(record)">编辑</a>
              <a-popconfirm
                v-if="!record.builtin"
                title="确定删除该配置模板吗？删除后不可恢复。"
                ok-text="删除"
                cancel-text="取消"
                @confirm="onDelete(record)"
              >
                <a class="danger-link">删除</a>
              </a-popconfirm>
              <a-tooltip v-else title="内置配置模板不可删除">
                <span class="disabled-link">删除</span>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑活动配置模板' : '新增活动配置模板'"
      :confirm-loading="submitting"
      width="560px"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="适用平台" name="platform">
          <a-select
            v-model:value="form.platform"
            :options="platformOptions"
            :disabled="editing"
            @change="onPlatformChange"
          />
          <span v-if="editing" class="form-tip">已创建的配置模板不可更换适用平台</span>
        </a-form-item>
        <a-form-item label="模板名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入配置模板名称" @input="nameTouched = true" />
          <span class="form-tip">同一平台下模板名称不可重复</span>
        </a-form-item>
        <a-form-item label="模板说明" name="description">
          <a-textarea v-model:value="form.description" :rows="3" placeholder="选填，说明该模板的适用场景" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <a-alert
        class="modal-tip"
        type="info"
        show-icon
        message="新增后配置模板默认为空配置，可在「配置」中维护 6 项页面配置"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  ACTIVITY_PLATFORMS,
  createConfigTemplate,
  deleteConfigTemplate,
  fetchPlatformConfigTemplates,
  platformConfigTemplateName,
  updateConfigTemplate,
  type PlatformConfigTemplate,
} from '@/api/marketing'

const router = useRouter()
const loading = ref(false)
const list = ref<PlatformConfigTemplate[]>([])

const columns = [
  { title: '序号', key: 'index', width: 60 },
  { title: '配置模板名称 / 说明', key: 'name', width: 380 },
  { title: '适用平台', dataIndex: 'platform', key: 'platform', width: 120 },
  { title: '配置项', dataIndex: 'itemCount', key: 'itemCount', width: 90 },
  { title: '关联活动模板', dataIndex: 'templateCount', key: 'templateCount', width: 130 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
  { title: '操作', key: 'action', width: 190, fixed: 'right' as const },
]

const platformOptions = ACTIVITY_PLATFORMS.map((v) => ({ label: v, value: v }))

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
    list.value = await fetchPlatformConfigTemplates()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function openConfig(record: PlatformConfigTemplate) {
  router.push(`/marketing/campaign/config-templates/${record.id}`)
}

/* ---------- 新增 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const editing = ref(false)
const editingId = ref(0)
const formRef = ref<FormInstance>()
const nameTouched = ref(false)
const form = reactive({
  platform: ACTIVITY_PLATFORMS[0],
  name: `${ACTIVITY_PLATFORMS[0]}活动配置模板-自定义`,
  description: '',
  status: 1 as 0 | 1,
})

const rules: Record<string, Rule[]> = {
  platform: [{ required: true, message: '请选择适用平台' }],
  name: [{ required: true, message: '请输入配置模板名称', trigger: 'blur' }],
}

function onPlatformChange(platform: string) {
  if (nameTouched.value) return
  form.name = `${platform}活动配置模板-自定义`
}

function openCreate() {
  editing.value = false
  editingId.value = 0
  Object.assign(form, {
    platform: ACTIVITY_PLATFORMS[0],
    name: `${ACTIVITY_PLATFORMS[0]}活动配置模板-自定义`,
    description: '',
    status: 1 as 0 | 1,
  })
  nameTouched.value = false
  modalOpen.value = true
  formRef.value?.clearValidate()
}

function openEdit(record: PlatformConfigTemplate) {
  editing.value = true
  editingId.value = record.id
  Object.assign(form, {
    platform: record.platform,
    name: record.name,
    description: record.description,
    status: record.status,
  })
  nameTouched.value = true
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
      await updateConfigTemplate(editingId.value, {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
      })
      message.success('配置模板更新成功')
    } else {
      const defaultName = platformConfigTemplateName(form.platform)
      await createConfigTemplate({
        platform: form.platform,
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
      })
      message.success(
        form.name.trim() === defaultName
          ? '配置模板创建成功'
          : `配置模板「${form.name.trim()}」创建成功`,
      )
    }
    modalOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete(record: PlatformConfigTemplate) {
  try {
    await deleteConfigTemplate(record.id)
    message.success('配置模板已删除')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.config-templates-page {
  .table-card {
    border-radius: 12px;
  }

  .page-head {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
    padding: 4px 2px 16px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.14);
  }

  .page-intro {
    flex: 1;
    min-width: 260px;

    .intro-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .intro-desc {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.7;
      color: var(--text-sub);
    }
  }

  .row-index {
    font-size: 12px;
    color: var(--text-sub);
  }

  .name-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .name {
      display: flex;
      gap: 6px;
      align-items: center;
      font-weight: 500;
      color: var(--text-main);
    }

    .custom-tag {
      font-size: 11px;
      color: #9254de;
      background: rgba(146, 84, 222, 0.1);
      border-color: rgba(146, 84, 222, 0.3);
    }

    .desc {
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .form-tip {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-sub);
  }

  .danger-link {
    color: #ff7875;
  }

  .disabled-link {
    color: var(--text-sub);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .modal-tip {
    margin-top: 4px;
    border-radius: 8px;
  }
}
</style>
