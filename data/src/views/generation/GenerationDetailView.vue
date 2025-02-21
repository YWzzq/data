<template>
  <div class="generation-detail">
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
        <el-descriptions-item label="生成类型">
          <el-tag :type="taskInfo.type === 'general' ? 'success' : 'warning'">
            {{ taskInfo.type === 'general' ? '一般数据生成' : '大模型微调数据' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="taskInfo.status.type">{{ taskInfo.status.text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="生成进度" :span="2">
          <div class="progress-info">
            <el-progress :percentage="taskInfo.progress" />
            <span class="progress-text">已生成：{{ taskInfo.generated }}/{{ taskInfo.total }}</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 配置信息 -->
    <el-card v-if="taskInfo.type === 'general'" class="mb-20">
      <template #header>
        <div class="card-header">
          <span>一般数据生成配置</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="数据类型">{{ taskInfo.generalConfig.dataType }}</el-descriptions-item>
        <el-descriptions-item label="数据来源">{{ taskInfo.generalConfig.source }}</el-descriptions-item>
        <el-descriptions-item label="增强方式" :span="2">
          <el-tag 
            v-for="method in taskInfo.generalConfig.methods" 
            :key="method"
            class="mr-1"
          >
            {{ method }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="增强倍数">{{ taskInfo.generalConfig.augmentRatio }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-else class="mb-20">
      <template #header>
        <div class="card-header">
          <span>大模型微调数据配置</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务类型">{{ taskInfo.finetuneConfig.taskType }}</el-descriptions-item>
        <el-descriptions-item label="生成模式">{{ taskInfo.finetuneConfig.mode }}</el-descriptions-item>
        <el-descriptions-item label="模板" v-if="taskInfo.finetuneConfig.mode === 'template'">
          {{ taskInfo.finetuneConfig.template }}
        </el-descriptions-item>
        <el-descriptions-item label="提示词" v-else :span="2">
          {{ taskInfo.finetuneConfig.prompt }}
        </el-descriptions-item>
        <el-descriptions-item label="最大长度">{{ taskInfo.finetuneConfig.maxLength }}</el-descriptions-item>
        <el-descriptions-item label="随机度">{{ taskInfo.finetuneConfig.temperature }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 生成结果 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>生成结果</span>
          <div class="header-actions">
            <el-button type="primary" @click="exportData">
              <el-icon><Download /></el-icon>导出数据
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="generatedData" style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column prop="content" label="生成内容" min-width="300" />
        <el-table-column prop="createTime" label="生成时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status.type">{{ scope.row.status.text }}</el-tag>
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 任务信息
const taskInfo = ref({
  name: '示例任务',
  type: route.path.includes('/general/') ? 'general' : 'finetune',
  createTime: '2024-01-01 10:00:00',
  status: { type: 'success', text: '进行中' },
  progress: 70,
  generated: 700,
  total: 1000,
  generalConfig: {
    dataType: '文本数据',
    methods: ['同义词替换', '回译', '句式改写'],
    source: '已有数据集',
    augmentRatio: 2
  },
  finetuneConfig: {
    taskType: '问答对话',
    mode: 'template',
    template: '客服对话',
    prompt: '',
    maxLength: 500,
    temperature: 0.7
  }
})

// 生成结果分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(1000)

// 生成结果数据
const generatedData = ref([
  {
    content: '这是一个生成的示例内容...',
    createTime: '2024-01-01 10:30:00',
    status: { type: 'success', text: '成功' }
  },
  {
    content: '这是另一个生成的示例内容...',
    createTime: '2024-01-01 10:31:00',
    status: { type: 'success', text: '成功' }
  }
])

// 编辑任务
const editTask = () => {
  router.push(route.path + '/edit')
}

// 删除任务
const deleteTask = () => {
  ElMessageBox.confirm(
    '确定要删除该生成任务吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // TODO: 调用API删除任务
    ElMessage.success('删除成功')
    router.back()
  }).catch(() => {})
}

// 导出数据
const exportData = () => {
  ElMessage.success('开始导出数据')
}
</script>

<style scoped>
.generation-detail {
  padding: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mr-1 {
  margin-right: 4px;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 