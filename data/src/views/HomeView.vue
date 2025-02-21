<script setup>
import { ref } from 'vue'

const statsCards = ref([
  {
    title: '数据集总数',
    number: '8',
    description: '个数据集',
    icon: 'Folder'
  },
  {
    title: '标注任务',
    number: '12',
    description: '个进行中的任务',
    icon: 'Edit'
  },
  {
    title: '已标注数据',
    number: '2,451',
    description: '条数据已标注',
    icon: 'Check'
  },
  {
    title: '标注准确率',
    number: '95.8%',
    description: '平均准确率',
    icon: 'DataLine'
  }
])

const recentTasks = ref([
  {
    name: '文本分类任务-001',
    type: '文本分类',
    progress: 70,
    status: { type: 'success', text: '进行中' }
  },
  {
    name: '情感分析数据集',
    type: '文本标注',
    progress: 30,
    status: { type: 'warning', text: '待处理' }
  },
  {
    name: '实体识别任务',
    type: '序列标注',
    progress: 100,
    status: { type: 'info', text: '已完成' }
  }
])
</script>

<template>
  <div class="home">
    <el-row :gutter="20">
      <!-- 数据概览卡片 -->
      <el-col :span="6" v-for="card in statsCards" :key="card.title">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>{{ card.title }}</span>
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ card.number }}</div>
            <div class="description">{{ card.description }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近标注任务</span>
              <el-button text>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="name" label="任务名称" />
            <el-table-column prop="type" label="标注类型" />
            <el-table-column prop="progress" label="进度">
              <template #default="scope">
                <el-progress :percentage="scope.row.progress" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status.type">{{ scope.row.status.text }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速入门</span>
            </div>
          </template>
          <el-steps direction="vertical" :active="1">
            <el-step title="创建数据集" description="上传或导入您的数据" />
            <el-step title="配置标注任务" description="设置标注规则和标签" />
            <el-step title="开始标注" description="进行数据标注工作" />
            <el-step title="导出结果" description="导出标注完成的数据" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
  width: 100%;
}

.stats-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.number {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.mt-20 {
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .stats-card {
    margin-bottom: 15px;
  }
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-card) {
  height: 100%;
}
</style>
