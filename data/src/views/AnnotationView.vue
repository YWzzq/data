<template>
  <div class="annotation-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="left">
        <el-button link @click="goBack">
          <el-icon><Back /></el-icon>
          返回任务列表
        </el-button>
        <el-divider direction="vertical" />
        <div class="task-info">
          <span class="task-name">{{ currentTask.name }}</span>
          <el-tag size="small" type="info" class="ml-2">{{ currentTask.type }}</el-tag>
        </div>
      </div>
      <div class="right">
        <el-button-group class="nav-buttons">
          <el-button :disabled="!canPrevious" @click="previousItem">
            <el-icon><ArrowLeft /></el-icon>
            上一条
          </el-button>
          <el-button :disabled="!canNext" @click="nextItem">
            下一条
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-button-group>
        <div class="progress-info">
          <span class="current">{{ currentIndex + 1 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ totalItems }}</span>
        </div>
      </div>
    </div>

    <!-- 主要标注区域 -->
    <div class="main-content">
      <!-- 左侧：数据展示和标注结果区 -->
      <div class="content-panel">
        <!-- 待标注内容 -->
        <div class="data-display">
          <div class="panel-header">
            <span>待标注内容</span>
            <el-button-group>
              <el-button size="small" @click="toggleFullscreen">
                <el-icon><FullScreen /></el-icon>
              </el-button>
              <el-button size="small" @click="resetView">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-button-group>
          </div>
          
          <!-- 文本标注视图 -->
          <div v-if="isTextAnnotation" class="text-content">
            <div class="text-display" :class="{ 'sequence-mode': isSequenceLabeling }">
              <template v-if="isSequenceLabeling">
                <span
                  v-for="(char, index) in currentItem.content"
                  :key="index"
                  class="char"
                  :class="getCharClass(index)"
                  @click="handleCharClick(index)"
                  @mouseover="handleCharHover(index)"
                >{{ char }}</span>
              </template>
              <template v-else>
                {{ currentItem.content }}
              </template>
            </div>
          </div>

          <!-- 图像标注视图 -->
          <div v-else-if="isImageAnnotation" class="image-content">
            <div class="image-wrapper">
              <img :src="currentItem.url" alt="标注图片" />
            </div>
          </div>
        </div>

        <!-- 标注结果展示 -->
        <div class="annotation-display">
          <div class="panel-header">
            <span>标注结果</span>
            <el-button-group>
              <el-button size="small" @click="clearAnnotation">
                <el-icon><Delete /></el-icon>
                清除
              </el-button>
            </el-button-group>
          </div>

          <!-- 分类结果 -->
          <template v-if="isTextClassification">
            <div class="classification-result">
              <el-input
                v-model="annotationResult.label"
                class="result-input"
                placeholder="请输入标注结果..."
                @change="triggerAutoSave"
              />
            </div>
          </template>

          <!-- 序列标注结果 -->
          <template v-if="isSequenceLabeling">
            <div class="entity-result">
              <template v-if="currentEntities.length > 0">
                <div v-for="entity in currentEntities" :key="entity.id" class="entity-item">
                  <el-input
                    v-model="entity.text"
                    class="entity-input"
                    @change="triggerAutoSave"
                  >
                    <template #append>
                      <el-button @click="removeEntity(entity)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </template>
              <div v-else class="no-result">
                暂无标注结果
              </div>
            </div>
          </template>

          <!-- 备注信息 -->
          <div class="comment-section mt-4">
            <el-input
              v-model="annotationResult.comment"
              type="textarea"
              :rows="2"
              placeholder="添加备注..."
            />
          </div>
        </div>
      </div>

      <!-- 右侧：标注操作区 -->
      <div class="operation-panel">
        <!-- 标签管理 -->
        <div class="label-management">
          <div class="panel-header">
            <span>标签列表</span>
            <el-button-group>
              <el-button size="small" @click="openLabelGroupImportDialog">
                <el-icon><FolderAdd /></el-icon>
                导入标签组
              </el-button>
            </el-button-group>
          </div>
          
          <div class="label-list">
            <div v-for="label in taskLabels" :key="label.id" class="label-item">
              <el-tag
                :color="label.color"
                class="label-tag"
                :class="{ active: annotationResult.label === label.name }"
                @click="handleLabelSelect(label.id)"
              >
                {{ label.name }}
                <span class="shortcut-key">[{{ label.id }}]</span>
              </el-tag>
            </div>
          </div>
        </div>

        <!-- AI 辅助区域 -->
        <div v-if="aiSuggestions.length > 0" class="ai-suggestions">
          <div class="suggestion-header">
            <el-icon><Cpu /></el-icon>
            <span>AI 建议</span>
            <el-tooltip content="AI 建议仅供参考，请根据实际情况判断">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="suggestion-list">
            <template v-if="isTextClassification">
              <div v-for="suggestion in aiSuggestions" :key="suggestion.label" class="suggestion-item">
                <el-button 
                  :type="suggestion.confidence > 0.8 ? 'success' : 'info'"
                  size="small"
                  @click="applyAiSuggestion(suggestion)"
                >
                  {{ suggestion.label }}
                  <span class="confidence">{{ (suggestion.confidence * 100).toFixed(1) }}%</span>
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertAiSuggestion(suggestion)"
                >
                  插入
                </el-button>
              </div>
            </template>
          </div>
        </div>

        <!-- 快捷键说明 -->
        <div class="shortcuts-info">
          <div class="panel-header">
            <span>快捷键说明</span>
          </div>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <span class="key">←</span>
              <span class="description">上一条</span>
            </div>
            <div class="shortcut-item">
              <span class="key">→</span>
              <span class="description">下一条</span>
            </div>
            <div class="shortcut-item">
              <span class="key">1-9</span>
              <span class="description">快速选择标签</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签组导入对话框 -->
    <el-dialog
      v-model="showLabelGroupImportDialog"
      title="导入标签组"
      width="600px"
    >
      <div class="label-group-list">
        <el-table :data="availableLabelGroups" style="width: 100%">
          <el-table-column prop="name" label="标签组名称" />
          <el-table-column prop="type" label="类型">
            <template #default="scope">
              <el-tag size="small" :type="getGroupTypeInfo(scope.row.type).tagType">
                {{ getGroupTypeInfo(scope.row.type).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="labels" label="标签数量">
            <template #default="scope">
              {{ scope.row.labels?.length || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button 
                text 
                type="primary" 
                size="small" 
                @click="importLabelGroup(scope.row)"
              >
                导入
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Back, 
  ArrowLeft, 
  ArrowRight, 
  FullScreen, 
  Refresh, 
  Delete, 
  Plus, 
  Edit, 
  Operation, 
  Check, 
  Right,
  Cpu,
  InfoFilled,
  FolderAdd
} from '@element-plus/icons-vue'
import { testData, labelGroups } from '../testData'

const route = useRoute()
const router = useRouter()

// 当前任务信息
const currentTask = ref({
  id: 1,
  name: '新闻分类标注任务',
  type: 'text_classification',
  datasetName: '新闻数据集'
})

// 标注数据
const currentIndex = ref(0)
const totalItems = ref(testData.textClassification.length)
const currentItem = ref(testData.textClassification[0])

// 任务标签
const taskLabels = ref(labelGroups.textClassification.news)

// 标注结果
const selectedLabel = ref(null)
const selectedEntityType = ref(null)
const currentEntities = ref([])
const annotationResult = ref({
  label: '',
  entities: [],
  comment: '',
  lastSaved: null // 记录最后保存时间
})

// 序列标注相关
const selectionStart = ref(-1)
const selectionEnd = ref(-1)

// UI 状态
const showShortcuts = ref(false)

// AI 相关状态
const isAiProcessing = ref(false)
const aiSuggestions = ref([])

// 标签管理相关
const showLabelDialog = ref(false)
const isEditingLabels = ref(false)
const editingLabel = ref(null)
const labelForm = ref({
  name: '',
  color: '#409EFF',
  shortcut: ''
})

// 标签组导入相关
const showLabelGroupImportDialog = ref(false)
const availableLabelGroups = ref([
  {
    id: 1,
    name: '文本分类',
    type: 'text',
    description: '用于文本分类的标签组',
    labels: [
      {
        id: 1,
        name: '科技',
        color: '#409EFF',
        shortcut: '1'
      },
      {
        id: 2,
        name: '体育',
        color: '#67C23A',
        shortcut: '2'
      }
    ]
  },
  {
    id: 2,
    name: '情感分析',
    type: 'text',
    description: '用于情感分析的标签组',
    labels: [
      {
        id: 3,
        name: '积极',
        color: '#E6A23C',
        shortcut: '3'
      }
    ]
  }
])

// 添加自动保存相关
const autoSaveDelay = 1000 // 1秒后自动保存
let autoSaveTimer = null

// 计算属性
const canPrevious = computed(() => currentIndex.value > 0)
const canNext = computed(() => currentIndex.value < totalItems.value - 1)
const isTextAnnotation = computed(() => ['text_classification', 'sequence_labeling', 'text_matching'].includes(currentTask.value.type))
const isImageAnnotation = computed(() => ['image_classification', 'object_detection', 'semantic_segmentation'].includes(currentTask.value.type))
const isTextClassification = computed(() => currentTask.value.type === 'text_classification')
const isSequenceLabeling = computed(() => currentTask.value.type === 'sequence_labeling')

// 快捷键配置
const shortcuts = [
  { key: '←', description: '上一条数据' },
  { key: '→', description: '下一条数据' },
  { key: '1-9', description: '快速选择标签' },
  { key: 'Ctrl + S', description: '保存标注' },
  { key: 'Ctrl + Z', description: '撤销操作' }
]

// 方法
const goBack = () => {
  router.push('/tasks')
}

const previousItem = () => {
  if (canPrevious.value) {
    currentIndex.value--
    loadItem()
  }
}

const nextItem = () => {
  if (canNext.value) {
    currentIndex.value++
    loadItem()
  }
}

const loadItem = () => {
  if (isTextClassification.value) {
    currentItem.value = testData.textClassification[currentIndex.value]
  } else if (isSequenceLabeling.value) {
    currentItem.value = testData.sequenceLabeling[currentIndex.value]
  }
  // 清除当前标注结果
  clearAnnotation()
  ElMessage.success('数据加载成功')
}

const toggleFullscreen = () => {
  // TODO: 实现全屏切换
}

const resetView = () => {
  // TODO: 重置视图状态
}

const clearAnnotation = () => {
  selectedLabel.value = null
  selectedEntityType.value = null
  currentEntities.value = []
  annotationResult.value = {
    label: '',
    entities: [],
    comment: '',
    lastSaved: null
  }
}

const toggleShortcuts = () => {
  showShortcuts.value = !showShortcuts.value
}

const saveAnnotation = () => {
  // TODO: 保存标注结果到后端
  ElMessage.success('保存成功')
}

// 序列标注相关方法
const handleCharClick = (index) => {
  if (selectionStart.value === -1) {
    selectionStart.value = index
  } else {
    selectionEnd.value = index
    if (selectedEntityType.value) {
      addEntity()
    }
  }
}

const handleCharHover = (index) => {
  if (selectionStart.value !== -1) {
    selectionEnd.value = index
  }
}

const addEntity = () => {
  const start = Math.min(selectionStart.value, selectionEnd.value)
  const end = Math.max(selectionStart.value, selectionEnd.value)
  const text = currentItem.value.content.slice(start, end + 1)
  
  currentEntities.value.push({
    id: Date.now(),
    start,
    end,
    text,
    type: taskLabels.value.find(l => l.id === selectedEntityType.value)?.name
  })

  selectionStart.value = -1
  selectionEnd.value = -1
}

const removeEntity = (entity) => {
  const index = currentEntities.value.findIndex(e => e.id === entity.id)
  if (index !== -1) {
    currentEntities.value.splice(index, 1)
  }
}

const getEntityColor = (entity) => {
  const label = taskLabels.value.find(l => l.name === entity.type)
  return label?.color
}

const getCharClass = (index) => {
  const entity = currentEntities.value.find(e => index >= e.start && index <= e.end)
  return {
    'selected': index >= selectionStart.value && index <= selectionEnd.value,
    'entity': entity,
    [`entity-${entity?.type}`]: entity
  }
}

// 修改标签选择逻辑
const handleLabelSelect = (labelId) => {
  const label = taskLabels.value.find(l => l.id === labelId)
  if (label) {
    annotationResult.value.label = label.name
    triggerAutoSave()
  }
}

// 添加标注结果变化监听
watch(() => annotationResult.value.label, (newLabel) => {
  // 当手动输入的标签与现有标签匹配时，高亮对应的标签
  const matchedLabel = taskLabels.value.find(l => l.name === newLabel)
  if (matchedLabel) {
    selectedLabel.value = matchedLabel.id
  } else {
    selectedLabel.value = null
  }
})

// 触发自动保存
const triggerAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(async () => {
    try {
      // TODO: 实际保存到后端
      annotationResult.value.lastSaved = new Date()
      ElMessage.success('自动保存成功')
    } catch (error) {
      ElMessage.error('自动保存失败')
    }
  }, autoSaveDelay)
}

// 修改键盘事件处理
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft' && !e.ctrlKey) {
    previousItem()
  } else if (e.key === 'ArrowRight' && !e.ctrlKey) {
    nextItem()
  }
  
  // 数字键快捷选择标签
  const num = parseInt(e.key)
  if (num >= 1 && num <= 9) {
    handleLabelSelect(num)
  }
}

