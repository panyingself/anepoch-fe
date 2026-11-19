<template>
  <div class="template-config-page">
    <a-card :bordered="false" class="header-card" :loading="loading">
      <div class="header-body">
        <div class="header-info">
          <div class="header-title">
            模板配置
            <a-tag color="purple" class="template-code">{{ detail?.template.code }}</a-tag>
          </div>
          <div class="header-sub">
            {{ detail?.template.name }}
            <span class="divider" />
            <a-tag class="platform-tag">{{ detail?.template.platform }}</a-tag>
            使用配置模板：{{ detail?.platformTemplate.name }}
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
      :message="`当前按活动平台「${detail?.template.platform ?? ''}」匹配配置模板，保存后将同步生效至该平台下的全部活动模板`"
    />

    <TemplateConfigForm v-if="config" :config="config" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons-vue'
import {
  fetchCampaignTemplateDetail,
  saveConfigTemplate,
  type CampaignTemplate,
  type TemplateConfig,
} from '@/api/marketing'
import TemplateConfigForm from '../components/TemplateConfigForm.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const detail = ref<{
  template: CampaignTemplate
  platformTemplate: { id: number; platform: string; name: string; description: string; config: TemplateConfig; updatedAt: string }
}>()

const config = computed(() => detail.value?.platformTemplate.config)
const templateId = computed(() => Number(route.params.id))

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await fetchCampaignTemplateDetail(templateId.value)
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
    router.replace('/marketing/campaign/templates')
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!config.value || !detail.value) return
  saving.value = true
  try {
    await saveConfigTemplate(detail.value.platformTemplate.id, config.value)
    message.success('配置已保存，已同步至该平台全部活动模板')
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/marketing/campaign/templates')
}

onMounted(loadDetail)
</script>

<style scoped lang="less">
.template-config-page {
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

  .template-code {
    font-size: 12px;
    font-weight: 400;
    color: #9254de;
    background: rgba(146, 84, 222, 0.1);
    border-color: rgba(146, 84, 222, 0.3);
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

    .platform-tag,
    .config-template-name {
      margin-inline-end: 0;
      font-size: 12px;
    }
  }

  .platform-tag {
    color: #9254de;
    background: rgba(146, 84, 222, 0.1);
    border-color: rgba(146, 84, 222, 0.3);
  }

  .tip-alert {
    margin-bottom: 16px;
    border-radius: 10px;
  }
}
</style>
