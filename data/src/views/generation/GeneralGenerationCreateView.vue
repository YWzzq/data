<template>
  <div class="general-generation-create">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">创建一般数据生成任务</h2>
      </div>
      <div class="header-actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </div>
    </div>

    <el-form :model="generationForm" label-width="120px" class="generation-form" :status-icon="true">
      <!-- 基本信息 -->
      <el-card class="form-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><InfoFilled /></el-icon>基本信息
            </span>
            <el-tag size="small" type="info" effect="plain">必填</el-tag>
          </div>
        </template>

        <el-form-item label="任务名称" required>
          <el-input 
            v-model="generationForm.name" 
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
            clearable
          >
            <template #prefix>
              <el-icon><Edit /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="数据类型" required>
          <el-radio-group v-model="generationForm.dataType">
            <el-radio-button value="text">
              <el-icon><Document /></el-icon>文本数据
            </el-radio-button>
            <el-radio-button value="image">
              <el-icon><Picture /></el-icon>图像数据
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生成数量" required>
          <el-input-number 
            v-model="generationForm.count" 
            :min="1" 
            :max="10000"
            controls-position="right"
            :precision="0"
            style="width: 180px"
          >
            <template #prefix>数量</template>
          </el-input-number>
          <div class="form-item-tip">设置需要生成的数据条数，范围1-10000</div>
        </el-form-item>
      </el-card>

      <!-- 数据来源配置 -->
      <el-card class="form-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><FolderOpened /></el-icon>数据来源配置
            </span>
            <el-tooltip content="配置数据的输入来源和输出位置" placement="top">
              <el-icon class="info-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>

        <el-form-item label="数据来源" required>
          <el-radio-group v-model="generationForm.source.type">
            <el-radio-button value="dataset">
              <el-icon><FolderOpened /></el-icon>已有数据集
            </el-radio-button>
            <el-radio-button value="upload">
              <el-icon><Upload /></el-icon>本地上传
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="sub-form" v-if="generationForm.source.type === 'dataset'">
          <el-form-item label="选择数据集">
            <el-select 
              v-model="generationForm.source.datasetId" 
              placeholder="请选择数据集"
              class="flexible-input"
            >
              <el-option
                v-for="dataset in datasets"
                :key="dataset.id"
                :label="dataset.name"
                :value="dataset.id"
              >
                <template #default="{ label }">
                  <el-icon><Folder /></el-icon>
                  <span>{{ label }}</span>
                </template>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="输入路径" required>
            <el-input 
              v-model="generationForm.source.inputPath" 
              placeholder="请输入数据集中的输入文件路径，例如：/data/input.txt"
              class="flexible-input"
              clearable
            >
              <template #prepend>/</template>
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <div class="sub-form" v-else>
          <el-form-item label="上传文件">
            <el-upload
              class="upload-area"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  <el-icon><InfoFilled /></el-icon>
                  支持 TXT、CSV、JSON 格式文件，单个文件不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>

        <el-divider content-position="left">输出配置</el-divider>

        <el-form-item required>
          <el-radio-group v-model="generationForm.output.type" class="mb-4">
            <el-radio-button value="dataset">
              <el-icon><FolderAdd /></el-icon>保存到数据集
            </el-radio-button>
            <el-radio-button value="download">
              <el-icon><Download /></el-icon>本地下载
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="sub-form" v-if="generationForm.output.type === 'dataset'">
          <el-form-item label="选择数据集">
            <el-select 
              v-model="generationForm.output.datasetId" 
              placeholder="请选择目标数据集"
              class="flexible-input"
            >
              <el-option
                v-for="dataset in datasets"
                :key="dataset.id"
                :label="dataset.name"
                :value="dataset.id"
              >
                <template #default="{ label }">
                  <el-icon><Folder /></el-icon>
                  <span>{{ label }}</span>
                </template>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="输出路径">
            <el-input 
              v-model="generationForm.output.path" 
              placeholder="请输入保存路径，例如：/data/general"
              class="flexible-input"
              clearable
            >
              <template #prepend>/</template>
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </el-card>

      <!-- 增强配置 -->
      <el-card class="form-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><Setting /></el-icon>增强配置
            </span>
            <el-tooltip content="配置数据增强的方法和参数" placement="top">
              <el-icon class="info-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>

        <el-form-item label="增强方式" required>
          <el-checkbox-group v-model="generationForm.enhancement.methods">
            <template v-if="generationForm.dataType === 'text'">
              <el-checkbox label="synonym">
                <el-icon><Connection /></el-icon>同义词替换
              </el-checkbox>
              <el-checkbox label="back_translation">
                <el-icon><Position /></el-icon>回译
              </el-checkbox>
              <el-checkbox label="template">
                <el-icon><List /></el-icon>模板生成
              </el-checkbox>
              <el-checkbox label="eda">
                <el-icon><MagicStick /></el-icon>EDA
              </el-checkbox>
            </template>
            <template v-else>
              <el-checkbox label="flip">
                <el-icon><Refresh /></el-icon>翻转
              </el-checkbox>
              <el-checkbox label="rotate">
                <el-icon><RefreshRight /></el-icon>旋转
              </el-checkbox>
              <el-checkbox label="noise">
                <el-icon><PictureFilled /></el-icon>添加噪声
              </el-checkbox>
              <el-checkbox label="color">
                <el-icon><Brush /></el-icon>颜色变换
              </el-checkbox>
            </template>
          </el-checkbox-group>
        </el-form-item>

        <el-divider content-position="left">参数配置</el-divider>

        <el-form-item label="增强参数">
          <div class="parameter-grid">
            <el-input-number
              v-model="generationForm.enhancement.augmentRatio"
              :min="1"
              :max="10"
              controls-position="right"
              :precision="0"
              style="width: 180px"
            >
              <template #prefix>增强倍数</template>
            </el-input-number>
            
            <div class="slider-container">
              <span class="slider-label">随机度：</span>
              <el-slider
                v-model="generationForm.enhancement.randomness"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                :format-tooltip="(val) => val.toFixed(1)"
                style="width: 300px"
              />
              <div class="form-item-tip">
                较低的值会使增强结果更加保守，较高的值会产生更多变化
              </div>
            </div>
          </div>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  UploadFilled,
  InfoFilled,
  Edit,
  Document,
  Picture,
  FolderOpened,
  Folder,
  Download,
  Setting,
  List,
  Connection,
  Position,
  MagicStick,
  Refresh,
  RefreshRight,
  PictureFilled,
  Brush,
  Upload,
  FolderAdd,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据集列表
