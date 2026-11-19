<template>
  <div class="coupon-page">
    <a-card :bordered="false" class="table-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="keyword"
          :placeholder="`搜索${title}名称`"
          class="filter-input"
          allow-clear
          @search="loadList"
        />
        <a-button @click="resetQuery">重置</a-button>
        <div class="filter-spacer" />
        <a-button type="primary" @click="openModal">
          <template #icon><PlusOutlined /></template>
          新建{{ title }}
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
        :scroll="{ x: 1190 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="coupon-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'value'">
            <span class="coupon-value">{{ formatValue(record) }}</span>
            <span class="text-sub">
              {{ record.threshold ? `满 ${record.threshold} 可用` : '无门槛' }}
            </span>
          </template>
          <template v-else-if="column.key === 'stock'">
            <div class="stock-cell">
              <span>{{ record.claimed.toLocaleString() }} / {{ record.total.toLocaleString() }}</span>
              <div class="stock-track">
                <div class="stock-fill" :style="{ width: `${stockPercent(record)}%` }" />
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'validPeriod'">
            <span class="text-sub">{{ record.validFrom }} ~ {{ record.validUntil }}</span>
          </template>
          <template v-else-if="column.key === 'usage'">
            <a-tooltip v-if="usageOf(record).length" :title="usageOf(record).join('、')">
              <a-tag color="purple">{{ usageOf(record).length }} 个未结束活动</a-tag>
            </a-tooltip>
            <span v-else class="text-sub">未关联</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-popconfirm
              :title="`确定${record.status === 1 ? '停用' : '启用'}「${record.name}」吗？`"
              :ok-text="record.status === 1 ? '确定停用' : '确定启用'"
              cancel-text="取消"
              @confirm="onToggle(record, record.status !== 1)"
            >
              <a-switch
                :checked="record.status === 1"
                checked-children="启用"
                un-checked-children="停用"
              />
            </a-popconfirm>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="openEdit(record)">编辑</a>
              <a @click="openStock(record)">库存设置</a>
              <a-popconfirm
                :title="`确定删除该${title}吗？`"
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
      :title="editingId ? `编辑${title}` : `新建${title}`"
      :confirm-loading="submitting"
      width="520px"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="名称" name="name">
          <a-input v-model:value="form.name" :placeholder="`请输入${title}名称`" />
        </a-form-item>
        <a-form-item :label="props.kind === 'exchange' ? '面额（元）' : '折扣（折）'" name="value">
          <a-input-number v-model:value="form.value" :min="1" :max="props.kind === 'exchange' ? 9999 : 9.9" :step="props.kind === 'exchange' ? 10 : 0.5" style="width: 100%" />
        </a-form-item>
        <a-form-item label="使用门槛" name="threshold">
          <a-input-number v-model:value="form.threshold" :min="0" :step="100" style="width: 100%" />
        </a-form-item>
        <a-form-item v-if="!editingId" label="发放总量" name="total">
          <a-input-number v-model:value="form.total" :min="1" :step="1000" style="width: 100%" />
        </a-form-item>
        <a-form-item v-else label="发放总量">
          <span class="stock-readonly">{{ editingTotal.toLocaleString() }} 张</span>
          <span class="form-tip stock-form-tip">库存不可在此修改，请使用操作列「库存设置」调整</span>
        </a-form-item>
        <a-form-item label="有效期" name="validRange">
          <a-range-picker v-model:value="form.validRange" value-format="YYYY-MM-DD" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="stockOpen"
      title="库存设置"
      width="460px"
      ok-text="保存库存"
      :confirm-loading="stockSaving"
      @ok="saveStock"
    >
      <div class="stock-modal">
        <div class="stock-modal-material">{{ stockTarget?.name }}</div>
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="已领取">
            <span class="stock-modal-claimed">
              {{ stockTarget?.claimed.toLocaleString() }} 张
            </span>
          </a-form-item>
          <a-form-item label="库存总量" required>
            <a-input-number
              v-model:value="stockTotal"
              :min="1"
              :step="1000"
              style="width: 100%"
            />
          </a-form-item>
        </a-form>
        <a-alert
          type="info"
          show-icon
          :message="`库存总量不可低于已领取数量（${stockTarget?.claimed.toLocaleString() ?? 0}），调整后剩余可发放数量 = 库存总量 - 已领取`"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  activeCampaignsUsingMaterial,
  createMaterialCoupon,
  deleteMaterialCoupon,
  fetchMaterialCoupons,
  toggleMaterialCoupon,
  updateMaterialCoupon,
  updateMaterialStock,
  type MaterialCoupon,
  type MaterialKind,
} from '@/api/marketing'

const props = defineProps<{ kind: MaterialKind }>()

const title = computed(() => (props.kind === 'exchange' ? '兑换券' : '折扣券'))

const loading = ref(false)
const list = ref<MaterialCoupon[]>([])
const keyword = ref('')

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '面额 / 门槛', key: 'value', width: 190 },
  { title: '领取 / 总量', key: 'stock', width: 190 },
  { title: '有效期', key: 'validPeriod', width: 200 },
  { title: '关联活动', key: 'usage', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '操作', key: 'action', width: 240, fixed: 'right' as const },
]

