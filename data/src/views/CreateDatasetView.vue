<template>
  <div class="create-dataset-page">
    <!-- 步骤导航 -->
    <el-steps :active="currentStep" finish-status="success" class="steps">
      <el-step title="创建数据集" />
      <el-step title="导入数据" />
    </el-steps>

    <!-- 步骤1：创建数据集 -->
    <div v-if="currentStep === 0" class="step-content">
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
              v-for="type in annotationTypes" 
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
      </el-form>
    </div>

    <!-- 步骤2：导入配置 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-form :model="importForm" label-width="120px" class="import-form">
        <!-- 导入配置 -->
        <el-form-item label="数据标注状态" required>
          <el-radio-group v-model="importForm.hasAnnotation">
            <el-radio :label="false">无标注信息</el-radio>
            <el-radio :label="true">有标注信息</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 导入方式 -->
        <el-form-item label="导入方式" required>
          <el-select v-model="importForm.importType" placeholder="请选择导入方式" style="width: 200px">
            <el-option label="本地导入" value="local" />
            <el-option label="URL导入" value="url" />
          </el-select>

          <el-select v-model="importForm.fileType" placeholder="请选择文件类型" style="width: 200px; margin-left: 10px">
            <el-option label="上传TXT文本" value="txt" />
            <el-option label="上传CSV文件" value="csv" />
            <el-option label="上传JSON文件" value="json" />
          </el-select>
        </el-form-item>

        <!-- 分隔符设置 -->
        <el-form-item label="分隔符" v-if="importForm.fileType === 'txt'">
          <el-radio-group v-model="importForm.separator">
            <el-radio label="line">换行符</el-radio>
            <el-radio label="semicolon">分号</el-radio>
            <el-radio label="tab">制表符</el-radio>
            <el-radio label="space">空格</el-radio>
            <el-radio label="none">无</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item label="上传文件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 {{ supportedFileTypes }} 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 是否去重 -->
        <el-form-item label="是否去重">
          <el-radio-group v-model="importForm.deduplication">
            <el-radio :label="true">数据自动去重</el-radio>
            <el-radio :label="false">数据不去重</el-radio>
          </el-radio-group>
          <el-tooltip content="选择数据自动去重后，系统会自动对重复的数据进行去重处理" placement="right">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </el-form-item>

        <!-- 导入记录 -->
        <el-form-item label="导入记录">
          <div class="import-record">
            暂无导入记录
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤控制按钮 -->
    <div class="step-actions">
      <el-button v-if="currentStep > 0" @click="previousStep">上一步</el-button>
      <el-button 
        type="primary" 
        @click="nextStep"
      >
        {{ currentStep === 1 ? '完成' : '下一步' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Document,
  Headset,
  VideoCamera,
  Grid,
  Connection,
  InfoFilled,
  UploadFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const currentStep = ref(0)

// 数据集基本信息表单
const datasetForm = ref({
  name: '',
  dataType: '文本',
  version: 'V1',
  annotationType: '',
  annotationTemplate: 'single',
  storageType: 'local'
})

// 导入配置表单
const importForm = ref({
  hasAnnotation: false,
  importType: 'local',
  fileType: 'txt',
  separator: 'line',
  deduplication: true
})

// 标注类型配置
const annotationTypes = [
  { label: '图像分类', value: 'image_classification', icon: 'Picture' },
  { label: '物体检测', value: 'object_detection', icon: 'Aim' },
  { label: '图像分割', value: 'image_segmentation', icon: 'ScaleToOriginal' },
  { label: 'OCR标注', value: 'ocr', icon: 'Document' },
  { label: '点标注', value: 'point_annotation', icon: 'Location' },
  { label: '线标注', value: 'line_annotation', icon: 'Share' },
  { label: '3D框标注', value: '3d_box', icon: 'Box' },
  { label: '混合标注', value: 'mixed_annotation', icon: 'Connection' }
]

// 支持的文件类型
const supportedFileTypes = computed(() => {
  switch (importForm.value.fileType) {
    case 'txt':
      return '.txt'
    case 'csv':
      return '.csv'
    case 'json':
      return '.json'
    default:
      return '.txt, .csv, .json'
  }
})

// 选择标注类型
const selectAnnotationType = (type) => {
  datasetForm.value.annotationType = type
}

// 文件上传处理
const handleFileChange = (file) => {
  console.log('Selected file:', file)
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value === 0) {
    // 验证第一步表单
    if (!datasetForm.value.name.trim()) {
      ElMessage.warning('请输入数据集名称')
      return
    }
    if (!datasetForm.value.annotationType) {
      ElMessage.warning('请选择标注类型')
      return
    }
    currentStep.value++
  } else {
    // 完成创建
    ElMessage.success('数据集创建成功')
    router.push('/datasets')
  }
}
</script>

<style scoped>
.create-dataset-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.steps {
  margin-bottom: 40px;
}

.step-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.dataset-form,
.import-form {
  max-width: 800px;
}

.data-type-group {
  display: flex;
  gap: 12px;
}

.data-type-group :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
}

.annotation-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.annotation-type-card {
  cursor: pointer;
  text-align: center;
  padding: 20px;
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

.import-record {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  padding: 20px;
  text-align: center;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.step-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}
</style> 