<template>
  <div class="finetune-generation">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button type="primary" @click="createGeneration">
          <el-icon><Plus /></el-icon>新建微调数据生成任务
        </el-button>
      </div>
      <div class="right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务..."
          :prefix-icon="Search"
          class="search-input mr-2"
        />
      </div>
    </div>

    <!-- 任务列表 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>大模型微调数据生成任务列表</span>
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
              <el-icon><ChatLineRound /></el-icon>
              <span class="clickable" @click="viewTask(scope.row)">
                {{ scope.row.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="taskType" label="任务类型" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.taskType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mode" label="生成模式" width="120">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.mode === 'template'">模板生成</el-tag>
            <el-tag type="warning" v-else>自定义生成</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="scope">
            <div class="progress-cell">
              <el-progress :percentage="scope.row.progress" />
              <span class="progress-text">{{ scope.row.generated }}/{{ scope.row.total }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  ChatLineRound
} from '@element-plus/icons-vue'

const router = useRouter()

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 任务列表数据
const tasks = ref([
  {
    id: 1,
    name: '客服对话数据生成-模板',
    taskType: '问答对话',
    mode: 'template',
    progress: 70,
    generated: 700,
    total: 1000,
    status: { type: 'success', text: '进行中' },
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '情感分析数据生成-自定义',
    taskType: '文本分类',
    mode: 'custom',
    progress: 100,
    generated: 500,
    total: 500,
    status: { type: 'info', text: '已完成' },
    createTime: '2024-01-03 09:00:00'
  },
  {
    id: 3,
    name: '产品描述生成-模板',
    taskType: '文本生成',
    mode: 'template',
    progress: 30,
    generated: 300,
    total: 1000,
    status: { type: 'warning', text: '暂停中' },
    createTime: '2024-01-05 14:00:00'
  },
  {
    id: 4,
    name: '多轮对话生成-自定义',
    taskType: '问答对话',
    mode: 'custom',
    progress: 0,
    generated: 0,
    total: 800,
    status: { type: 'danger', text: '已终止' },
    createTime: '2024-01-06 16:00:00'
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
const createGeneration = () => {
  router.push('/data-generation/finetune/create')
}

// 查看任务详情
const viewTask = (task) => {
  router.push(`/data-generation/finetune/${task.id}`)
}

// 编辑任务
const editTask = (task) => {
  router.push(`/data-generation/finetune/${task.id}/edit`)
}

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm(
    '确定要删除该生成任务吗？此操作不可恢复',
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
.finetune-generation {
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 300px;
}

.mt-20 {
  margin-top: 20px;
}

.mr-2 {
  margin-right: 8px;
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