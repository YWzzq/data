<template>
  <div class="ai-annotation-detail">
    <!-- 任务基本信息 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <span>任务信息</span>
          <div class="header-actions">
            <el-button type="primary" @click="editTask">编辑任务</el-button>
            <el-button type="danger" @click="deleteTask">删除任务</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务名称">{{ taskInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="数据类型">{{ taskInfo.dataType }}</el-descriptions-item>
        <el-descriptions-item label="标注类型">{{ taskInfo.annotationType }}</el-descriptions-item>
        <el-descriptions-item label="AI模型">{{ taskInfo.modelName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="taskInfo.status.type">{{ taskInfo.status.text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标注进度" :span="2">
          <div class="progress-info">
            <el-progress :percentage="taskInfo.progress" />
            <span class="progress-text">已标注：{{ taskInfo.annotated }}/{{ taskInfo.total }}</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 标注统计 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <span>标注统计</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-title">AI标注准确率</div>
            <div class="stat-value">{{ statistics.accuracy }}%</div>
            <el-progress
              type="dashboard"
              :percentage="statistics.accuracy"
              :color="customColors"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-title">人工复核率</div>
            <div class="stat-value">{{ statistics.reviewRate }}%</div>
            <el-progress
              type="dashboard"
              :percentage="statistics.reviewRate"
              :color="customColors"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-title">标注一致性</div>
            <div class="stat-value">{{ statistics.consistency }}%</div>
            <el-progress
              type="dashboard"
              :percentage="statistics.consistency"
              :color="customColors"
            />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 标注结果 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>标注结果</span>
          <div class="header-actions">
            <el-button-group>
              <el-button :icon="Download" @click="exportResults">导出结果</el-button>
              <el-button :icon="View" @click="previewResults">预览结果</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-table :data="annotationResults" style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column prop="content" label="原始内容" min-width="200" />
        <el-table-column prop="annotation" label="标注结果" min-width="200" />
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="{ row }">
            {{ row.confidence.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status.type">{{ row.status.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="复核人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="viewAnnotation(row)">查看</el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="reviewAnnotation(row)"
                v-if="row.status.text === '待复核'"
              >
                复核
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="标注结果预览"
      width="70%"
    >
      <div class="preview-content">
        <!-- 根据数据类型显示不同的预览内容 -->
        <template v-if="taskInfo.dataType === '文本'">
          <div class="text-preview">
            <div v-for="(item, index) in previewData" :key="index" class="preview-item">
              <div class="original-text">{{ item.content }}</div>
              <div class="annotation-result">
                <el-tag>{{ item.annotation }}</el-tag>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="taskInfo.dataType === '图像'">
          <div class="image-preview">
            <!-- 图像预览组件 -->
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, View } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const previewVisible = ref(false)
const previewData = ref([])

// 自定义进度条颜色
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#409eff', percentage: 100 }
]

// 任务信息
const taskInfo = ref({
  name: '新闻文本分类标注',
  dataType: '文本',
  annotationType: '文本分类',
  modelName: 'BERT-Classification',
  createTime: '2024-01-15 10:30:00',
  status: { type: 'success', text: '进行中' },
  progress: 75,
  annotated: 750,
  total: 1000
})

// 统计信息
const statistics = ref({
  accuracy: 95,
  reviewRate: 80,
  consistency: 90
})

// 标注结果
const annotationResults = ref([
  {
    content: '这是一条示例文本...',
    annotation: '正面评价',
    confidence: 0.95,
    status: { type: 'success', text: '已完成' },
    reviewer: '审核员A'
  },
  {
    content: '这是另一条示例文本...',
    annotation: '负面评价',
    confidence: 0.85,
    status: { type: 'warning', text: '待复核' },
    reviewer: '-'
  }
])

// 编辑任务
const editTask = () => {
  router.push(`/ai-annotation/${route.params.id}/edit`)
}

// 删除任务
const deleteTask = () => {
  ElMessageBox.confirm(
    '确定要删除该AI标注任务吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // TODO: 调用API删除任务
    ElMessage.success('删除成功')
    router.push('/ai-annotation')
  }).catch(() => {})
}

// 导出结果
const exportResults = () => {
  ElMessage.success('开始导出标注结果')
}

// 预览结果
const previewResults = () => {
  previewData.value = annotationResults.value
  previewVisible.value = true
}

// 查看标注
const viewAnnotation = (row) => {
  // TODO: 实现查看标注详情
  console.log('查看标注:', row)
}

// 复核标注
const reviewAnnotation = (row) => {
  // TODO: 实现标注复核
  console.log('复核标注:', row)
}
</script>

<style scoped>
.ai-annotation-detail {
  padding: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stat-item {
  text-align: center;
  padding: 20px;

  .stat-title {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-color-primary);
    margin-bottom: 16px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.text-preview {
  .preview-item {
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .original-text {
      margin-bottom: 8px;
    }

    .annotation-result {
      display: flex;
      gap: 8px;
    }
  }
}
</style> 