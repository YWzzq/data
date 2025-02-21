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
      <el-radio-group v-model="datasetForm.annotationType" class="annotation-type-group">
        <el-radio-button 
          v-for="type in getAnnotationTypes"
          :key="type.value"
          :label="type.value"
          class="annotation-type-button"
        >
          <el-icon><component :is="type.icon" /></el-icon>
          {{ type.label }}
        </el-radio-button>
      </el-radio-group>
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
      </el-radio-group>
      <el-tooltip content="数据将存储在平台提供的存储空间中" placement="right">
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

.annotation-type-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.annotation-type-button {
  :deep(.el-radio-button__inner) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 20px;
    min-width: 120px;
    justify-content: center;
  }

  .el-icon {
    font-size: 16px;
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

.annotation-type-grid,
.annotation-type-card {
  display: none;
}
</style> 