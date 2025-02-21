<template>
  <div class="create-ai-annotation-task">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>新建AI标注任务</h2>
      <p class="page-desc">配置AI标注任务参数，选择合适的模型进行标注</p>
    </div>

    <!-- 配置表单 -->
    <el-form
      ref="formRef"
      :model="taskForm"
      :rules="formRules"
      label-width="120px"
      class="task-form"
    >
      <!-- 基本信息 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="任务名称" prop="name">
          <el-input 
            v-model="taskForm.name"
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="数据类型" prop="dataType">
          <el-radio-group v-model="taskForm.dataType">
            <el-radio-button label="text">文本数据</el-radio-button>
            <el-radio-button label="image">图像数据</el-radio-button>
            <el-radio-button label="audio">音频数据</el-radio-button>
            <el-radio-button label="video">视频数据</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标注类型" prop="annotationType">
          <el-select v-model="taskForm.annotationType" placeholder="请选择标注类型">
            <template v-if="taskForm.dataType === 'text'">
              <el-option label="文本分类" value="text_classification" />
              <el-option label="命名实体识别" value="ner" />
              <el-option label="关系抽取" value="relation_extraction" />
            </template>
            <template v-if="taskForm.dataType === 'image'">
              <el-option label="图像分类" value="image_classification" />
              <el-option label="目标检测" value="object_detection" />
              <el-option label="图像分割" value="image_segmentation" />
            </template>
            <template v-if="taskForm.dataType === 'audio'">
              <el-option label="语音识别" value="speech_recognition" />
              <el-option label="声音分类" value="audio_classification" />
            </template>
            <template v-if="taskForm.dataType === 'video'">
              <el-option label="视频分类" value="video_classification" />
              <el-option label="动作识别" value="action_recognition" />
            </template>
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 数据配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>数据配置</span>
          </div>
        </template>

        <el-form-item label="数据来源" prop="dataSource">
          <el-radio-group v-model="taskForm.dataSource">
            <el-radio label="dataset">已有数据集</el-radio>
            <el-radio label="upload">本地上传</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="taskForm.dataSource === 'dataset'" label="选择数据集" prop="datasetId">
          <el-select v-model="taskForm.datasetId" placeholder="请选择数据集">
            <el-option
              v-for="dataset in datasets"
              :key="dataset.id"
              :label="dataset.name"
              :value="dataset.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-else label="上传数据" prop="files">
          <el-upload
            action="/api/upload"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="taskForm.files"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 {{ getSupportsFileTypes }} 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-card>

      <!-- AI模型配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>AI模型配置</span>
          </div>
        </template>

        <el-form-item label="选择模型" prop="modelId">
          <el-select v-model="taskForm.modelId" placeholder="请选择AI模型">
            <el-option
              v-for="model in availableModels"
              :key="model.id"
              :label="model.name"
              :value="model.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="置信度阈值" prop="confidenceThreshold">
          <el-slider
            v-model="taskForm.confidenceThreshold"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <el-form-item label="自动标注" prop="autoAnnotation">
          <el-switch v-model="taskForm.autoAnnotation" />
          <span class="form-item-tip">开启后将自动进行AI标注，关闭后需要手动触发</span>
        </el-form-item>
      </el-card>

      <!-- 质量控制 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>质量控制</span>
          </div>
        </template>

        <el-form-item label="人工复核" prop="humanReview">
          <el-switch v-model="taskForm.humanReview" />
          <span class="form-item-tip">开启后AI标注结果需要人工复核才能完成</span>
        </el-form-item>

        <el-form-item label="复核人员" prop="reviewers" v-if="taskForm.humanReview">
          <el-select
            v-model="taskForm.reviewers"
            multiple
            placeholder="请选择复核人员"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="createTask" :loading="loading">
          创建任务
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 表单数据
const taskForm = ref({
  name: '',
  dataType: 'text',
  annotationType: '',
  dataSource: 'dataset',
  datasetId: '',
  files: [],
  modelId: '',
  confidenceThreshold: 0.8,
  autoAnnotation: true,
  humanReview: true,
  reviewers: []
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  annotationType: [
    { required: true, message: '请选择标注类型', trigger: 'change' }
  ],
  datasetId: [
    { required: true, message: '请选择数据集', trigger: 'change' }
  ],
  modelId: [
    { required: true, message: '请选择AI模型', trigger: 'change' }
  ],
  reviewers: [
    { required: true, message: '请选择复核人员', trigger: 'change' }
  ]
}

// 模拟数据
const datasets = ref([
  { id: 1, name: '新闻文本数据集' },
  { id: 2, name: '商品图片数据集' },
  { id: 3, name: '医疗文本数据集' }
])

const availableModels = ref([
  { id: 1, name: 'BERT-Classification', type: 'text' },
  { id: 2, name: 'YOLO-v5', type: 'image' },
  { id: 3, name: 'BiLSTM-CRF', type: 'text' }
])

const users = ref([
  { id: 1, name: '审核员A' },
  { id: 2, name: '审核员B' },
  { id: 3, name: '审核员C' }
])

// 获取支持的文件类型
const getSupportsFileTypes = computed(() => {
  const typeMap = {
    text: 'TXT, CSV, JSON',
    image: 'JPG, PNG, JPEG',
    audio: 'MP3, WAV, OGG',
    video: 'MP4, AVI, MOV'
  }
  return typeMap[taskForm.value.dataType] || ''
})

// 处理文件变更
const handleFileChange = (file, fileList) => {
  taskForm.value.files = fileList
}

// 取消创建
const cancel = () => {
  router.back()
}

// 创建任务
const createTask = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    const valid = await formRef.value.validate()
    
    if (valid) {
      // TODO: 调用API创建任务
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('任务创建成功')
      router.push('/ai-annotation')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-ai-annotation-task {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
  }

  .page-desc {
    margin: 8px 0 0;
    color: var(--el-text-color-secondary);
  }
}

.task-form {
  max-width: 800px;
  margin: 0 auto;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-item-tip {
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
}
</style> 