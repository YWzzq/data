<template>
  <div class="edit-ai-annotation">
    <el-form :model="annotationForm" label-width="120px" class="annotation-form">
      <!-- 基本信息 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="任务名称" required>
          <el-input 
            v-model="annotationForm.name" 
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="数据类型" required>
          <el-select v-model="annotationForm.dataType" placeholder="请选择数据类型">
            <el-option label="文本" value="text" />
            <el-option label="图像" value="image" />
          </el-select>
        </el-form-item>

        <el-form-item label="标注类型" required>
          <el-select v-model="annotationForm.annotationType" placeholder="请选择标注类型">
            <template v-if="annotationForm.dataType === 'text'">
              <el-option label="文本分类" value="text_classification" />
              <el-option label="序列标注" value="sequence_labeling" />
              <el-option label="关系抽取" value="relation_extraction" />
            </template>
            <template v-else-if="annotationForm.dataType === 'image'">
              <el-option label="图像分类" value="image_classification" />
              <el-option label="目标检测" value="object_detection" />
              <el-option label="图像分割" value="image_segmentation" />
            </template>
          </el-select>
        </el-form-item>
      </el-card>

      <!-- AI模型配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>AI模型配置</span>
          </div>
        </template>

        <el-form-item label="选择模型">
          <el-select v-model="annotationForm.model" placeholder="请选择AI模型">
            <el-option label="通用模型" value="general" />
            <el-option label="专业模型" value="professional" />
            <el-option label="自定义模型" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="置信度阈值">
          <el-slider
            v-model="annotationForm.confidenceThreshold"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <el-form-item label="批处理大小">
          <el-input-number
            v-model="annotationForm.batchSize"
            :min="1"
            :max="100"
            controls-position="right"
          />
        </el-form-item>
      </el-card>

      <!-- 质量控制 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>质量控制</span>
          </div>
        </template>

        <el-form-item label="人工审核">
          <el-switch v-model="annotationForm.requireReview" />
        </el-form-item>

        <el-form-item label="审核策略" v-if="annotationForm.requireReview">
          <el-radio-group v-model="annotationForm.reviewStrategy">
            <el-radio label="all">全量审核</el-radio>
            <el-radio label="sample">抽样审核</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="抽样比例" v-if="annotationForm.requireReview && annotationForm.reviewStrategy === 'sample'">
          <el-input-number
            v-model="annotationForm.sampleRate"
            :min="1"
            :max="100"
            controls-position="right"
          >
            <template #suffix>%</template>
          </el-input-number>
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="saveTask">保存修改</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 表单数据
const annotationForm = ref({
  name: '',
  dataType: '',
  annotationType: '',
  model: 'general',
  confidenceThreshold: 0.8,
  batchSize: 32,
  requireReview: true,
  reviewStrategy: 'sample',
  sampleRate: 20
})

// 加载任务数据
const loadTask = () => {
  // TODO: 从API获取任务数据
  // 模拟数据
  const mockData = {
    name: '示例AI标注任务',
    dataType: 'text',
    annotationType: 'text_classification',
    model: 'general',
    confidenceThreshold: 0.8,
    batchSize: 32,
    requireReview: true,
    reviewStrategy: 'sample',
    sampleRate: 20
  }
  Object.assign(annotationForm.value, mockData)
}

// 取消编辑
const cancel = () => {
  router.back()
}

// 保存任务
const saveTask = () => {
  // 表单验证
  if (!annotationForm.value.name.trim()) {
    ElMessage.warning('请输入任务名称')
    return
  }
  if (!annotationForm.value.dataType) {
    ElMessage.warning('请选择数据类型')
    return
  }
  if (!annotationForm.value.annotationType) {
    ElMessage.warning('请选择标注类型')
    return
  }

  // TODO: 调用API保存任务
  ElMessage.success('保存成功')
  router.back()
}

// 页面加载时获取任务数据
onMounted(() => {
  loadTask()
})
</script>

<style scoped>
.edit-ai-annotation {
  padding: 20px;
}

.annotation-form {
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

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
}
</style> 