// AI 辅助方法
const requestAiSuggestion = async () => {
  isAiProcessing.value = true
  try {
    // TODO: 调用后端 AI 服务
    // 模拟 AI 响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isTextClassification.value) {
      aiSuggestions.value = [
        { label: '科技', confidence: 0.92 },
        { label: '娱乐', confidence: 0.45 },
        { label: '体育', confidence: 0.28 }
      ]
    } else if (isSequenceLabeling.value) {
      aiSuggestions.value = [
        { 
          id: Date.now(),
          text: '特斯拉',
          type: '公司',
          start: 5,
          end: 8,
          confidence: 0.95
        },
        {
          id: Date.now() + 1,
          text: '马斯克',
          type: '人名',
          start: 12,
          end: 15,
          confidence: 0.88
        }
      ]
    }
    
    ElMessage.success('AI 分析完成')
  } catch (error) {
    ElMessage.error('AI 分析失败')
  } finally {
    isAiProcessing.value = false
  }
}

const applyAiSuggestion = (suggestion) => {
  if (isTextClassification.value) {
    const label = taskLabels.value.find(l => l.name === suggestion.label)
    if (label) {
      selectedLabel.value = label.id
      annotationResult.value.label = label.name
    }
  } else if (isSequenceLabeling.value) {
    currentEntities.value.push({
      ...suggestion,
      id: Date.now()
    })
  }
}

