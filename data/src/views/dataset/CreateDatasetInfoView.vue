<template>
  <el-form 
    ref="datasetFormRef"
    :model="datasetForm"
    :rules="formRules"
    label-width="120px"
    class="dataset-form"
    @submit.prevent
  >
    <!-- 数据集名称 -->
    <el-form-item label="数据集名称" prop="name" required>
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
    <el-form-item label="数据类型" prop="dataType" required>
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
    <el-form-item label="数据集版本" prop="version">
      <el-input v-model="datasetForm.version" placeholder="V1">
        <template #prepend>V</template>
      </el-input>
      <div class="form-item-tip">版本号格式：V + 数字，例如：V1、V2.0</div>
    </el-form-item>

    <!-- 标注类型 -->
    <el-form-item label="标注类型" prop="annotationType" required>
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
    <el-form-item label="标注模板" prop="annotationTemplate" required>
      <el-radio-group v-model="datasetForm.annotationTemplate">
        <el-radio label="single">单图单标签</el-radio>
        <el-radio label="multiple">单图多标签</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 保存位置 -->
    <el-form-item label="保存位置" prop="storageType" required>
      <el-radio-group v-model="datasetForm.storageType">
        <el-radio label="local">平台存储</el-radio>
        <el-radio label="bos">BOS存储</el-radio>
      </el-radio-group>
      <el-tooltip content="平台存储：数据将存储在平台提供的存储空间中。BOS存储：数据将存储在您的BOS存储空间中。" placement="right">
        <el-icon class="info-icon"><InfoFilled /></el-icon>
      </el-tooltip>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Picture,
  Document,
  Headset,
  VideoCamera,
  Grid,
  Connection,
  InfoFilled
} from '@element-plus/icons-vue'

const datasetFormRef = ref(null)

// 数据集表单
const datasetForm = ref({
  name: '',
  dataType: '文本',
  version: '1',
  annotationType: '',
  annotationTemplate: 'single',
  storageType: 'local'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入数据集名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { 
      pattern: /^[^_][a-zA-Z0-9\u4e00-\u9fa5_]+$/,
      message: '支持汉字、大小写英文、数字以及下划线，下划线不能用为开头',
      trigger: 'blur'
    }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  version: [
    { 
      pattern: /^[1-9]\d*(\.\d+)?$/,
      message: '请输入有效的版本号，例如：1、2.0',
      trigger: 'blur'
    }
  ],
  annotationType: [
    { required: true, message: '请选择标注类型', trigger: 'change' }
  ],
  annotationTemplate: [
    { required: true, message: '请选择标注模板', trigger: 'change' }
  ],
  storageType: [
    { required: true, message: '请选择存储位置', trigger: 'change' }
  ]
}

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
  // 手动触发表单验证
  datasetFormRef.value?.validateField('annotationType')
}

// 导出给父组件使用
defineExpose({
  datasetForm,
  validate: () => datasetFormRef.value?.validate()
})
</script>

<style scoped>
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

.form-item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}
</style> 