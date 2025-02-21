<template>
  <div class="ai-annotation-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">AI辅助标注</h2>
        <p class="page-desc">使用AI模型辅助数据标注，提高标注效率和准确性</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-button type="primary" @click="createTask">
          <el-icon><Plus /></el-icon>新建AI标注任务
        </el-button>
      </div>
    </div>

    <!-- 任务统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>总任务数</span>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="stats-number">{{ statistics.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>进行中</span>
              <el-icon><Loading /></el-icon>
            </div>
          </template>
          <div class="stats-number">{{ statistics.inProgress }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>已完成</span>
              <el-icon><Select /></el-icon>
            </div>
          </template>
          <div class="stats-number">{{ statistics.completed }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>异常任务</span>
              <el-icon><Warning /></el-icon>
            </div>
          </template>
          <div class="stats-number">{{ statistics.error }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-card class="task-list-card">
      <template #header>
        <div class="card-header">
          <span>任务列表</span>
          <div class="header-actions">
            <el-button-group>
              <el-button :icon="Delete" @click="batchDelete">批量删除</el-button>
              <el-button :icon="Download" @click="batchExport">批量导出</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredTasks"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewTask(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="数据类型" width="120" />
        <el-table-column prop="modelName" label="AI模型" width="150" />
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status.type">{{ row.status.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="viewTask(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editTask(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteTask(row)">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  Document,
  Loading,
  Select,
  Warning,
  Delete,
  Download
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedTasks = ref([])

// 统计数据
const statistics = ref({
  total: 24,
  inProgress: 8,
  completed: 12,
  error: 4
})

// 任务列表数据
const tasks = ref([
  {
    id: 1,
    name: '新闻文本分类标注',
    dataType: '文本',
    modelName: 'BERT-Classification',
    progress: 75,
    status: { type: 'success', text: '进行中' },
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '商品图片标注',
    dataType: '图像',
    modelName: 'YOLO-v5',
    progress: 100,
    status: { type: 'info', text: '已完成' },
    createTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: '医疗文本实体识别',
    dataType: '文本',
    modelName: 'BiLSTM-CRF',
    progress: 30,
    status: { type: 'warning', text: '待处理' },
    createTime: '2024-01-13 09:15:00'
  }
])

// 根据搜索过滤任务
const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value
  const query = searchQuery.value.toLowerCase()
  return tasks.value.filter(task => 
    task.name.toLowerCase().includes(query) ||
    task.dataType.toLowerCase().includes(query) ||
    task.modelName.toLowerCase().includes(query)
  )
})

// 创建新任务
const createTask = () => {
  router.push('/ai-annotation/create')
}

// 查看任务
const viewTask = (task) => {
  router.push(`/ai-annotation/${task.id}`)
}

// 编辑任务
const editTask = (task) => {
  router.push(`/ai-annotation/${task.id}/edit`)
}

// 删除任务
const deleteTask = (task) => {
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
  }).catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请选择要删除的任务')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedTasks.value.length} 个任务吗？此操作不可恢复`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // TODO: 调用API批量删除任务
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 批量导出
const batchExport = () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请选择要导出的任务')
    return
  }
  // TODO: 实现批量导出功能
  ElMessage.success('开始导出数据')
}

// 选择变更
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}
</script>

<style scoped>
.ai-annotation-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
  }

  .page-desc {
    margin: 8px 0 0;
    color: var(--el-text-color-secondary);
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stats-number {
    font-size: 28px;
    font-weight: bold;
    color: var(--el-color-primary);
    text-align: center;
    padding: 10px 0;
  }
}

.task-list-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 