const datasets = ref([
  { id: 1, name: '通用文本数据集' },
  { id: 2, name: '图像数据集' },
  { id: 3, name: '混合数据集' }
])

// 表单数据
const generationForm = ref({
  name: '',
  dataType: 'text',
  count: 100,
  source: {
    type: 'dataset',
    datasetId: '',
    inputPath: '',
    file: null
  },
  output: {
    type: 'dataset',
    datasetId: '',
    path: ''
  },
  enhancement: {
    methods: [],
    augmentRatio: 2,
    randomness: 0.5
  }
})

// 处理文件上传
const handleFileChange = (file) => {
  generationForm.value.source.file = file
}

// 处理文件移除
const handleFileRemove = () => {
  generationForm.value.source.file = null
}

// 取消创建
const cancel = () => {
  router.back()
}

// 创建任务
const createTask = () => {
  // 表单验证
  if (!generationForm.value.name.trim()) {
    ElMessage.warning('请输入任务名称')
    return
  }
  
  if (generationForm.value.source.type === 'dataset') {
    if (!generationForm.value.source.datasetId) {
      ElMessage.warning('请选择输入数据集')
      return
    }
    if (!generationForm.value.source.inputPath) {
      ElMessage.warning('请输入数据集输入路径')
      return
    }
  } else if (!generationForm.value.source.file) {
    ElMessage.warning('请上传数据文件')
    return
  }

  if (generationForm.value.output.type === 'dataset') {
    if (!generationForm.value.output.datasetId) {
      ElMessage.warning('请选择输出数据集')
      return
    }
    if (!generationForm.value.output.path) {
      ElMessage.warning('请输入输出路径')
      return
    }
  }

  if (!generationForm.value.enhancement.methods.length) {
    ElMessage.warning('请至少选择一种增强方式')
    return
  }

  // TODO: 调用API创建任务
  ElMessage.success('任务创建成功')
  router.push({ name: 'general-generation' })
}
</script>

<style scoped>
.general-generation-create {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content {
  .page-title {
    margin: 12px 0 0;
    font-size: 20px;
    font-weight: 500;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.generation-form {
  max-width: 1000px;
  margin: 0 auto;
}

.form-card {
  margin-bottom: 24px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.info-icon {
  color: var(--el-text-color-secondary);
  cursor: help;
}

.sub-form {
  padding: 16px;
  background-color: var(--el-fill-color-blank);
  border-radius: 4px;
  margin-bottom: 16px;
}

.flexible-input {
  width: 100%;
  max-width: 500px;
}

.form-item-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.parameter-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-label {
  color: var(--el-text-color-regular);
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-checkbox) {
  display: flex;
  align-items: center;
  margin-right: 30px;
  margin-bottom: 12px;

  .el-icon {
    margin-right: 4px;
  }
}

.el-divider {
  margin: 24px 0;
}
</style> 