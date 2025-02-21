<template>
  <div class="finetune-generation-create">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">创建微调数据生成任务</h2>
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
              placeholder="请输入保存路径，例如：/data/finetune"
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

      <!-- 生成配置 -->
      <el-card class="form-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><Setting /></el-icon>生成配置
            </span>
            <el-tooltip content="配置数据生成的模式和参数" placement="top">
              <el-icon class="info-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>

        <el-form-item label="生成模式" required>
          <el-radio-group v-model="generationForm.config.mode" class="mb-4">
            <el-radio-button value="template">
              <el-icon><List /></el-icon>模板生成
            </el-radio-button>
            <el-radio-button value="custom">
              <el-icon><Edit /></el-icon>自定义生成
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 模板生成配置 -->
        <div class="sub-form" v-if="generationForm.config.mode === 'template'">
          <el-form-item label="选择模板" required>
            <el-select 
              v-model="generationForm.config.template" 
              placeholder="请选择问答模板"
              class="flexible-input"
            >
              <el-option-group label="通用问答">
                <el-option label="知识问答" value="knowledge_qa">
                  <el-icon><Reading /></el-icon>知识问答
                </el-option>
                <el-option label="开放问答" value="open_qa">
                  <el-icon><ChatDotRound /></el-icon>开放问答
                </el-option>
              </el-option-group>
              <el-option-group label="特定领域">
                <el-option label="客服对话" value="customer_service">
                  <el-icon><Service /></el-icon>客服对话
                </el-option>
                <el-option label="技术支持" value="tech_support">
                  <el-icon><Monitor /></el-icon>技术支持
                </el-option>
                <el-option label="医疗咨询" value="medical_qa">
                  <el-icon><FirstAidKit /></el-icon>医疗咨询
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item label="模板参数">
            <el-input
              type="textarea"
              v-model="generationForm.config.templateParams"
              :rows="4"
              placeholder="请输入模板参数（JSON格式），例如：&#x0A;{&#x0A;  &quot;topic&quot;: &quot;手机使用问题&quot;,&#x0A;  &quot;style&quot;: &quot;专业&quot;,&#x0A;  &quot;max_turns&quot;: 3&#x0A;}"
              class="flexible-input"
            />
            <div class="form-item-tip">
              <el-icon><InfoFilled /></el-icon>
              使用JSON格式配置模板参数，包括主题、风格、对话轮数等
            </div>
          </el-form-item>
        </div>

        <!-- 自定义生成配置 -->
        <div class="sub-form" v-else>
          <el-form-item label="系统提示词" required>
            <el-input
              type="textarea"
              v-model="generationForm.config.systemPrompt"
              :rows="3"
              placeholder="请输入系统提示词，用于定义助手的角色和行为"
              class="flexible-input"
            />
            <div class="form-item-tip">
              <el-icon><InfoFilled /></el-icon>
              系统提示词用于定义AI助手的角色、行为和回答风格
            </div>
          </el-form-item>

          <el-form-item label="示例数据" required>
            <div class="examples-container">
              <div v-for="(example, index) in generationForm.config.examples" :key="index" class="example-item">
                <div class="example-header">
                  <span class="example-title">示例 {{ index + 1 }}</span>
                  <el-button type="danger" link @click="removeExample(index)">
                    <el-icon><Delete /></el-icon>删除
                  </el-button>
                </div>
                
                <el-input
                  v-model="example.question"
                  placeholder="输入问题"
                  class="mb-2"
                >
                  <template #prefix>
                    <el-icon><ChatLineRound /></el-icon>
                  </template>
                </el-input>
                <el-input
                  type="textarea"
                  v-model="example.answer"
                  :rows="2"
                  placeholder="输入答案"
                >
                  <template #prefix>
                    <el-icon><ChatSquare /></el-icon>
                  </template>
                </el-input>
              </div>
              
              <el-button type="primary" plain @click="addExample" class="add-example-btn">
                <el-icon><Plus /></el-icon>添加示例
              </el-button>
            </div>
          </el-form-item>
        </div>

        <el-divider content-position="left">通用参数</el-divider>

        <!-- 通用参数配置 -->
        <el-form-item label="生成参数">
          <div class="parameter-grid">
            <el-input-number
              v-model="generationForm.config.maxLength"
              :min="10"
              :max="2000"
              controls-position="right"
              :precision="0"
              style="width: 180px"
            >
              <template #prefix>最大长度</template>
            </el-input-number>
            
            <div class="slider-container">
              <span class="slider-label">随机度：</span>
              <el-slider
                v-model="generationForm.config.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                :format-tooltip="(val) => val.toFixed(1)"
                style="width: 300px"
              />
              <div class="form-item-tip">
                较低的值会使输出更加确定和一致，较高的值会增加输出的多样性
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
  FolderOpened,
  Folder,
  Download,
  Setting,
  List,
  Reading,
  ChatDotRound,
  Service,
  Monitor,
  FirstAidKit,
  ChatLineRound,
  ChatSquare,
  Delete,
  Upload,
  FolderAdd,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据集列表
const datasets = ref([
  { id: 1, name: '通用问答数据集' },
  { id: 2, name: '客服对话数据集' },
  { id: 3, name: '医疗问答数据集' },
  { id: 4, name: '技术支持数据集' }
])

// 表单数据
const generationForm = ref({
  name: '',
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
  config: {
    mode: 'template',
    // 模板模式配置
    template: '',
    templateParams: '',
    // 自定义模式配置
    systemPrompt: '',
    examples: [
      { question: '', answer: '' }
    ],
    // 通用参数
    maxLength: 500,
    temperature: 0.7
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

// 添加示例
const addExample = () => {
  generationForm.value.config.examples.push({ question: '', answer: '' })
}

// 删除示例
const removeExample = (index) => {
  generationForm.value.config.examples.splice(index, 1)
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

  if (generationForm.value.config.mode === 'template') {
    if (!generationForm.value.config.template) {
      ElMessage.warning('请选择问答模板')
      return
    }
  } else {
    if (!generationForm.value.config.systemPrompt) {
      ElMessage.warning('请输入系统提示词')
      return
    }
    if (!generationForm.value.config.examples.length) {
      ElMessage.warning('请至少添加一个示例')
      return
    }
    if (generationForm.value.config.examples.some(e => !e.question || !e.answer)) {
      ElMessage.warning('请完整填写所有示例的问题和答案')
      return
    }
  }

  // TODO: 调用API创建任务
  ElMessage.success('任务创建成功')
  router.push({ name: 'finetune-generation' })
}
</script>

<style scoped>
.finetune-generation-create {
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

.examples-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-item {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 16px;
  background-color: var(--el-bg-color);
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-border-color-darker);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.example-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.add-example-btn {
  align-self: flex-start;
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

.el-divider {
  margin: 24px 0;
}
</style> 