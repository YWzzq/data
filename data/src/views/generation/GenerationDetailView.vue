<template>
  <div class="generation-detail">
    <!-- 基本信息卡片 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2 class="task-name">{{ task.name }}</h2>
            <el-tag class="ml-2" :type="task.status.type">{{ task.status.text }}</el-tag>
          </div>
          <div class="header-right">
            <el-button-group>
              <el-button @click="pauseTask" :disabled="!canPause">
                <el-icon><VideoPause /></el-icon>暂停
              </el-button>
              <el-button type="primary" @click="resumeTask" :disabled="!canResume">
                <el-icon><VideoPlay /></el-icon>继续
              </el-button>
              <el-button type="danger" @click="stopTask" :disabled="!canStop">
                <el-icon><CircleClose /></el-icon>停止
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="生成类型">{{ task.type }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ task.createTime }}</el-descriptions-item>
        <el-descriptions-item label="预计完成时间">{{ task.estimatedTime }}</el-descriptions-item>
        <el-descriptions-item label="已生成数量">{{ task.generated }}/{{ task.total }}</el-descriptions-item>
        <el-descriptions-item label="成功率">{{ task.successRate }}%</el-descriptions-item>
        <el-descriptions-item label="剩余时间">{{ task.remainingTime }}</el-descriptions-item>
      </el-descriptions>

      <div class="progress-info mt-20">
        <div class="progress-header">
          <span>生成进度</span>
          <span class="progress-text">{{ task.generated }}/{{ task.total }}</span>
        </div>
        <el-progress :percentage="task.progress" :status="task.status.type" />
      </div>
    </el-card>

    <!-- 生成结果预览 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>生成结果</span>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索结果..."
              prefix-icon="Search"
              class="search-input mr-2"
            />
            <el-button-group>
              <el-button @click="refreshResults">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
              <el-button type="primary" @click="exportResults">
                <el-icon><Download /></el-icon>导出
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 文本生成结果 -->
      <template v-if="task.type === '文本生成'">
        <el-table :data="filteredResults" style="width: 100%">
          <el-table-column type="index" width="50" />
          <el-table-column prop="content" label="生成内容" min-width="400">
            <template #default="scope">
              <div class="text-content">{{ scope.row.content }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status.type" size="small">
                {{ scope.row.status.text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="生成时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button text size="small" @click="copyContent(scope.row)">复制</el-button>
              <el-button text size="small" type="danger" @click="deleteResult(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 图像生成结果 -->
      <template v-else-if="task.type === '图像生成'">
        <el-row :gutter="20">
          <el-col 
            v-for="result in filteredResults" 
            :key="result.id" 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6"
          >
            <el-card class="image-card" :body-style="{ padding: '0px' }">
              <el-image 
                :src="result.imageUrl" 
                fit="cover"
                :preview-src-list="[result.imageUrl]"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
              <div class="image-info">
                <div class="info-row">
                  <el-tag size="small" :type="result.status.type">{{ result.status.text }}</el-tag>
                  <span class="time">{{ result.createTime }}</span>
                </div>
                <div class="operations">
                  <el-button text size="small" @click="downloadImage(result)">下载</el-button>
                  <el-button text size="small" type="danger" @click="deleteResult(result)">删除</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- 数据增强结果 -->
      <template v-else>
        <el-table :data="filteredResults" style="width: 100%">
          <el-table-column type="index" width="50" />
          <el-table-column prop="original" label="原始数据" min-width="300" />
          <el-table-column prop="enhanced" label="增强结果" min-width="300" />
          <el-table-column prop="method" label="增强方式" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status.type" size="small">
                {{ scope.row.status.text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button text size="small" @click="copyContent(scope.row)">复制</el-button>
              <el-button text size="small" type="danger" @click="deleteResult(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredResults.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoPause,
  VideoPlay,
  CircleClose,
  Search,
  Refresh,
  Download,
  Picture
} from '@element-plus/icons-vue'

const route = useRoute()

// 任务信息
const task = ref({
  id: route.params.id,
  name: '新闻文本生成任务',
  type: '文本生成',
  status: { type: 'success', text: '进行中' },
  createTime: '2024-01-01 10:00:00',
  estimatedTime: '2024-01-01 12:00:00',
  remainingTime: '1小时20分钟',
  generated: 700,
  total: 1000,
  progress: 70,
  successRate: 98.5
})

// 控制按钮状态
const canPause = computed(() => task.value.status.text === '进行中')
const canResume = computed(() => task.value.status.text === '已暂停')
const canStop = computed(() => ['进行中', '已暂停'].includes(task.value.status.text))

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 生成结果数据
const results = ref([
  // 文本生成结果示例
  {
    id: 1,
    content: '这是一段生成的新闻文本内容...',
    status: { type: 'success', text: '成功' },
    createTime: '2024-01-01 10:30:00'
  },
  // 图片生成结果示例
  {
    id: 2,
    imageUrl: 'https://example.com/image1.jpg',
    status: { type: 'success', text: '成功' },
    createTime: '2024-01-01 10:35:00'
  }
])

// 筛选结果
const filteredResults = computed(() => {
  if (!searchQuery.value) return results.value
  return results.value.filter(item => {
    if (task.value.type === '文本生成') {
      return item.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    }
    return true
  })
})

// 任务控制
const pauseTask = () => {
  ElMessageBox.confirm(
    '确定要暂停当前任务吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    task.value.status = { type: 'warning', text: '已暂停' }
    ElMessage.success('任务已暂停')
  }).catch(() => {})
}

const resumeTask = () => {
  task.value.status = { type: 'success', text: '进行中' }
  ElMessage.success('任务已恢复')
}

const stopTask = () => {
  ElMessageBox.confirm(
    '确定要停止当前任务吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    task.value.status = { type: 'danger', text: '已停止' }
    ElMessage.success('任务已停止')
  }).catch(() => {})
}

// 结果操作
const refreshResults = () => {
  ElMessage.success('结果已更新')
}

const exportResults = () => {
  ElMessage.success('开始导出结果')
}

const copyContent = (result) => {
  const content = task.value.type === '文本生成' ? result.content : \`原始：\${result.original}\\n增强：\${result.enhanced}\`
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制到剪贴板')
}

const downloadImage = (result) => {
  // TODO: 实现图片下载逻辑
  ElMessage.success('开始下载图片')
}

const deleteResult = (result) => {
  ElMessageBox.confirm(
    '确定要删除该结果吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = results.value.findIndex(r => r.id === result.id)
    if (index !== -1) {
      results.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.generation-detail {
  padding: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
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

.task-name {
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

.progress-info {
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .progress-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.text-content {
  white-space: pre-wrap;
  word-break: break-all;
}

.image-card {
  margin-bottom: 20px;
  
  .el-image {
    width: 100%;
    height: 200px;
  }

  .image-error {
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    
    .el-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }

  .image-info {
    padding: 12px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .operations {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 