<template>
  <div class="create-dataset-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/datasets' }">数据集管理</el-breadcrumb-item>
      <el-breadcrumb-item>创建数据集</el-breadcrumb-item>
      <el-breadcrumb-item>{{ currentStep === 1 ? '导入配置' : '基本信息' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 步骤导航 -->
    <el-steps :active="currentStep" finish-status="success" class="steps">
      <el-step title="创建数据集" />
      <el-step title="导入数据" />
    </el-steps>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" ref="formRef" />
        </keep-alive>
      </router-view>
    </div>

    <!-- 步骤控制按钮 -->
    <div class="step-actions">
      <el-button 
        v-if="currentStep > 0" 
        @click="previousStep"
        :disabled="loading"
      >
        上一步
      </el-button>
      <el-button 
        type="primary" 
        @click="nextStep"
        :loading="loading"
      >
        {{ currentStep === 1 ? '完成' : '下一步' }}
      </el-button>
    </div>

    <!-- 导入进度对话框 -->
    <el-dialog
      v-model="showProgress"
      title="导入进度"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <div class="progress-status">{{ progressStatus }}</div>
        <el-progress 
          :percentage="progressPercentage" 
          :status="progressStatus === '导入完成' ? 'success' : ''"
        />
        <div class="progress-detail">{{ progressDetail }}</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button 
            v-if="progressStatus === '导入完成'" 
            type="primary" 
            @click="handleImportComplete"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, provide, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const currentStep = ref(0)
const loading = ref(false)

// 数据集基本信息
const datasetInfo = ref({
  name: '',
  dataType: '文本',
  version: 'V1',
  annotationType: '',
  annotationTemplate: 'single',
  storageType: 'local'
})

// 提供数据类型给子组件
provide('dataType', computed(() => datasetInfo.value.dataType))

// 导入进度相关
const showProgress = ref(false)
const progressPercentage = ref(0)
const progressStatus = ref('')
const progressDetail = ref('')

// 监听路由变化更新当前步骤
watch(() => route.path, (newPath) => {
  currentStep.value = newPath.includes('/import') ? 1 : 0
}, { immediate: true })

// 监听数据类型变化
watch(() => formRef.value?.datasetForm?.dataType, (newType) => {
  if (newType) {
    datasetInfo.value.dataType = newType
  }
}, { immediate: true })

// 上一步
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    router.push('/datasets/create')
  }
}

// 下一步
const nextStep = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const valid = await formRef.value?.validate()
    
    if (valid) {
      if (currentStep.value === 0) {
        // 第一步：保存数据集基本信息
        Object.assign(datasetInfo.value, formRef.value.datasetForm)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        currentStep.value++
        router.push('/datasets/create/import')
      } else {
        // 第二步：处理文件上传和导入
        await handleImport()
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理文件导入
const handleImport = async () => {
  try {
    showProgress.value = true
    progressStatus.value = '准备导入'
    progressPercentage.value = 0
    progressDetail.value = '正在验证文件...'

    // 模拟导入过程
    await simulateImportProgress()

    // 调用子组件的上传方法
    const result = await formRef.value?.upload()
    
    if (result?.success) {
      progressStatus.value = '导入完成'
      progressDetail.value = '数据导入成功，即将跳转到数据集列表'
    } else {
      throw new Error(result?.message || '导入失败')
    }
  } catch (error) {
    progressStatus.value = '导入失败'
    progressDetail.value = error.message
    ElMessage.error(error.message)
  }
}

// 模拟导入进度
const simulateImportProgress = async () => {
  const steps = [
    { status: '文件处理', detail: '正在解析文件内容...', progress: 30 },
    { status: '数据验证', detail: '正在验证数据格式...', progress: 50 },
    { status: '数据导入', detail: '正在导入数据...', progress: 80 },
    { status: '后处理', detail: '正在处理导入数据...', progress: 90 }
  ]

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    progressStatus.value = step.status
    progressDetail.value = step.detail
    progressPercentage.value = step.progress
  }
}

// 处理导入完成
const handleImportComplete = () => {
  showProgress.value = false
  ElMessage.success('数据集创建成功')
  router.push('/datasets')
}
</script>

<style scoped>
.create-dataset-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.steps {
  margin: 40px 0;
}

.main-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  min-height: 500px;
}

.step-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.progress-content {
  padding: 20px 0;
  text-align: center;
}

.progress-status {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}

.progress-detail {
  margin-top: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

:deep(.el-progress-bar__inner) {
  transition: width 0.5s ease;
}
</style> 