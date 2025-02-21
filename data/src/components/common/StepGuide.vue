<template>
  <div class="step-guide" :class="{ 'collapsed': !isExpanded }">
    <!-- 展开/收起按钮 -->
    <div class="guide-toggle" @click="toggleGuide">
      <el-icon :class="{ 'is-rotate': isExpanded }">
        <ArrowLeft />
      </el-icon>
      <span v-if="!isExpanded" class="toggle-text">功能引导</span>
    </div>

    <!-- 引导内容面板 -->
    <div class="guide-panel" v-show="isExpanded">
      <div class="guide-header">
        <h3>{{ title }}</h3>
        <el-switch
          v-model="autoShow"
          active-text="自动显示"
          @change="handleAutoShowChange"
        />
      </div>

      <div class="guide-content">
        <el-steps :active="activeStep" direction="vertical" finish-status="success">
          <el-step 
            v-for="(step, index) in steps" 
            :key="index"
            :title="step.title"
            :description="step.description"
          >
            <template #icon>
              <el-icon>
                <component :is="step.icon" />
              </el-icon>
            </template>
          </el-step>
        </el-steps>
      </div>

      <div class="guide-footer">
        <el-button-group>
          <el-button 
            :disabled="activeStep === 0"
            @click="prevStep"
          >
            上一步
          </el-button>
          <el-button 
            type="primary"
            :disabled="activeStep === steps.length - 1"
            @click="nextStep"
          >
            下一步
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: '功能引导'
  },
  steps: {
    type: Array,
    required: true
  },
  pageKey: {
    type: String,
    required: true
  }
})

const isExpanded = ref(true)
const activeStep = ref(0)
const autoShow = ref(true)

// 切换引导面板显示状态
const toggleGuide = () => {
  isExpanded.value = !isExpanded.value
}

// 下一步
const nextStep = () => {
  if (activeStep.value < props.steps.length - 1) {
    activeStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

// 处理自动显示变更
const handleAutoShowChange = (value) => {
  localStorage.setItem(`guide_auto_show_${props.pageKey}`, value.toString())
}

// 组件加载时检查自动显示设置
onMounted(() => {
  const savedAutoShow = localStorage.getItem(`guide_auto_show_${props.pageKey}`)
  if (savedAutoShow !== null) {
    autoShow.value = savedAutoShow === 'true'
    isExpanded.value = autoShow.value
  }
})
</script>

<style scoped>
.step-guide {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  transition: all 0.3s ease;
}

.guide-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 96px;
  background-color: var(--el-color-primary);
  color: white;
  cursor: pointer;
  border-radius: 4px 0 0 4px;
  transition: all 0.3s ease;
  writing-mode: vertical-lr;
  padding: 8px 4px;
}

.guide-toggle:hover {
  background-color: var(--el-color-primary-dark-2);
}

.guide-toggle .el-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.guide-toggle .el-icon.is-rotate {
  transform: rotate(180deg);
}

.toggle-text {
  margin-top: 8px;
  font-size: 14px;
}

.guide-panel {
  width: 300px;
  background-color: white;
  border: 1px solid var(--el-border-color);
  border-right: none;
  border-radius: 4px 0 0 4px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.guide-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guide-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.guide-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.guide-footer {
  padding: 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  justify-content: center;
}

/* 自定义步骤样式 */
:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-step__description) {
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-step__icon) {
  background-color: var(--el-color-primary-light-9);
}

.collapsed .guide-panel {
  display: none;
}
</style> 