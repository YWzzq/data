<template>
  <div class="create-generation">
    <el-form :model="generationForm" label-width="120px" class="generation-form">
      <!-- 基本信息 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="任务名称" required>
          <el-input 
            v-model="generationForm.name" 
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="生成类型" required>
          <el-radio-group v-model="generationForm.type" class="generation-type-group">
            <el-radio-button label="general">
              <el-icon><Magic /></el-icon>一般数据生成
            </el-radio-button>
            <el-radio-button label="finetune">
              <el-icon><ChatLineRound /></el-icon>大模型微调数据
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生成数量" required>
          <el-input-number 
            v-model="generationForm.count" 
            :min="1" 
            :max="10000"
            controls-position="right"
          />
        </el-form-item>
      </el-card>

      <!-- 一般数据生成配置 -->
      <el-card v-if="generationForm.type === 'general'" class="mb-20">
        <template #header>
          <div class="card-header">
            <span>一般数据生成配置</span>
          </div>
        </template>

        <el-form-item label="数据类型">
          <el-select v-model="generationForm.generalConfig.dataType" placeholder="请选择数据类型">
            <el-option label="文本数据" value="text" />
            <el-option label="图像数据" value="image" />
          </el-select>
        </el-form-item>

        <el-form-item label="增强方式">
          <el-checkbox-group v-model="generationForm.generalConfig.methods">
            <template v-if="generationForm.generalConfig.dataType === 'text'">
              <el-checkbox label="synonym">同义词替换</el-checkbox>
              <el-checkbox label="back_translation">回译</el-checkbox>
              <el-checkbox label="template">模板生成</el-checkbox>
              <el-checkbox label="eda">EDA</el-checkbox>
            </template>
            <template v-else-if="generationForm.generalConfig.dataType === 'image'">
              <el-checkbox label="flip">翻转</el-checkbox>
              <el-checkbox label="rotate">旋转</el-checkbox>
              <el-checkbox label="noise">添加噪声</el-checkbox>
              <el-checkbox label="color">颜色变换</el-checkbox>
            </template>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="数据来源">
          <el-select v-model="generationForm.generalConfig.source" placeholder="请选择数据来源">
            <el-option label="已有数据集" value="dataset" />
            <el-option label="本地上传" value="local" />
          </el-select>
        </el-form-item>

        <el-form-item label="增强参数">
          <div class="parameter-grid">
            <el-input-number
              v-model="generationForm.generalConfig.augmentRatio"
              :min="1"
              :max="10"
              controls-position="right"
            >
              <template #prefix>增强倍数</template>
            </el-input-number>
          </div>
        </el-form-item>
      </el-card>

      <!-- 大模型微调数据配置 -->
      <el-card v-if="generationForm.type === 'finetune'" class="mb-20">
        <template #header>
          <div class="card-header">
            <span>大模型微调数据配置</span>
          </div>
        </template>

        <el-form-item label="任务类型">
          <el-select v-model="generationForm.finetuneConfig.taskType" placeholder="请选择任务类型">
            <el-option label="问答对话" value="qa" />
            <el-option label="文本分类" value="classification" />
            <el-option label="文本生成" value="generation" />
          </el-select>
        </el-form-item>

        <el-form-item label="生成模式">
          <el-radio-group v-model="generationForm.finetuneConfig.mode">
            <el-radio label="template">模板生成</el-radio>
            <el-radio label="custom">自定义生成</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="generationForm.finetuneConfig.mode === 'template'">
          <el-form-item label="选择模板">
            <el-select v-model="generationForm.finetuneConfig.template" placeholder="请选择模板">
              <el-option label="客服对话" value="customer_service" />
              <el-option label="知识问答" value="knowledge_qa" />
              <el-option label="情感对话" value="emotional_chat" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="提示词">
            <el-input
              v-model="generationForm.finetuneConfig.prompt"
              type="textarea"
              :rows="4"
              placeholder="请输入提示词，用于指导数据生成"
            />
          </el-form-item>
        </template>

        <el-form-item label="参数配置">
          <div class="parameter-grid">
            <el-input-number
              v-model="generationForm.finetuneConfig.maxLength"
              :min="10"
              :max="2000"
              controls-position="right"
            >
              <template #prefix>最大长度</template>
            </el-input-number>
            
            <el-slider
              v-model="generationForm.finetuneConfig.temperature"
              :min="0"
              :max="1"
              :step="0.1"
              show-input
            >
              <template #prefix>随机度</template>
            </el-slider>
          </div>
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Magic,
  ChatLineRound
} from '@element-plus/icons-vue'

const router = useRouter()

// 表单数据
const generationForm = ref({
  name: '',
  type: 'general',
  count: 100,
  generalConfig: {
    dataType: 'text',
    methods: [],
    source: 'dataset',
    augmentRatio: 2
  },
  finetuneConfig: {
    taskType: 'qa',
    mode: 'template',
    template: '',
    prompt: '',
    maxLength: 500,
    temperature: 0.7
  }
})

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

  // TODO: 调用API创建任务
  ElMessage.success('任务创建成功')
  router.push('/data-generation')
}
</script>

<style scoped>
.create-generation {
  padding: 20px;
}

.generation-form {
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

.generation-type-group {
  display: flex;
  gap: 12px;
}

.generation-type-group :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
}

.parameter-grid {
  display: grid;
  gap: 16px;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
}

:deep(.el-slider) {
  margin-top: 8px;
}
</style> 