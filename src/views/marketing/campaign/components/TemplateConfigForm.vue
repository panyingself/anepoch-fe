<template>
  <a-card :bordered="false" class="config-tabs-card">
    <a-tabs v-model:activeKey="activeTab" class="config-tabs">
      <!-- 游戏互动页配置 -->
      <a-tab-pane key="interactive">
        <template #tab>
          <span class="tab-label"><ExperimentOutlined />游戏互动页</span>
        </template>
        <div class="pane-head">
          <div class="pane-title">游戏互动页配置</div>
          <div class="pane-desc">活动首屏与抽奖玩法</div>
        </div>
        <a-form class="pane-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" :colon="false">
          <a-form-item label="页面标题">
            <a-input v-model:value="config.interactive.title" placeholder="如：绿色好礼抽奖" />
          </a-form-item>
          <a-form-item label="游戏类型">
            <a-select v-model:value="config.interactive.gameType" :options="gameTypeOptions" />
          </a-form-item>
          <a-form-item label="背景图地址">
            <a-input v-model:value="config.interactive.backgroundImage" placeholder="https://..." />
          </a-form-item>
          <a-form-item label="开始文案">
            <a-input v-model:value="config.interactive.startText" />
          </a-form-item>
          <a-form-item label="机会用完文案">
            <a-input v-model:value="config.interactive.endText" />
          </a-form-item>
          <a-form-item label="按钮文案">
            <a-input v-model:value="config.interactive.buttonText" />
          </a-form-item>
          <a-form-item label="启用互动页">
            <a-switch v-model:checked="config.interactive.enabled" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 活动规则弹窗配置 -->
      <a-tab-pane key="rules">
        <template #tab>
          <span class="tab-label"><FileTextOutlined />活动规则弹窗</span>
        </template>
        <div class="pane-head">
          <div class="pane-title">活动规则弹窗配置</div>
          <div class="pane-desc">进入活动时的规则说明弹窗</div>
        </div>
        <a-form class="pane-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" :colon="false">
          <a-form-item label="弹窗标题">
            <a-input v-model:value="config.rules.title" />
          </a-form-item>
          <a-form-item label="规则内容">
            <a-textarea v-model:value="config.rules.content" :rows="6" />
          </a-form-item>
          <a-form-item label="按钮文案">
            <a-input v-model:value="config.rules.buttonText" />
          </a-form-item>
          <a-form-item label="进入自动弹出">
            <a-switch v-model:checked="config.rules.autoPopup" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 领奖中心配置 -->
      <a-tab-pane key="prizeCenter">
        <template #tab>
          <span class="tab-label"><GiftOutlined />领奖中心</span>
        </template>
        <div class="pane-head">
          <div class="pane-title">领奖中心配置</div>
          <div class="pane-desc">中奖后奖品领取页面</div>
        </div>
        <a-form class="pane-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" :colon="false">
          <a-form-item label="页面标题">
            <a-input v-model:value="config.prizeCenter.title" />
          </a-form-item>
          <a-form-item label="领奖说明">
            <a-textarea v-model:value="config.prizeCenter.description" :rows="3" />
          </a-form-item>
          <a-form-item label="按钮文案">
            <a-input v-model:value="config.prizeCenter.buttonText" />
          </a-form-item>
          <a-form-item label="过期提示">
            <a-input v-model:value="config.prizeCenter.expiredTip" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 异常提示框配置 -->
      <a-tab-pane key="exception">
        <template #tab>
          <span class="tab-label"><WarningOutlined />异常提示框</span>
        </template>
        <div class="pane-head">
          <div class="pane-title">异常提示框配置</div>
          <div class="pane-desc">奖品领完、活动结束等异常场景</div>
        </div>
        <a-form class="pane-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" :colon="false">
          <a-form-item label="异常类型">
            <a-select v-model:value="config.exception.type" :options="exceptionTypeOptions" />
          </a-form-item>
          <a-form-item label="提示标题">
            <a-input v-model:value="config.exception.title" />
          </a-form-item>
          <a-form-item label="提示内容">
            <a-textarea v-model:value="config.exception.content" :rows="3" />
          </a-form-item>
          <a-form-item label="按钮文案">
            <a-input v-model:value="config.exception.buttonText" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 中奖弹窗配置 -->
      <a-tab-pane key="winPopup">
        <template #tab>
          <span class="tab-label"><TrophyOutlined />中奖弹窗</span>
        </template>
        <div class="pane-head">
          <div class="pane-title">中奖弹窗配置</div>
          <div class="pane-desc">抽中奖品后的结果弹窗</div>
        </div>
        <a-form class="pane-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" :colon="false">
          <a-form-item label="弹窗标题">
            <a-input v-model:value="config.winPopup.title" />
          </a-form-item>
          <a-form-item label="副标题">
            <a-input v-model:value="config.winPopup.subtitle" />
          </a-form-item>
          <a-form-item label="按钮文案">
            <a-input v-model:value="config.winPopup.buttonText" />
          </a-form-item>
          <a-form-item label="展示奖品图">
            <a-switch v-model:checked="config.winPopup.showPrizeImage" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- 分享配置 -->
      <a-tab-pane key="share">
        <template #tab>
          <span class="tab-label"><ShareAltOutlined />分享配置</span>
        </template>
        <div class="pane-head">
          <div class="pane-title">分享配置</div>
          <div class="pane-desc">转发卡片与跳转路径</div>
        </div>
        <a-form class="pane-form" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" :colon="false">
          <a-form-item label="分享标题">
            <a-input v-model:value="config.share.title" />
          </a-form-item>
          <a-form-item label="分享描述">
            <a-input v-model:value="config.share.description" />
          </a-form-item>
          <a-form-item label="分享图地址">
            <a-input v-model:value="config.share.imageUrl" placeholder="https://..." />
          </a-form-item>
          <a-form-item label="跳转路径">
            <a-input v-model:value="config.share.path" placeholder="pages/activity/index" />
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ExperimentOutlined,
  FileTextOutlined,
  GiftOutlined,
  ShareAltOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'
import { EXCEPTION_TYPES, GAME_TYPES, type TemplateConfig } from '@/api/marketing'

defineProps<{ config: TemplateConfig }>()

const activeTab = ref('interactive')
const gameTypeOptions = GAME_TYPES.map((v) => ({ label: v, value: v }))
const exceptionTypeOptions = EXCEPTION_TYPES.map((v) => ({ label: v, value: v }))
</script>

<style scoped lang="less">
.config-tabs-card {
  border-radius: 12px;

  :deep(.ant-card-body) {
    padding-top: 8px;
  }
}

.config-tabs {
  :deep(.ant-tabs-nav) {
    &::before {
      border-bottom-color: rgba(128, 128, 128, 0.16);
    }
  }

  :deep(.ant-tabs-tab) {
    padding: 10px 4px;
    transition: color 0.25s ease;
  }

  :deep(.ant-tabs-tab-active .tab-label),
  :deep(.ant-tabs-tab:hover .tab-label) {
    color: #9254de;
  }
}

.tab-label {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.pane-head {
  padding-bottom: 14px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.14);

  .pane-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-main);
  }

  .pane-desc {
    margin-top: 3px;
    font-size: 12px;
    color: var(--text-sub);
  }
}

.pane-form {
  max-width: 640px;
  min-height: 360px;
}
</style>