const skipItem = () => {
  nextItem()
}

// 标签管理相关方法
const openLabelDialog = () => {
  editingLabel.value = null
  labelForm.value = {
    name: '',
    color: '#409EFF',
    shortcut: ''
  }
  showLabelDialog.value = true
}

const toggleLabelEdit = () => {
  isEditingLabels.value = !isEditingLabels.value
}

const editLabel = (label) => {
  editingLabel.value = label
  labelForm.value = {
    name: label.name,
    color: label.color,
    shortcut: label.id.toString()
  }
  showLabelDialog.value = true
}

const deleteLabel = (label) => {
  ElMessageBox.confirm(
    '确定要删除该标签吗？已标注的数据将会受到影响。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = taskLabels.value.findIndex(l => l.id === label.id)
    if (index !== -1) {
      taskLabels.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const saveLabelForm = () => {
  if (!labelForm.value.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  if (!labelForm.value.color) {
    labelForm.value.color = '#409EFF' // 设置默认颜色
  }

  if (editingLabel.value) {
    // 编辑现有标签
    const label = taskLabels.value.find(l => l.id === editingLabel.value.id)
    if (label) {
      label.name = labelForm.value.name
      label.color = labelForm.value.color
    }
  } else {
    // 添加新标签
    const newId = Math.max(...taskLabels.value.map(l => l.id), 0) + 1
    if (newId <= 9) {
      taskLabels.value.push({
        id: newId,
        name: labelForm.value.name,
        color: labelForm.value.color
      })
    } else {
      ElMessage.warning('最多支持9个标签（快捷键1-9）')
      return
    }
  }

  showLabelDialog.value = false
  editingLabel.value = null
  // 重置表单
  labelForm.value = {
    name: '',
    color: '#409EFF',
    shortcut: ''
  }
  ElMessage.success(editingLabel.value ? '编辑成功' : '添加成功')
}

// 修改标签组导入逻辑
const importLabelGroup = (group) => {
  if (!group || !group.labels) {
    ElMessage.error('标签组数据无效')
    return
  }

  try {
    // 直接替换当前标签组
    taskLabels.value = group.labels.map((label, index) => ({
      ...label,
      id: index + 1, // 重新分配ID，确保从1开始
      shortcut: (index + 1).toString() // 重新分配快捷键
    }))

    // 清除当前标注结果
    clearAnnotation()
    
    showLabelGroupImportDialog.value = false
    ElMessage.success(`成功导入标签组"${group.name}"`)
  } catch (error) {
    console.error('导入标签组失败:', error)
    ElMessage.error('导入标签组失败')
  }
}

// 添加AI建议插入功能
const insertAiSuggestion = (suggestion) => {
  if (isTextClassification.value) {
    annotationResult.value.label = suggestion.label
    triggerAutoSave()
  } else if (isSequenceLabeling.value && suggestion.text) {
    currentEntities.value.push({
      ...suggestion,
      id: Date.now()
    })
    triggerAutoSave()
  }
}

// 获取标签组类型信息
const getGroupTypeInfo = (type) => {
  const types = {
    'text': { label: '文本标注', tagType: '' },
    'image': { label: '图像标注', tagType: 'success' },
    'audio': { label: '音频标注', tagType: 'warning' },
    'video': { label: '视频标注', tagType: 'danger' },
    'table': { label: '表格标注', tagType: 'info' },
    'mixed': { label: '混合标注', tagType: 'primary' }
  }
  return types[type] || types['text']
}

// 标签组导入相关方法
const openLabelGroupImportDialog = () => {
  showLabelGroupImportDialog.value = true
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.annotation-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  background-color: transparent;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  height: 48px;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.main-content {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
}

.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.operation-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-display,
.annotation-display,
.label-selection,
.action-buttons {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.data-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-content {
  flex: 1;
  padding: 16px;
  font-size: 16px;
  line-height: 1.8;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.label-selection {
  flex: 1;
  
  .label-list {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .label-item {
    margin: 4px 0;
    
    :deep(.el-radio-button__inner) {
      width: 100%;
      text-align: left;
      padding: 12px 16px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      margin-bottom: 8px;
      transition: all 0.3s;
      background-color: #fff;
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

.action-buttons {
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.ai-suggestions {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--el-color-primary);
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.classification-result,
.entity-result {
  padding: 16px;
  min-height: 60px;
}

.no-result {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  border: 1px dashed #e4e7ed;
  border-radius: 4px;
}

.mt-4 {
  margin-top: 16px;
}

.ml-4 {
  margin-left: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.sequence-mode {
  .char {
    display: inline-block;
    padding: 0 1px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    
    &.selected {
      background-color: var(--el-color-primary-light-8);
    }
    
    &.entity {
      border-radius: 2px;
    }
  }
}

.image-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .image-wrapper {
    max-width: 100%;
    max-height: 100%;
    
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
}

.shortcuts-list {
  .shortcut-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .key {
      background-color: var(--el-bg-color-page);
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 12px;
      font-family: monospace;
    }
  }
}

.nav-buttons {
  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 13px;
  }
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  
  .current {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  
  .separator {
    color: var(--el-text-color-secondary);
  }
  
  .total {
    color: var(--el-text-color-secondary);
  }
}

.label-management {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  flex: 1;

  .label-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .label-item {
    .label-tag {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      color: #000;
      font-weight: 500;
      border: none;
      transition: all 0.3s;
      cursor: pointer;
      
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      &.active {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .shortcut-key {
        font-size: 12px;
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }
}

.shortcuts-info {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px;

  .shortcuts-list {
    margin-top: 12px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .key {
      background-color: #f5f7fa;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 12px;
      font-family: monospace;
      font-size: 12px;
      min-width: 40px;
      text-align: center;
    }

    .description {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}

.ai-suggestions {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px;

  .suggestion-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-color-primary);
    margin-bottom: 12px;
  }

  .suggestion-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .confidence {
    font-size: 12px;
    margin-left: 4px;
    opacity: 0.8;
  }
}

.classification-result {
  padding: 16px;
  min-height: 60px;

  .result-input {
    width: 100%;
  }
}

.entity-result {
  padding: 16px;
  
  .entity-item {
    margin-bottom: 8px;
    
    .entity-input {
      width: 100%;
    }
  }
}

.suggestion-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
}
</style> 