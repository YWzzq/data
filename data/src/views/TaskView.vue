<template>
  <div class="task-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>创建标注任务
        </el-button>
        <el-button-group class="ml-4">
          <el-button :type="viewMode === 'card' ? 'primary' : ''" @click="viewMode = 'card'">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button :type="viewMode === 'table' ? 'primary' : ''" @click="viewMode = 'table'">
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      <div class="right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务..."
          prefix-icon="Search"
          class="search-input"
        />
      </div>
    </div>

    <!-- 任务列表 - 表格视图 -->
    <el-card v-if="viewMode === 'table'" class="mt-20">
      <el-table :data="filteredTasks" style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="scope">
            <div class="name-cell">
              <el-icon><Edit /></el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="datasetName" label="数据集" width="150" />
        <el-table-column prop="type" label="标注类型" width="120" />
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="scope">
            <div class="progress-cell">
              <el-progress :percentage="scope.row.progress" />
              <span class="progress-text">{{ scope.row.annotated }}/{{ scope.row.total }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status.type">{{ scope.row.status.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button text size="small" @click="startAnnotation(scope.row)">开始标注</el-button>
            <el-button text size="small" type="primary" @click="editTask(scope.row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="deleteTask(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 任务列表 - 卡片视图 -->
    <div v-else class="task-cards mt-20">
      <el-row :gutter="20">
        <el-col :span="8" v-for="task in filteredTasks" :key="task.id">
          <el-card class="task-card">
            <template #header>
              <div class="card-header">
                <span class="task-name">{{ task.name }}</span>
                <el-dropdown>
                  <el-button text>
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="startAnnotation(task)">开始标注</el-dropdown-item>
                      <el-dropdown-item @click="editTask(task)">编辑任务</el-dropdown-item>
                      <el-dropdown-item divided @click="deleteTask(task)">删除任务</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div class="task-info">
              <div class="info-item">
                <span class="label">数据集：</span>
                <span>{{ task.datasetName }}</span>
              </div>
              <div class="info-item">
                <span class="label">标注类型：</span>
                <span>{{ task.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">进度：</span>
                <el-progress :percentage="task.progress" />
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <el-tag :type="task.status.type">{{ task.status.text }}</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建标注任务"
      width="600px"
    >
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="选择数据集">
          <el-select v-model="taskForm.datasetId" placeholder="请选择数据集">
            <el-option
              v-for="dataset in datasets"
              :key="dataset.id"
              :label="dataset.name"
              :value="dataset.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标注类型">
          <el-select v-model="taskForm.type" placeholder="请选择标注类型">
            <el-option-group label="文本标注">
              <el-option label="文本分类" value="text_classification" />
              <el-option label="序列标注" value="sequence_labeling" />
              <el-option label="文本匹配" value="text_matching" />
              <el-option label="关系抽取" value="relation_extraction" />
              <el-option label="文本纠错" value="text_correction" />
            </el-option-group>
            <el-option-group label="图像标注">
              <el-option label="图像分类" value="image_classification" />
              <el-option label="目标检测" value="object_detection" />
              <el-option label="语义分割" value="semantic_segmentation" />
              <el-option label="实例分割" value="instance_segmentation" />
              <el-option label="关键点标注" value="keypoint_annotation" />
            </el-option-group>
            <el-option-group label="音频标注">
              <el-option label="语音识别" value="speech_recognition" />
              <el-option label="声音分类" value="audio_classification" />
              <el-option label="语音分割" value="audio_segmentation" />
              <el-option label="音频事件" value="audio_event" />
            </el-option-group>
            <el-option-group label="视频标注">
              <el-option label="视频分类" value="video_classification" />
              <el-option label="目标跟踪" value="object_tracking" />
              <el-option label="动作识别" value="action_recognition" />
              <el-option label="场景分割" value="video_segmentation" />
            </el-option-group>
            <el-option-group label="多模态标注">
              <el-option label="图文匹配" value="image_text_matching" />
              <el-option label="视频描述" value="video_caption" />
              <el-option label="场景理解" value="scene_understanding" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="标签配置">
          <div class="labels-config">
            <div v-for="(label, index) in taskForm.labels" :key="index" class="label-item">
              <el-input v-model="label.name" placeholder="标签名称" />
              <el-color-picker v-model="label.color" />
              <el-button type="danger" circle @click="removeLabel(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" plain @click="addLabel">添加标签</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createTask">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 视图模式
const viewMode = ref('table')

// 任务列表数据
const tasks = ref([
  {
    id: 1,
    name: '新闻分类标注任务',
    datasetName: '新闻数据集',
    type: '文本分类',
    progress: 70,
    annotated: 700,
    total: 1000,
    status: { type: 'success', text: '进行中' }
  },
  {
    id: 2,
    name: '商品评论情感分析',
    datasetName: '评论数据集',
    type: '文本分类',
    progress: 30,
    annotated: 1500,
    total: 5000,
    status: { type: 'warning', text: '待处理' }
  },
  {
    id: 3,
    name: '实体识别任务',
    datasetName: '医疗文本数据',
    type: '序列标注',
    progress: 100,
    annotated: 800,
    total: 800,
    status: { type: 'info', text: '已完成' }
  }
])

// 可选数据集
const datasets = ref([
  { id: 1, name: '新闻数据集' },
  { id: 2, name: '评论数据集' },
  { id: 3, name: '医疗文本数据' }
])

// 搜索和过滤
const searchQuery = ref('')
const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value
  return tasks.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 创建任务相关
const showCreateDialog = ref(false)
const taskForm = ref({
  name: '',
  datasetId: '',
  type: '',
  labels: []
})

// 标签操作
const addLabel = () => {
  taskForm.value.labels.push({
    name: '',
    color: '#409EFF'
  })
}

const removeLabel = (index) => {
  taskForm.value.labels.splice(index, 1)
}

// 创建任务
const createTask = () => {
  // TODO: 实现创建任务逻辑
  ElMessage.success('任务创建成功')
  showCreateDialog.value = false
}

// 任务操作
const startAnnotation = (task) => {
  router.push({
    name: 'annotation',
    query: { taskId: task.id }
  })
}

const editTask = (task) => {
  // TODO: 实现编辑逻辑
}

const deleteTask = (task) => {
  ElMessageBox.confirm(
    '确定要删除该标注任务吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // TODO: 实现删除逻辑
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}
</script>

<style scoped>
.task-page {
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

.ml-4 {
  margin-left: 16px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
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

.task-cards {
  .task-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .task-name {
    font-weight: bold;
  }

  .task-info {
    .info-item {
      margin-bottom: 12px;

      .label {
        color: var(--el-text-color-secondary);
        margin-right: 8px;
      }
    }
  }
}

.labels-config {
  .label-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 