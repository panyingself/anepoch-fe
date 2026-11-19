<template>
  <div class="config-template-edit-page">
    <a-card :bordered="false" class="header-card" :loading="loading">
      <div class="header-body">
        <div class="header-info">
          <div class="header-title">
            {{ detail?.name || '活动配置模板' }}
            <a-tag :color="platformColor(detail?.platform)" class="platform-tag">
              {{ detail?.platform }}
            </a-tag>
            <a-tag v-if="detail?.builtin" class="builtin-tag">内置</a-tag>
          </div>
          <div class="header-sub">
            {{ detail?.description }}
            <span class="divider" />
            更新时间：{{ detail?.updatedAt }}
          </div>
        </div>
        <a-space>
          <a-button @click="goBack">
            <template #icon><ArrowLeftOutlined /></template>
            返回列表
          </a-button>
          <a-button type="primary" :loading="saving" @click="onSave">
            <template #icon><SaveOutlined /></template>
            保存配置
          </a-button>
        </a-space>
      </div>
    </a-card>

    <a-alert
      class="tip-alert"
      type="info"
      show-icon
      :message="`当前为「${detail?.platform ?? ''}」平台的活动配置模板，保存后用于该平台下的活动模板`"
    />

    <TemplateConfigForm v-if="config" :config="config" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { fetchConfigTemplateById, saveConfigTemplate, type TemplateConfig } from '@/api/marketing'
import TemplateConfigForm from '../components/TemplateConfigForm.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const detail = ref<{
  id: number
  platform: string
  name: string
  description: string
  status: 0 | 1
  config: TemplateConfig
  updatedAt: string
  builtin: boolean
}>()

const config = computed(() => detail.value?.config)
const configId = computed(() => Number(route.params.id))

function platformColor(p?: string): string {
  const map: Record<string, string> = {
    微信小程序: 'green',
    抖音App: 'default',
    小红书: 'red',
    微信H5: 'cyan',
    支付宝小程序: 'blue',
  }
  return (p && map[p]) || 'purple'
}

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await fetchConfigTemplateById(configId.value)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
    router.replace('/marketing/campaign/config-templates')
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!config.value) return
  saving.value = true
  try {
    await saveConfigTemplate(configId.value, config.value)
    detail.value = await fetchConfigTemplateById(configId.value)
    message.success('配置模板已保存')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/marketing/campaign/config-templates')
}

onMounted(loadDetail)
</script>

<style scoped lang="less">
.config-template-edit-page {
  .header-card {
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .header-body {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .header-title {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-main);
  }

  .platform-tag,
  .builtin-tag {
    margin-inline-end: 0;
    font-size: 12px;
    font-weight: 400;
  }

  .builtin-tag {
    color: var(--text-sub);
  }

  .header-sub {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-sub);

    .divider {
      width: 1px;
      height: 10px;
      background: rgba(128, 128, 128, 0.3);
    }
  }

  .tip-alert {
    margin-bottom: 16px;
    border-radius: 10px;
  }
}
</style>
