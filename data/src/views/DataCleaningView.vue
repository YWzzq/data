<template>
  <div class="data-cleaning">
    <!-- 步骤引导 -->
    <StepGuide
      title="数据清洗功能引导"
      :steps="guideSteps"
      pageKey="data_cleaning"
    />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">数据清洗任务</h2>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-button type="primary" @click="createNewTask">
          <el-icon><Plus /></el-icon>新建清洗任务
        </el-button>
      </div>
    </div>

    <!-- 任务统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="(stat, index) in taskStats" :key="index">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <el-icon class="stats-icon" :class="stat.type"><component :is="stat.icon" /></el-icon>
            <div class="stats-info">
              <div class="stats-number">{{ stat.number }}</div>
              <div class="stats-title">{{ stat.title }}</div>
            </div>
          </div>
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
              <el-button :disabled="!selectedTasks.length" @click="batchDelete">
                批量删除
              </el-button>
              <el-button :disabled="!selectedTasks.length" @click="batchExport">
                批量导出
              </el-button>
            </el-button-group>
          </div>
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
              <el-icon><Filter /></el-icon>
              <span class="clickable" @click="viewTask(scope.row)">
                {{ scope.row.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="数据类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.dataType === 'text' ? 'primary' : 'success'">
              {{ scope.row.dataType === 'text' ? '文本数据' : '图像数据' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="methods" label="清洗方式" min-width="200">
          <template #default="scope">
            <el-tag 
              v-for="method in scope.row.methods" 
              :key="method"
              size="small"
              class="method-tag"
            >
              {{ method }}
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
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status.type">{{ scope.row.status.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Filter,
  DataLine,
  Loading,
  CircleCheck,
  Warning
} from '@element-plus/icons-vue'
import StepGuide from '@/components/common/StepGuide.vue'

const router = useRouter()

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 任务列表数据
const tasks = ref([
  {
    id: 1,
    name: '新闻文本清洗任务',
    dataType: 'text',
    methods: ['去除特殊字符', '去除emoji', '繁体转简体'],
    progress: 70,
    processed: 700,
    total: 1000,
    status: { type: 'success', text: '进行中' },
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '街景图片清洗任务',
    dataType: 'image',
    methods: ['去模糊', '去重', '调整亮度'],
    progress: 100,
    processed: 500,
    total: 500,
    status: { type: 'info', text: '已完成' },
    createTime: '2024-01-02 14:30:00'
  },
  {
    id: 3,
    name: '商品评论清洗任务',
    dataType: 'text',
    methods: ['去除URL', '去除emoji'],
    progress: 30,
    processed: 300,
    total: 1000,
    status: { type: 'warning', text: '暂停中' },
    createTime: '2024-01-03 09:15:00'
  }
])

// 任务统计
const taskStats = ref([
  {
    title: '总任务数',
    number: tasks.value.length,
    icon: 'DataLine',
    type: 'primary'
  },
  {
    title: '进行中',
    number: tasks.value.filter(t => t.status.text === '进行中').length,
    icon: 'Loading',
    type: 'warning'
  },
  {
    title: '已完成',
    number: tasks.value.filter(t => t.status.text === '已完成').length,
    icon: 'CircleCheck',
    type: 'success'
  },
  {
    title: '异常任务',
    number: tasks.value.filter(t => ['已终止', '暂停中'].includes(t.status.text)).length,
    icon: 'Warning',
    type: 'danger'
  }
])

// 筛选任务
const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value
  return tasks.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 选中的任务
const selectedTasks = ref([])
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

// 创建任务
const createNewTask = () => {
  router.push('/data-cleaning/new-task')
}

// 查看任务详情
const viewTask = (task) => {
  router.push(`/data-cleaning/${task.id}`)
}

// 编辑任务
const editTask = (task) => {
  router.push(`/data-cleaning/${task.id}/edit`)
}

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm(
    '确定要删除该清洗任务吗？此操作不可恢复',
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

// 引导步骤配置
const guideSteps = [
  {
    title: '选择数据',
    description: '选择需要清洗的数据集',
    icon: 'Folder',
    content: `
      <p>在开始数据清洗之前，您需要先选择要处理的数据集：</p>
      <ul>
        <li>支持文本数据和图像数据的清洗</li>
        <li>可以从已有数据集中选择</li>
        <li>也可以上传新的数据文件</li>
      </ul>
    `
  },
  {
    title: '配置规则',
    description: '设置数据清洗规则',
    icon: 'Setting',
    content: `
      <p>根据数据类型，配置相应的清洗规则：</p>
      <ul>
        <li>文本数据：去除特殊字符、统一格式、繁简转换等</li>
        <li>图像数据：去模糊、调整尺寸、优化质量等</li>
        <li>可以组合多个规则，形成清洗流程</li>
      </ul>
    `
  },
  {
    title: '执行清洗',
    description: '开始数据清洗任务',
    icon: 'VideoPlay',
    content: `
      <p>配置完成后，开始执行数据清洗：</p>
      <ul>
        <li>系统会显示实时进度</li>
        <li>可以随时暂停或取消任务</li>
        <li>支持批量处理多个任务</li>
      </ul>
    `
  },
  {
    title: '结果验证',
    description: '验证清洗结果',
    icon: 'Check',
    content: `
      <p>清洗完成后，请验证处理结果：</p>
      <ul>
        <li>预览清洗后的数据</li>
        <li>查看数据统计信息</li>
        <li>导出清洗结果</li>
      </ul>
    `
  }
]
</script>

<style scoped>
.data-cleaning {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 100%;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  font-size: 32px;
  
  &.primary {
    color: var(--el-color-primary);
  }
  
  &.success {
    color: var(--el-color-success);
  }
  
  &.warning {
    color: var(--el-color-warning);
  }
  
  &.danger {
    color: var(--el-color-danger);
  }
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stats-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.task-list-card {
  margin-bottom: 20px;
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

.method-tag {
  margin-right: 4px;
  margin-bottom: 4px;
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