<template>
  <div class="data-cleaning-page">
    <h1>数据清洗</h1>
    <el-card>
      <p>您可以使用平台提供的数据清洗功能对图像数据集和文本数据集进行清洗。完成数据清洗后，可提升数据质量，方便进行下一步的数据标注等操作。</p>
      <p>1、可以对数据集中的图片进行去模糊、去近似、批量旋转、批量镜像等多种基础清洗服务。</p>
      <p>2、可以对文本数据进行去emoji，去url和繁体转简体的操作。</p>
      <p>3、可以定制清洗方案通过选择在线模型或导入本地模型进行数据清洗。</p>
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
  router.push('/data-cleaning/new-task')
}
</script>

<style scoped>
.data-cleaning-page {
  padding: 20px;
}
</style>