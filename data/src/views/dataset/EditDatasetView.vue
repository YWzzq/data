<template>
  <div class="edit-dataset-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/datasets' }">数据集管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: `/datasets/${datasetId}` }">{{ datasetForm.name }}</el-breadcrumb-item>
      <el-breadcrumb-item>编辑数据集</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 编辑表单 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>编辑数据集</span>
        </div>
      </template>

      <el-form :model="datasetForm" label-width="120px" class="dataset-form">
        <!-- 数据集名称 -->
        <el-form-item label="数据集名称" required>
          <el-input 
            v-model="datasetForm.name" 
            placeholder="限制50个字符以内（支持汉字、大小写英文、数字以及下划线，下划线不能用为开头）"
            :maxlength="50"
            show-word-limit
          >
            <template #append>{{ datasetForm.name.length }}/50</template>
          </el-input>
        </el-form-item>

        <!-- 数据类型 -->
        <el-form-item label="数据类型" required>
          <el-radio-group v-model="datasetForm.dataType" class="data-type-group">
            <el-radio-button label="图片">
              <el-icon><Picture /></el-icon>图片
            </el-radio-button>
            <el-radio-button label="文本">
              <el-icon><Document /></el-icon>文本
            </el-radio-button>
            <el-radio-button label="音频">
              <el-icon><Headset /></el-icon>音频
            </el-radio-button>
            <el-radio-button label="视频">
              <el-icon><VideoCamera /></el-icon>视频
            </el-radio-button>
            <el-radio-button label="表格">
              <el-icon><Grid /></el-icon>表格
            </el-radio-button>
            <el-radio-button label="跨模态">
              <el-icon><Connection /></el-icon>跨模态
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 数据集版本 -->
        <el-form-item label="数据集版本">
          <el-input v-model="datasetForm.version" placeholder="V1" />
        </el-form-item>

        <!-- 标注类型 -->
        <el-form-item label="标注类型" required>
          <div class="annotation-type-grid">
            <el-card 
              v-for="type in getAnnotationTypes"
              :key="type.value"
              :class="['annotation-type-card', { active: datasetForm.annotationType === type.value }]"
              @click="selectAnnotationType(type.value)"
            >
              <div class="type-icon">
                <el-icon><component :is="type.icon" /></el-icon>
              </div>
              <div class="type-name">{{ type.label }}</div>
            </el-card>
          </div>
        </el-form-item>

        <!-- 标注模板 -->
        <el-form-item label="标注模板" required>
          <el-radio-group v-model="datasetForm.annotationTemplate">
            <el-radio label="single">单图单标签</el-radio>
            <el-radio label="multiple">单图多标签</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 保存位置 -->
        <el-form-item label="保存位置" required>
          <el-radio-group v-model="datasetForm.storageType">
            <el-radio label="local">平台存储</el-radio>
            <el-radio label="bos">BOS存储</el-radio>
          </el-radio-group>
          <el-tooltip content="平台存储：数据将存储在平台提供的存储空间中。BOS存储：数据将存储在您的BOS存储空间中。" placement="right">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveDataset">保存修改</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Document,
  Headset,
  VideoCamera,
  Grid,
  Connection,
  InfoFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const datasetId = route.params.id

// 数据集表单
const datasetForm = ref({
  name: '',
  dataType: '文本',
  version: 'V1',
  annotationType: '',
  annotationTemplate: 'single',
  storageType: 'local'
})

// 根据数据类型获取对应的标注类型
const getAnnotationTypes = computed(() => {
  const types = {
    '图片': [
      { label: '图像分类', value: 'image_classification', icon: 'Picture' },
      { label: '物体检测', value: 'object_detection', icon: 'Aim' },
      { label: '图像分割', value: 'image_segmentation', icon: 'ScaleToOriginal' }
    ],
    '文本': [
      { label: '文本分类', value: 'text_classification', icon: 'Document' },
      { label: '序列标注', value: 'sequence_labeling', icon: 'Collection' },
      { label: '文本匹配', value: 'text_matching', icon: 'Connection' }
    ],
    '音频': [
      { label: '语音识别', value: 'speech_recognition', icon: 'Microphone' },
      { label: '声音分类', value: 'audio_classification', icon: 'Headset' }
    ],
    '视频': [
      { label: '视频分类', value: 'video_classification', icon: 'VideoCamera' },
      { label: '目标跟踪', value: 'object_tracking', icon: 'Aim' }
    ],
    '表格': [
      { label: '单元格标注', value: 'cell_annotation', icon: 'Grid' },
      { label: '行列标注', value: 'row_col_annotation', icon: 'Operation' }
    ],
    '跨模态': [
      { label: '图文匹配', value: 'image_text_matching', icon: 'Connection' },
      { label: '视频描述', value: 'video_caption', icon: 'ChatLineRound' }
    ]
  }
  return types[datasetForm.value.dataType] || []
})

// 选择标注类型
const selectAnnotationType = (type) => {
  datasetForm.value.annotationType = type
}

// 加载数据集信息
const loadDataset = () => {
  // TODO: 从API获取数据集信息
  // 模拟数据
  const mockData = {
    name: '新闻分类数据集',
    dataType: '文本',
    version: 'V1',
    annotationType: 'text_classification',
    annotationTemplate: 'single',
    storageType: 'local'
  }
  Object.assign(datasetForm.value, mockData)
}

// 保存修改
const saveDataset = () => {
  // 表单验证
  if (!datasetForm.value.name.trim()) {
    ElMessage.warning('请输入数据集名称')
    return
  }
  if (!datasetForm.value.annotationType) {
    ElMessage.warning('请选择标注类型')
    return
  }

  // TODO: 调用API保存数据集信息
  ElMessage.success('保存成功')
  router.push(`/datasets/${datasetId}`)
}

// 取消编辑
const cancelEdit = () => {
  router.back()
}

// 页面加载时获取数据集信息
onMounted(() => {
  loadDataset()
})
</script>

<style scoped>
.edit-dataset-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mt-20 {
  margin-top: 20px;
}

.dataset-form {
  max-width: 800px;
}

.data-type-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.data-type-group :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
}

.annotation-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.annotation-type-card {
  cursor: pointer;
  text-align: center;
  padding: 16px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  &.active {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .type-icon {
    font-size: 24px;
    margin-bottom: 8px;
    color: var(--el-color-primary);
  }

  .type-name {
    font-size: 14px;
  }
}

.info-icon {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  cursor: help;
}
</style> 