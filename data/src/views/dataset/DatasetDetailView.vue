<template>
  <div class="dataset-detail-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/datasets' }">数据集管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ dataset.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 数据集基本信息卡片 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2 class="dataset-name">{{ dataset.name }}</h2>
            <el-tag class="ml-2" :type="dataset.status.type">{{ dataset.status.text }}</el-tag>
          </div>
          <div class="header-right">
            <el-button-group>
              <el-button type="primary" @click="editDataset">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="danger" @click="deleteDataset">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="数据类型">{{ dataset.type }}</el-descriptions-item>
        <el-descriptions-item label="数据量">{{ dataset.size }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ dataset.createTime }}</el-descriptions-item>
        <el-descriptions-item label="标注类型">{{ dataset.annotationType }}</el-descriptions-item>
        <el-descriptions-item label="标注模板">{{ dataset.annotationTemplate }}</el-descriptions-item>
        <el-descriptions-item label="存储位置">{{ dataset.storageType }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>数据统计</span>
          <el-button-group>
            <el-button @click="refreshStats">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
            <el-button @click="exportStats">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </el-button-group>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-title">总数据量</div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-chart">
              <!-- TODO: 添加数据趋势图表 -->
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-title">已标注数据</div>
            <div class="stat-value">{{ stats.annotated }}</div>
            <el-progress 
              :percentage="stats.annotatedPercentage" 
              :color="customColors"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-title">标注任务</div>
            <div class="stat-value">{{ stats.tasks }}</div>
            <div class="stat-detail">
              进行中：{{ stats.activeTasks }}
              已完成：{{ stats.completedTasks }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据预览卡片 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>数据预览</span>
          <div class="header-operations">
            <el-input
              v-model="previewSearchQuery"
              placeholder="搜索数据..."
              prefix-icon="Search"
              class="search-input mr-2"
            />
            <el-button-group>
              <el-button @click="refreshPreview">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
              <el-button @click="exportSelected">
                <el-icon><Download /></el-icon>导出选中
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-table 
        :data="filteredPreviewData" 
        style="width: 100%"
        @selection-change="handlePreviewSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="内容" min-width="300" />
        <el-table-column prop="annotationStatus" label="标注状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.annotationStatus.type" size="small">
              {{ scope.row.annotationStatus.text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button text size="small" @click="viewData(scope.row)">查看</el-button>
            <el-button text size="small" type="danger" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="previewCurrentPage"
          v-model:page-size="previewPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredPreviewData.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Delete,
  Refresh,
  Download,
  Search
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 数据集信息
const dataset = ref({
  id: route.params.id,
  name: '新闻分类数据集',
  type: '文本分类',
  size: '1000条',
  createTime: '2024-01-01 10:00:00',
  status: { type: 'success', text: '已完成' },
  annotationType: '文本分类',
  annotationTemplate: '单标签',
  storageType: '平台存储'
})

// 统计信息
const stats = ref({
  total: 1000,
  annotated: 700,
  annotatedPercentage: 70,
  tasks: 5,
  activeTasks: 2,
  completedTasks: 3
})

// 进度条颜色
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// 预览数据
const previewData = ref([
  {
    id: 1,
    content: '这是一条新闻文本...',
    annotationStatus: { type: 'success', text: '已标注' },
    updateTime: '2024-01-02 15:30:00'
  },
  {
    id: 2,
    content: '这是另一条新闻文本...',
    annotationStatus: { type: 'warning', text: '待审核' },
    updateTime: '2024-01-02 16:00:00'
  }
])

// 预览搜索和分页
const previewSearchQuery = ref('')
const previewCurrentPage = ref(1)
const previewPageSize = ref(10)

const filteredPreviewData = computed(() => {
  if (!previewSearchQuery.value) return previewData.value
  return previewData.value.filter(item =>
    item.content.toLowerCase().includes(previewSearchQuery.value.toLowerCase())
  )
})

// 预览数据选择
const selectedPreviewData = ref([])
const handlePreviewSelectionChange = (selection) => {
  selectedPreviewData.value = selection
}

// 数据集操作
const editDataset = () => {
  router.push(`/datasets/${dataset.value.id}/edit`)
}

const deleteDataset = () => {
  ElMessageBox.confirm(
    '确定要删除该数据集吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功')
    router.push('/datasets')
  }).catch(() => {})
}

// 统计操作
const refreshStats = () => {
  // TODO: 实现统计刷新逻辑
  ElMessage.success('统计数据已更新')
}

const exportStats = () => {
  // TODO: 实现统计导出逻辑
  ElMessage.success('开始导出统计数据')
}

// 预览操作
const refreshPreview = () => {
  // TODO: 实现预览刷新逻辑
  ElMessage.success('预览数据已更新')
}

const exportSelected = () => {
  if (!selectedPreviewData.value.length) {
    ElMessage.warning('请选择要导出的数据')
    return
  }
  // TODO: 实现选中数据导出逻辑
  ElMessage.success('开始导出选中数据')
}

const viewData = (data) => {
  // TODO: 实现数据查看逻辑
  console.log('View data:', data)
}

const deleteData = (data) => {
  ElMessageBox.confirm(
    '确定要删除该条数据吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = previewData.value.findIndex(d => d.id === data.id)
    if (index !== -1) {
      previewData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.dataset-detail-page {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.ml-2 {
  margin-left: 8px;
}

.mr-2 {
  margin-right: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dataset-name {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.header-operations {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 250px;
}

.stat-card {
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  height: 100%;

  .stat-title {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .stat-detail {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 8px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 