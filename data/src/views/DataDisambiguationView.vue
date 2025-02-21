<template>
  <div class="data-disambiguation">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">数据消歧任务</h2>
        <p class="page-description">支持文本语义消歧、实体消歧、关系消歧、属性消歧等多种消歧任务</p>
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
          <el-icon><Plus /></el-icon>新建消歧任务
        </el-button>
      </div>
    </div>

    <!-- 任务统计卡片 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="6" v-for="stat in taskStats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="24" :class="stat.type">
              <component :is="stat.icon" />
            </el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>消歧任务列表</span>
          <el-button-group>
            <el-button :disabled="!selectedTasks.length" @click="batchDelete">
              批量删除
            </el-button>
            <el-button :disabled="!selectedTasks.length" @click="batchExport">
              批量导出
            </el-button>
          </el-button-group>
        </div>
      </template>

      <el-table 
        :data="filteredTasks" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="scope">
            <div class="name-cell">
              <el-icon><Aim /></el-icon>
              <span class="clickable" @click="viewTask(scope.row)">
                {{ scope.row.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="消歧类型" width="150">
          <template #default="scope">
            <el-tag :type="getDisambiguationType(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="scope">
            <div class="progress-cell">
              <el-progress :percentage="scope.row.progress" />
              <span class="progress-text">{{ scope.row.processed }}/{{ scope.row.total }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status.type">{{ scope.row.status.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button text size="small" @click="viewTask(scope.row)">查看</el-button>
            <el-button text size="small" type="primary" @click="editTask(scope.row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="deleteTask(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTasks.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 功能引导 -->
    <StepGuide
      title="数据消歧功能引导"
      :steps="guideSteps"
      pageKey="data_disambiguation"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Aim,
  Document,
  Setting,
  ChatLineRound
} from '@element-plus/icons-vue'
import StepGuide from '@/components/common/StepGuide.vue'

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedTasks = ref([])

// 引导步骤配置
const guideSteps = [
  {
    title: '创建消歧任务',
    description: '选择消歧类型（文本语义、实体、关系、属性），配置消歧参数',
    icon: 'Plus'
  },
  {
    title: '数据准备',
    description: '选择需要消歧的数据集，支持多种数据格式导入',
    icon: 'Document'
  },
  {
    title: '规则配置',
    description: '设置消歧规则、上下文分析、知识库匹配等参数',
    icon: 'Setting'
  },
  {
    title: '执行消歧',
    description: '启动消歧任务，实时监控进度和结果',
    icon: 'VideoPlay'
  },
  {
    title: '结果验证',
    description: '预览消歧结果，人工确认和修正，导出处理后的数据',
    icon: 'Check'
  }
]

// 任务统计数据
const taskStats = ref([
  {
    title: '总任务数',
    number: '7',
    icon: 'Aim',
    type: 'primary'
  },
  {
    title: '进行中',
    number: '2',
    icon: 'Loading',
    type: 'warning'
  },
  {
    title: '已完成',
    number: '4',
    icon: 'CircleCheck',
    type: 'success'
  },
  {
    title: '异常任务',
    number: '1',
    icon: 'Warning',
    type: 'danger'
  }
])

// 任务列表数据
const tasks = ref([
  {
    id: 1,
    name: '实体消歧任务',
    type: '实体消歧',
    progress: 70,
    processed: 700,
    total: 1000,
    status: { type: 'success', text: '进行中' },
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '文本语义消歧',
    type: '语义消歧',
    progress: 30,
    processed: 300,
    total: 1000,
    status: { type: 'warning', text: '等待中' },
    createTime: '2024-01-02 15:30:00'
  },
  {
    id: 3,
    name: '关系消歧处理',
    type: '关系消歧',
    progress: 100,
    processed: 500,
    total: 500,
    status: { type: 'info', text: '已完成' },
    createTime: '2024-01-03 09:00:00'
  }
])

// 筛选任务
const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value
  return tasks.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 获取消歧类型标签样式
const getDisambiguationType = (type) => {
  const typeMap = {
    '实体消歧': 'success',
    '语义消歧': 'warning',
    '关系消歧': 'info',
    '属性消歧': 'primary'
  }
  return typeMap[type] || 'info'
}

// 选中任务变更
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

// 创建任务
const createTask = () => {
  router.push('/data-disambiguation/create')
}

// 查看任务
const viewTask = (task) => {
  router.push(`/data-disambiguation/${task.id}`)
}

// 编辑任务
const editTask = (task) => {
  router.push(`/data-disambiguation/${task.id}/edit`)
}

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm(
    '确定要删除该消歧任务吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 批量删除
const batchDelete = () => {
  if (!selectedTasks.value.length) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedTasks.value.length} 个任务吗？此操作不可恢复`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    selectedTasks.value.forEach(task => {
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    })
    ElMessage.success('批量删除成功')
    selectedTasks.value = []
  }).catch(() => {})
}

// 批量导出
const batchExport = () => {
  if (!selectedTasks.value.length) return
  ElMessage.success('开始导出选中的任务数据')
}
</script>

<style scoped>
.data-disambiguation {
  padding: 20px;
}

.page-header {
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

  .page-description {
    margin: 8px 0 0;
    color: var(--el-text-color-secondary);
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .el-icon {
    font-size: 24px;
    padding: 12px;
    border-radius: 8px;
    
    &.primary {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
    
    &.success {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
    
    &.warning {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
    
    &.danger {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }
  }

  .stat-info {
    .stat-number {
      font-size: 24px;
      font-weight: 500;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-title {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clickable {
  color: var(--el-color-primary);
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 