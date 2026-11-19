<template>
  <div class="activity-materials-page">
    <a-card :bordered="false" class="header-card">
      <div class="header-body">
        <div class="header-info">
          <div class="header-title">活动物料管理</div>
          <div class="header-sub">
            为活动配置发放的兑换券、折扣券与积分，保存后活动按所配置的数量发放
          </div>
        </div>
        <div class="header-actions">
          <a-select
            v-if="!locked"
            v-model:value="selectedId"
            class="campaign-select"
            placeholder="请选择活动"
            :options="campaignOptions"
            show-search
            option-filter-prop="label"
            @change="onCampaignChange"
          />
          <a-button @click="goBack">
            <template #icon><ArrowLeftOutlined /></template>
            返回活动列表
          </a-button>
          <a-button type="primary" :disabled="!selectedId" @click="openCreate">
            <template #icon><PlusOutlined /></template>
            新增物料
          </a-button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <div v-if="currentCampaign" class="campaign-bar">
        <div class="campaign-info">
          <span class="campaign-name">{{ currentCampaign.name }}</span>
          <a-tag :color="STATUS_MAP[currentCampaign.status].color">
            {{ STATUS_MAP[currentCampaign.status].label }}
          </a-tag>
          <span class="divider" />
          <span class="campaign-meta">{{ currentCampaign.startAt }} ~ {{ currentCampaign.endAt }}</span>
        </div>
        <a-tag color="purple" class="count-tag">已关联 {{ materials.length }} 项物料</a-tag>
      </div>

      <a-empty v-if="!selectedId" :description="emptyText" />

      <a-table
        v-else
        :columns="columns"
        :data-source="materials"
        :loading="loading"
        :pagination="false"
        row-key="key"
        size="middle"
        :scroll="{ x: 940 }"
        :locale="{ emptyText: '该活动尚未关联物料，点击右上角「新增物料」开始配置' }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <span class="row-index">{{ index + 1 }}</span>
          </template>
          <template v-else-if="column.key === 'kind'">
            <a-tag :color="kindColor(record.kind)">{{ kindLabel(record.kind) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="material-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'quantity'">
            <span class="qty-text">{{ record.quantity.toLocaleString() }} {{ kindUnit(record.kind) }}</span>
          </template>
          <template v-else-if="column.key === 'stock'">
            <span v-if="stockText(record.key)" class="text-sub">{{ stockText(record.key) }}</span>
            <span v-else class="text-sub">不限库存</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openEdit(record)">编辑</a>
              <a-popconfirm
                title="确定移除该物料吗？移除后该活动将不再发放此物料。"
                ok-text="移除"
                cancel-text="取消"
                @confirm="onDelete(record.key)"
              >
                <a class="danger-link">移除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="editingKey ? '编辑活动物料' : '新增活动物料'"
      width="560px"
      :confirm-loading="submitting"
      @ok="handleSubmit"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="物料类别" required>
          <a-select v-model:value="form.kind" :options="kindOptions" @change="onKindChange" />
        </a-form-item>
        <a-form-item label="具体物料" required>
          <a-select
            v-model:value="form.key"
            :options="formOptions"
            :placeholder="formOptions.length ? '请选择具体物料' : '该类别下暂无可选物料'"
            show-search
            option-filter-prop="label"
          />
        </a-form-item>
        <a-form-item label="发放数量" required>
          <a-input-number v-model:value="form.quantity" :min="1" :step="100" style="width: 100%" />
          <span class="form-tip">
            {{ form.kind === 'points' ? '本活动计划发放的积分数' : '本活动计划发放的券数量，不得超过物料剩余库存' }}
          </span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons-vue'
import {
  fetchCampaignMaterials,
  fetchCampaigns,
  fetchMaterialOptions,
  saveCampaignMaterials,
  type Campaign,
  type CampaignMaterialLink,
  type CampaignStatus,
  type MaterialOption,
} from '@/api/marketing'

const STATUS_MAP: Record<CampaignStatus, { label: string; color: string }> = {
  running: { label: '进行中', color: 'green' },
  pending: { label: '待开始', color: 'blue' },
  ended: { label: '已结束', color: 'default' },
}

const route = useRoute()
const router = useRouter()

const campaigns = ref<Campaign[]>([])
/** 当前操作的活动：由活动列表带入时锁定，菜单进入时通过下拉筛选 */
const selectedId = ref<number>(0)
/** 由活动列表带入时锁定该活动；从左侧菜单进入时可自行筛选活动 */
const locked = ref(false)
const materials = ref<CampaignMaterialLink[]>([])
const options = ref<MaterialOption[]>([])
const loading = ref(false)

const columns = [
  { title: '序号', key: 'index', width: 60 },
  { title: '物料类别', key: 'kind', width: 110 },
  { title: '物料名称', key: 'name', width: 300 },
  { title: '发放数量', key: 'quantity', width: 160 },
  { title: '库存情况', key: 'stock', width: 160 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

const kindOptions = [
  { label: '兑换券', value: 'exchange' },
  { label: '折扣券', value: 'discount' },
  { label: '积分', value: 'points' },
]

const currentCampaign = computed(() => campaigns.value.find((c) => c.id === selectedId.value))

const campaignOptions = computed(() =>
  campaigns.value.map((c) => ({
    label: `${c.name}（${STATUS_MAP[c.status].label}）`,
    value: c.id,
  })),
)

const emptyText = computed(() => {
  if (locked.value) return '未找到该活动，可能已被删除，请从活动列表重新进入'
  return '请先筛选需要配置物料的活动'
})

function kindLabel(kind: CampaignMaterialLink['kind']): string {
  if (kind === 'exchange') return '兑换券'
  if (kind === 'discount') return '折扣券'
  return '积分'
}

function kindColor(kind: CampaignMaterialLink['kind']): string {
  if (kind === 'exchange') return 'green'
  if (kind === 'discount') return 'orange'
  return 'blue'
}

function kindUnit(kind: CampaignMaterialLink['kind']): string {
  return kind === 'points' ? '分' : '张'
}

function optionOf(key: string): MaterialOption | undefined {
  return options.value.find((o) => o.key === key)
}

function stockText(key: string): string {
  const option = optionOf(key)
  if (!option || option.remaining === null) return ''
  return `剩余 ${option.remaining.toLocaleString()} ${kindUnit(option.kind)}`
}

async function loadCampaigns() {
  try {
    campaigns.value = await fetchCampaigns()
    const fromQuery = Number(route.query.campaignId)
    if (fromQuery && campaigns.value.some((c) => c.id === fromQuery)) {
      locked.value = true
      selectedId.value = fromQuery
      await loadMaterials()
    } else if (fromQuery) {
      locked.value = true
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '活动加载失败')
  }
}

async function loadMaterials() {
  if (!selectedId.value) return
  loading.value = true
  try {
    materials.value = await fetchCampaignMaterials(selectedId.value)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '物料加载失败')
  } finally {
    loading.value = false
  }
}

function onCampaignChange() {
  materials.value = []
  loadMaterials()
}

function goBack() {
  router.push('/marketing/campaign/list')
}

/* ---------- 新增 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const editingKey = ref('')
const form = reactive<{ kind: CampaignMaterialLink['kind']; key?: string; quantity: number }>({
  kind: 'exchange',
  key: undefined,
  quantity: 1000,
})

const formOptions = computed(() =>
  options.value
    .filter((o) => o.kind === form.kind)
    .filter((o) => o.key === editingKey.value || !materials.value.some((m) => m.key === o.key))
    .map((o) => ({ label: `${o.name}${o.remaining !== null ? `（剩余 ${o.remaining}）` : ''}`, value: o.key })),
)

function onKindChange() {
  if (form.key && optionOf(form.key)?.kind === form.kind) return
  form.key = undefined
}

function openCreate() {
  editingKey.value = ''
  Object.assign(form, { kind: 'exchange', key: undefined, quantity: 1000 })
  modalOpen.value = true
}

function openEdit(record: CampaignMaterialLink) {
  editingKey.value = record.key
  Object.assign(form, { kind: record.kind, key: record.key, quantity: record.quantity })
  modalOpen.value = true
}

async function persist(next: CampaignMaterialLink[], successText: string) {
  submitting.value = true
  try {
    await saveCampaignMaterials(selectedId.value!, next)
    materials.value = next
    message.success(successText)
    modalOpen.value = false
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

async function handleSubmit() {
  if (!form.key) {
    message.warning('请选择具体物料')
    return
  }
  if (!form.quantity || form.quantity <= 0) {
    message.warning('发放数量需大于 0')
    return
  }
  const option = optionOf(form.key)
  if (!option) {
    message.warning('物料不存在，请重新选择')
    return
  }
  const link: CampaignMaterialLink = {
    key: option.key,
    kind: option.kind,
    materialId: option.materialId,
    name: option.name,
    quantity: form.quantity,
  }

  if (editingKey.value) {
    const next = materials.value.map((m) => (m.key === editingKey.value ? link : m))
    await persist(next, '物料已更新')
  } else {
    if (materials.value.some((m) => m.key === link.key)) {
      message.warning('该物料已关联，请勿重复添加')
      return
    }
    await persist([...materials.value, link], '物料已新增')
  }
}

async function onDelete(key: string) {
  const next = materials.value.filter((m) => m.key !== key)
  await persist(next, '物料已移除')
}

onMounted(async () => {
  await Promise.all([loadCampaigns(), fetchMaterialOptions().then((list) => (options.value = list))])
})
</script>

<style scoped lang="less">
.activity-materials-page {
  .header-card {
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .header-body {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  .header-info {
    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-main);
    }

    .header-sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;

    .campaign-select {
      width: 280px;
    }
  }

  .table-card {
    border-radius: 12px;
  }

  .campaign-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.14);
  }

  .campaign-info {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;

    .campaign-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .divider {
      width: 1px;
      height: 10px;
      background: rgba(128, 128, 128, 0.3);
    }

    .campaign-meta {
      font-size: 12px;
      color: var(--text-sub);
    }
  }

  .count-tag {
    margin-inline-end: 0;
  }

  .row-index {
    font-size: 12px;
    color: var(--text-sub);
  }

  .material-name {
    font-weight: 500;
    color: var(--text-main);
  }

  .qty-text {
    color: var(--text-main);
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
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-sub);
  }
}
</style>
