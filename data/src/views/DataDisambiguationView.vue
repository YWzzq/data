<template>
  <div class="data-disambiguation-page">
    <h1>数据消歧</h1>
    <el-card>
      <p>您可以使用平台提供的数据消歧功能对数据集进行消歧处理。完成数据消歧后，可提升数据准确性，减少歧义。</p>
    </el-card>

    <el-card>
      <el-table :data="taskList" style="width: 100%">
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="progress" label="进度">
          <template #default="scope">
            <el-progress :percentage="scope.row.progress" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-button type="primary" @click="createNewTask">新建任务</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElTable, ElTableColumn, ElProgress, ElButton } from 'element-plus'

const taskList = ref([
  { name: '任务1', status: '进行中', progress: 50 },
  { name: '任务2', status: '已完成', progress: 100 },
  { name: '任务3', status: '待处理', progress: 0 }
])

const router = useRouter()

const createNewTask = () => {
  router.push('/data-disambiguation/new-data-disambiguation-task')
}
</script>

<style scoped>
.data-disambiguation-page {
  padding: 20px;
}
</style> 