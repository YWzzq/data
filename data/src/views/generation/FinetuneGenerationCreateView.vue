<template>
  <div class="finetune-generation-create">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/data-generation/finetune' }">大模型微调数据</el-breadcrumb-item>
      <el-breadcrumb-item>创建任务</el-breadcrumb-item>
    </el-breadcrumb>

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

        <el-form-item label="任务类型" required>
          <el-select v-model="generationForm.taskType" placeholder="请选择任务类型">
            <el-option label="问答对话" value="qa">
              <el-icon><ChatDotRound /></el-icon>
              <span>问答对话</span>
            </el-option>
            <el-option label="文本分类" value="classification">
              <el-icon><Files /></el-icon>
              <span>文本分类</span>
            </el-option>
            <el-option label="文本生成" value="generation">
              <el-icon><Edit /></el-icon>
              <span>文本生成</span>
            </el-option>
          </el-select>
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

      <!-- 生成模式配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>生成模式配置</span>
          </div>
        </template>

        <el-form-item label="生成模式" required>
          <el-radio-group v-model="generationForm.mode">
            <el-radio label="template">模板生成</el-radio>
            <el-radio label="custom">自定义生成</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="generationForm.mode === 'template'">
          <el-form-item label="选择模板" required>
            <el-select v-model="generationForm.templateConfig.type" placeholder="请选择模板类型">
              <template v-if="generationForm.taskType === 'qa'">
                <el-option label="客服对话" value="customer_service" />
                <el-option label="知识问答" value="knowledge_qa" />
                <el-option label="情感对话" value="emotional_chat" />
              </template>
              <template v-else-if="generationForm.taskType === 'classification'">
                <el-option label="情感分类" value="sentiment" />
                <el-option label="主题分类" value="topic" />
                <el-option label="意图分类" value="intent" />
              </template>
              <template v-else>
                <el-option label="新闻生成" value="news" />
                <el-option label="商品描述" value="product" />
                <el-option label="故事创作" value="story" />
              </template>
            </el-select>
          </el-form-item>

          <el-form-item label="模板参数">
            <el-form-item label="变量配置" class="sub-form-item">
              <div v-for="(variable, index) in templateVariables" :key="index" class="variable-item">
                <span class="variable-name">{{ variable.name }}</span>
                <el-select 
                  v-model="generationForm.templateConfig.variables[variable.key]"
                  :placeholder="'请选择' + variable.name"
                  class="variable-select"
                >
                  <el-option 
                    v-for="option in variable.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>
            </el-form-item>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="提示词配置" required>
            <el-input
              v-model="generationForm.customConfig.prompt"
              type="textarea"
              :rows="4"
              placeholder="请输入提示词，用于指导数据生成"
            />
            <div class="prompt-tips">
              <p>提示词编写建议：</p>
              <ul>
                <li>明确指定任务类型和要求</li>
                <li>提供示例说明期望的输出格式</li>
                <li>指定数据的风格和语气</li>
                <li>设定输出的长度范围</li>
              </ul>
            </div>
          </el-form-item>

          <el-form-item label="示例数据">
            <el-input
              v-model="generationForm.customConfig.examples"
              type="textarea"
              :rows="4"
              placeholder="请输入示例数据，每行一个示例"
            />
          </el-form-item>
        </template>
      </el-card>

      <!-- 参数配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>参数配置</span>
          </div>
        </template>

        <el-form-item label="最大长度">
          <el-input-number
            v-model="generationForm.parameters.maxLength"
            :min="10"
            :max="2000"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="随机度">
          <el-slider
            v-model="generationForm.parameters.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
          <div class="parameter-tips">
            较低的值会使输出更加确定和一致，较高的值会增加输出的多样性
          </div>
        </el-form-item>

        <el-form-item label="质量控制">
          <el-checkbox-group v-model="generationForm.parameters.qualityControl">
            <el-checkbox label="format">格式检查</el-checkbox>
            <el-checkbox label="content">内容审核</el-checkbox>
            <el-checkbox label="diversity">多样性控制</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="高级选项">
          <el-collapse>
            <el-collapse-item title="数据后处理" name="post_processing">
              <el-checkbox-group v-model="generationForm.parameters.postProcessing">
                <el-checkbox label="dedup">去重</el-checkbox>
                <el-checkbox label="clean">清洗</el-checkbox>
                <el-checkbox label="format">格式化</el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
          </el-collapse>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Files,
  Edit
} from '@element-plus/icons-vue'

const router = useRouter()

// 表单数据
const generationForm = ref({
  name: '',
  taskType: '',
  count: 100,
  mode: 'template',
  templateConfig: {
    type: '',
    variables: {}
  },
  customConfig: {
    prompt: '',
    examples: ''
  },
  parameters: {
    maxLength: 500,
    temperature: 0.7,
    qualityControl: ['format'],
    postProcessing: ['dedup', 'clean']
  }
})

// 模板变量配置
const templateVariables = computed(() => {
  const variables = []
  
  if (generationForm.value.mode === 'template') {
    switch(generationForm.value.templateConfig.type) {
      case 'customer_service':
        variables.push(
          {
            key: 'scenario',
            name: '场景',
            options: [
              { label: '产品咨询', value: 'product_inquiry' },
              { label: '售后服务', value: 'after_sales' },
              { label: '投诉处理', value: 'complaint' }
            ]
          },
          {
            key: 'tone',
            name: '语气',
            options: [
              { label: '正式', value: 'formal' },
              { label: '友好', value: 'friendly' },
              { label: '专业', value: 'professional' }
            ]
          }
        )
        break
      case 'sentiment':
        variables.push(
          {
            key: 'category',
            name: '情感类别',
            options: [
              { label: '正面', value: 'positive' },
              { label: '负面', value: 'negative' },
              { label: '中性', value: 'neutral' }
            ]
          }
        )
        break
      case 'news':
        variables.push(
          {
            key: 'topic',
            name: '主题',
            options: [
              { label: '科技', value: 'tech' },
              { label: '财经', value: 'finance' },
              { label: '体育', value: 'sports' }
            ]
          },
          {
            key: 'style',
            name: '风格',
            options: [
              { label: '新闻报道', value: 'report' },
              { label: '评论分析', value: 'analysis' },
              { label: '专题特写', value: 'feature' }
            ]
          }
        )
        break
    }
  }
  
  return variables
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
  if (!generationForm.value.taskType) {
    ElMessage.warning('请选择任务类型')
    return
  }
  if (generationForm.value.mode === 'template' && !generationForm.value.templateConfig.type) {
    ElMessage.warning('请选择模板类型')
    return
  }
  if (generationForm.value.mode === 'custom' && !generationForm.value.customConfig.prompt.trim()) {
    ElMessage.warning('请输入提示词')
    return
  }

  // TODO: 调用API创建任务
  ElMessage.success('任务创建成功')
  router.push({ name: 'finetune-generation' })
}
</script>

<style scoped>
.finetune-generation-create {
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

.sub-form-item {
  margin-bottom: 0;
}

.variable-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.variable-name {
  width: 80px;
  margin-right: 12px;
  color: var(--el-text-color-regular);
}

.variable-select {
  flex: 1;
}

.prompt-tips {
  margin-top: 12px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  
  p {
    margin: 0 0 8px;
    color: var(--el-text-color-regular);
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: var(--el-text-color-secondary);
  }
}

.parameter-tips {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 