const formatValue = (c: MaterialCoupon) =>
  c.kind === 'exchange' ? `¥${c.value}` : `${c.value} 折`
const stockPercent = (c: MaterialCoupon) =>
  c.total ? Math.min(Math.round((c.claimed / c.total) * 100), 100) : 0
/** 当前物料被未结束活动引用的情况 */
const usageOf = (c: MaterialCoupon) => activeCampaignsUsingMaterial(c.kind, c.id)

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchMaterialCoupons({ kind: props.kind, keyword: keyword.value || undefined })
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

/* ---------- 新建 / 编辑 ---------- */
const modalOpen = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref(0)
const editingTotal = ref(0)
const editingStatus = ref<0 | 1>(1)
const form = reactive({
  name: '',
  value: props.kind === 'exchange' ? 20 : 9,
  threshold: 0,
  total: 10000,
  validRange: undefined as string[] | undefined,
})

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入面额/折扣' }],
  total: [{ required: true, message: '请输入发放总量' }],
  validRange: [{ required: true, message: '请选择有效期时间范围', trigger: 'change' }],
}

function openModal() {
  editingId.value = 0
  editingTotal.value = 0
  Object.assign(form, {
    name: '',
    value: props.kind === 'exchange' ? 20 : 9,
    threshold: 0,
    total: 10000,
    validRange: undefined,
  })
  modalOpen.value = true
  formRef.value?.clearValidate()
}

function openEdit(record: MaterialCoupon) {
  editingId.value = record.id
  editingTotal.value = record.total
  editingStatus.value = record.status
  Object.assign(form, {
    name: record.name,
    value: record.value,
    threshold: record.threshold,
    total: record.total,
    validRange: [record.validFrom, record.validUntil],
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
  if (!form.validRange?.[0] || !form.validRange?.[1]) {
    message.error('请选择有效期时间范围')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateMaterialCoupon(editingId.value, {
        name: form.name.trim(),
        value: form.value,
        threshold: form.threshold,
        validFrom: form.validRange[0],
        validUntil: form.validRange[1],
        status: editingStatus.value,
      })
      message.success('保存成功')
    } else {
      await createMaterialCoupon({
        kind: props.kind,
        name: form.name.trim(),
        value: form.value,
        threshold: form.threshold,
        total: form.total,
        claimed: 0,
        validFrom: form.validRange[0],
        validUntil: form.validRange[1],
        status: 1,
      })
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

async function onToggle(record: MaterialCoupon, checked: boolean) {
  try {
    await toggleMaterialCoupon(record.id, checked ? 1 : 0)
    record.status = checked ? 1 : 0
    message.success(checked ? '已启用' : '已停用')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '操作失败')
  }
}

async function onDelete(id: number) {
  try {
    await deleteMaterialCoupon(id)
    message.success('删除成功')
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

/* ---------- 库存设置 ---------- */
const stockOpen = ref(false)
const stockSaving = ref(false)
const stockTarget = ref<MaterialCoupon>()
const stockTotal = ref(0)

function openStock(record: MaterialCoupon) {
  stockTarget.value = record
  stockTotal.value = record.total
  stockOpen.value = true
}

async function saveStock() {
  const target = stockTarget.value
  if (!target) return
  if (!stockTotal.value || stockTotal.value <= 0) {
    message.error('库存总量需大于 0')
    return
  }
  if (stockTotal.value < target.claimed) {
    message.error(`库存总量不能小于已领取数量（${target.claimed}）`)
    return
  }
  stockSaving.value = true
  try {
    await updateMaterialStock(target.id, stockTotal.value)
    message.success('库存已更新')
    stockOpen.value = false
    loadList()
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    stockSaving.value = false
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.coupon-page {
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
  }

  .coupon-name {
    font-weight: 500;
    color: var(--text-main);
  }

  .coupon-value {
    margin-right: 8px;
    font-weight: 600;
    color: #9254de;
  }

  .text-sub {
    font-size: 12px;
    color: var(--text-sub);
  }

  .stock-cell {
    .stock-track {
      height: 4px;
      margin-top: 6px;
      overflow: hidden;
      background: rgba(146, 84, 222, 0.12);
      border-radius: 999px;

      .stock-fill {
        height: 100%;
        background: linear-gradient(90deg, #722ed1, #b37feb);
        border-radius: 999px;
      }
    }
  }

  .danger-link {
    color: #ff7875;
  }
}
</style>

<!-- 库存设置弹窗挂载到 body，使用独立全局样式 -->
<style lang="less">
.stock-modal {
  .stock-modal-material {
    padding: 12px 16px;
    margin-bottom: 18px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    background: rgba(146, 84, 222, 0.06);
    border: 1px solid rgba(146, 84, 222, 0.16);
    border-radius: 10px;
  }

  .stock-modal-claimed {
    color: var(--text-sub);
  }

  .ant-alert {
    margin-top: 4px;
    border-radius: 8px;
  }
}

/* 编辑弹窗内只读库存与提示（弹窗挂载到 body，需全局样式） */
.stock-readonly {
  margin-right: 10px;
  font-weight: 500;
  color: var(--text-main);
}

.stock-form-tip {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-sub);
}
</style>
