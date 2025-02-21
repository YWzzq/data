<template>
  <div class="label-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button-group>
          <el-button type="primary" @click="showLabelGroupDialog = true">
            <el-icon><FolderAdd /></el-icon>新建标签组
          </el-button>
          <el-button type="primary" @click="openLabelDialog" :disabled="!activeGroupId">
            <el-icon><Plus /></el-icon>添加标签
          </el-button>
        </el-button-group>
      </div>
      <div class="right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索标签组或标签..."
          prefix-icon="Search"
          class="search-input"
        />
      </div>
    </div>

    <!-- 标签组和标签列表 -->
    <el-row :gutter="20" class="mt-20">
      <!-- 标签组列表 -->
      <el-col :span="6">
        <el-card class="label-group-card">
          <template #header>
            <div class="card-header">
              <span>标签组</span>
            </div>
          </template>
          <el-menu
            :default-active="activeGroupId"
            class="label-group-menu"
            @select="handleGroupSelect"
          >
            <el-menu-item index="">
              <el-icon><Collection /></el-icon>
              <span>全部标签组</span>
              <span class="label-count">{{ labelGroups.length }}</span>
            </el-menu-item>
            <el-sub-menu
              v-for="type in groupTypes"
              :key="type.value"
              :index="type.value"
            >
              <template #title>
                <el-icon><component :is="type.icon" /></el-icon>
                <span>{{ type.label }}</span>
              </template>
              <el-menu-item 
                v-for="group in getGroupsByType(type.value)" 
                :key="group.id" 
                :index="group.id.toString()"
              >
                <el-icon><Folder /></el-icon>
                <span>{{ group.name }}</span>
                <span class="label-count">{{ group.labels?.length || 0 }}</span>
                <template #title>
                  <el-dropdown trigger="click" @command="handleGroupCommand($event, group)">
                    <span class="group-actions">
                      <el-icon><More /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="copy">复制</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 标签组详情和标签列表 -->
      <el-col :span="18">
        <el-card v-if="currentGroup" class="group-detail-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <h3 class="group-name">{{ currentGroup.name }}</h3>
                <el-tag size="small" :type="getGroupTypeInfo(currentGroup.type).tagType">
                  {{ getGroupTypeInfo(currentGroup.type).label }}
                </el-tag>
              </div>
              <div class="header-right">
                <el-button-group>
                  <el-button type="primary" @click="openLabelDialog">
                    <el-icon><Plus /></el-icon>添加标签
                  </el-button>
                  <el-button @click="previewGroup">
                    <el-icon><View /></el-icon>预览效果
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          
          <!-- 标签组描述 -->
          <div class="group-description">{{ currentGroup.description }}</div>
          
          <!-- 标签列表 -->
          <div class="label-list">
            <el-table :data="filteredLabels" style="width: 100%">
              <el-table-column prop="name" label="标签名称" min-width="200">
                <template #default="scope">
                  <div class="name-cell">
                    <el-tag :color="scope.row.color" class="label-tag">
                      {{ scope.row.name }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="shortcut" label="快捷键" width="120">
                <template #default="scope">
                  <el-tag size="small" type="info">[{{ scope.row.shortcut }}]</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="taskCount" label="使用次数" width="120" />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button text size="small" type="primary" @click="editLabel(scope.row)">编辑</el-button>
                  <el-button text size="small" type="danger" @click="deleteLabel(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
        
        <!-- 未选择标签组时的提示 -->
        <el-empty v-else description="请选择标签组" />
      </el-col>
    </el-row>

    <!-- 创建/编辑标签组对话框 -->
    <el-dialog
      v-model="showLabelGroupDialog"
      :title="editingGroup ? '编辑标签组' : '新建标签组'"
      width="500px"
    >
      <el-form :model="labelGroupForm" label-width="80px" :rules="groupRules" ref="groupFormRef">
        <el-form-item label="组名称" prop="name">
          <el-input v-model="labelGroupForm.name" placeholder="请输入标签组名称" />
        </el-form-item>
        <el-form-item label="组类型" prop="type">
          <el-select v-model="labelGroupForm.type" placeholder="请选择标签组类型">
            <el-option
              v-for="type in groupTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            >
              <el-icon><component :is="type.icon" /></el-icon>
              <span>{{ type.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组描述" prop="description">
          <el-input 
            v-model="labelGroupForm.description" 
            type="textarea" 
            placeholder="请输入标签组描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showLabelGroupDialog = false">取消</el-button>
          <el-button type="primary" @click="saveLabelGroup">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标签组预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      title="标签组预览"
      width="600px"
      class="preview-dialog"
    >
      <div class="preview-content">
        <div class="preview-header">
          <h3>{{ currentGroup?.name }}</h3>
          <p>{{ currentGroup?.description }}</p>
        </div>
        <div class="preview-labels">
          <el-tag
            v-for="label in currentGroup?.labels"
            :key="label.id"
            :color="label.color"
            class="preview-label"
          >
            {{ label.name }}
            <span class="shortcut">[{{ label.shortcut }}]</span>
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 创建/编辑标签对话框 -->
    <el-dialog
      v-model="showLabelDialog"
      :title="editingLabel ? '编辑标签' : '新建标签'"
      width="500px"
      @closed="resetLabelForm"
    >
      <el-form :model="labelForm" label-width="80px" :rules="labelRules" ref="labelFormRef">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="labelForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="labelForm.color" show-alpha />
        </el-form-item>
        <el-form-item label="快捷键">
          <el-input v-model="labelForm.shortcut" placeholder="自动分配" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showLabelDialog = false">取消</el-button>
          <el-button type="primary" @click="saveLabel">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  FolderAdd,
  Folder,
  Collection,
  More,
  View,
  Document,
  Picture,
  ChatLineSquare,
  VideoCamera,
  Grid,
  Connection
} from '@element-plus/icons-vue'

// 标签组类型定义
const groupTypes = [
  { value: 'text', label: '文本标注', icon: 'Document', tagType: '' },
  { value: 'image', label: '图像标注', icon: 'Picture', tagType: 'success' },
  { value: 'audio', label: '音频标注', icon: 'ChatLineSquare', tagType: 'warning' },
  { value: 'video', label: '视频标注', icon: 'VideoCamera', tagType: 'danger' },
  { value: 'table', label: '表格标注', icon: 'Grid', tagType: 'info' },
  { value: 'mixed', label: '混合标注', icon: 'Connection', tagType: 'primary' }
]

// 标签组列表
const labelGroups = ref([
  {
    id: 1,
    name: '文本分类',
    type: 'text',
    description: '用于文本分类的标签组',
    createTime: '2024-01-01 10:00:00',
    labels: [
      {
        id: 1,
        name: '科技',
        color: '#409EFF',
        shortcut: '1',
        taskCount: 12,
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '体育',
        color: '#67C23A',
        shortcut: '2',
        taskCount: 8,
        createTime: '2024-01-02 15:30:00'
      }
    ]
  },
  {
    id: 2,
    name: '情感分析',
    type: 'text',
    description: '用于情感分析的标签组',
    createTime: '2024-01-02 15:30:00',
    labels: [
      {
        id: 3,
        name: '积极',
        color: '#E6A23C',
        shortcut: '3',
        taskCount: 15,
        createTime: '2024-01-03 09:20:00'
      }
    ]
  }
])

// 当前选中的标签组
const activeGroupId = ref('')
const currentGroup = computed(() => {
  if (!activeGroupId.value) return null
  return labelGroups.value.find(g => g.id.toString() === activeGroupId.value)
})

// 按类型获取标签组
const getGroupsByType = (type) => {
  return labelGroups.value.filter(g => g.type === type)
}

// 获取标签组类型信息
const getGroupTypeInfo = (type) => {
  return groupTypes.find(t => t.value === type) || groupTypes[0]
}

// 搜索和过滤
const searchQuery = ref('')
const filteredLabels = computed(() => {
  if (!currentGroup.value) return []
  const labels = currentGroup.value.labels || []
  
  if (!searchQuery.value) return labels
  return labels.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 标签组表单
const showLabelGroupDialog = ref(false)
const editingGroup = ref(null)
const groupFormRef = ref(null)
const labelGroupForm = ref({
  name: '',
  type: '',
  description: ''
})

const groupRules = {
  name: [
    { required: true, message: '请输入标签组名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择标签组类型', trigger: 'change' }
  ]
}

// 标签组预览
const showPreviewDialog = ref(false)
const previewGroup = () => {
  if (!currentGroup.value) return
  showPreviewDialog.value = true
}

// 标签组操作
const handleGroupCommand = (command, group) => {
  if (command === 'edit') {
    editingGroup.value = group
    labelGroupForm.value = {
      name: group.name,
      type: group.type,
      description: group.description
    }
    showLabelGroupDialog.value = true
  } else if (command === 'copy') {
    copyGroup(group)
  } else if (command === 'delete') {
    deleteGroup(group)
  }
}

// 复制标签组
const copyGroup = (group) => {
  const newGroup = {
    id: Date.now(),
    name: `${group.name} - 副本`,
    type: group.type,
    description: group.description,
    createTime: new Date().toLocaleString(),
    labels: group.labels?.map(label => ({
      ...label,
      id: Date.now() + Math.random(),
      taskCount: 0,
      createTime: new Date().toLocaleString()
    }))
  }
  labelGroups.value.push(newGroup)
  ElMessage.success('复制成功')
}

// 删除标签组
const deleteGroup = (group) => {
  if (group.labels?.length) {
    ElMessage.warning('该标签组下还有标签，请先删除或移动标签')
    return
  }

  ElMessageBox.confirm(
    '确定要删除该标签组吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = labelGroups.value.findIndex(g => g.id === group.id)
    if (index !== -1) {
      labelGroups.value.splice(index, 1)
      ElMessage.success('删除成功')
      if (activeGroupId.value === group.id.toString()) {
        activeGroupId.value = ''
      }
    }
  }).catch(() => {})
}

// 保存标签组
const saveLabelGroup = async () => {
  if (!groupFormRef.value) return
  
  try {
    await groupFormRef.value.validate()
    
    if (editingGroup.value) {
      // 更新标签组
      const group = labelGroups.value.find(g => g.id === editingGroup.value.id)
      if (group) {
        group.name = labelGroupForm.value.name
        group.type = labelGroupForm.value.type
        group.description = labelGroupForm.value.description
      }
    } else {
      // 创建新标签组
      labelGroups.value.push({
        id: Date.now(),
        ...labelGroupForm.value,
        createTime: new Date().toLocaleString(),
        labels: []
      })
    }

    showLabelGroupDialog.value = false
    ElMessage.success(editingGroup.value ? '更新成功' : '创建成功')
    resetGroupForm()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  }
}

// 重置标签组表单
const resetGroupForm = () => {
  groupFormRef.value?.resetFields()
  labelGroupForm.value = {
    name: '',
    type: '',
    description: ''
  }
  editingGroup.value = null
}

// 标签表单
const showLabelDialog = ref(false)
const editingLabel = ref(null)
const labelFormRef = ref(null)
const labelForm = ref({
  name: '',
  groupId: '',
  color: '#409EFF',
  shortcut: ''
})

const labelRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择标签颜色', trigger: 'change' }
  ]
}

// 选择标签组
const handleGroupSelect = (groupId) => {
  activeGroupId.value = groupId
}

// 打开标签对话框
const openLabelDialog = () => {
  if (!currentGroup.value) {
    ElMessage.warning('请先选择标签组')
    return
  }
  editingLabel.value = null
  labelForm.value = {
    name: '',
    color: '#409EFF',
    shortcut: '自动分配'
  }
  showLabelDialog.value = true
}

// 保存标签
const saveLabel = async () => {
  if (!labelFormRef.value) return
  if (!currentGroup.value) {
    ElMessage.error('请先选择标签组')
    return
  }
  
  try {
    await labelFormRef.value.validate()
    
    if (editingLabel.value) {
      // 更新标签
      const label = currentGroup.value.labels.find(l => l.id === editingLabel.value.id)
      if (label) {
        Object.assign(label, {
          name: labelForm.value.name,
          color: labelForm.value.color
        })
      }
    } else {
      // 创建新标签
      currentGroup.value.labels = currentGroup.value.labels || []
      const newLabel = {
        id: Date.now(),
        name: labelForm.value.name,
        color: labelForm.value.color,
        shortcut: (currentGroup.value.labels.length + 1).toString(),
        taskCount: 0,
        createTime: new Date().toLocaleString()
      }
      currentGroup.value.labels.push(newLabel)
    }

    showLabelDialog.value = false
    ElMessage.success(editingLabel.value ? '更新成功' : '创建成功')
    resetLabelForm()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  }
}

// 编辑标签
const editLabel = (label) => {
  editingLabel.value = label
  labelForm.value = {
    name: label.name,
    color: label.color,
    shortcut: label.shortcut
  }
  showLabelDialog.value = true
}

// 删除标签
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
    const group = labelGroups.value.find(g => g.labels?.some(l => l.id === label.id))
    if (group && group.labels) {
      const index = group.labels.findIndex(l => l.id === label.id)
      if (index !== -1) {
        group.labels.splice(index, 1)
        ElMessage.success('删除成功')
      }
    }
  }).catch(() => {})
}

// 重置标签表单
const resetLabelForm = () => {
  labelFormRef.value?.resetFields()
  labelForm.value = {
    name: '',
    groupId: '',
    color: '#409EFF',
    shortcut: ''
  }
  editingLabel.value = null
}
</script>

<style scoped>
.label-page {
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

.label-group-card {
  height: 100%;
}

.label-group-menu {
  border-right: none;
}

.label-count {
  float: right;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.group-actions {
  float: right;
  margin-right: 10px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--el-color-primary);
  }
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-tag {
  background-color: #fff !important;
  border: 1px solid var(--el-border-color);
  min-width: 80px;
  text-align: center;
}

/* 添加一些过渡动画 */
.el-dialog {
  transition: all 0.3s ease-in-out;
}

.el-form-item {
  transition: all 0.3s ease-in-out;
}

/* 优化表单布局 */
:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

:deep(.el-select),
:deep(.el-color-picker) {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input {
    width: 200px;
  }
  
  .el-dialog {
    width: 90% !important;
  }
}

.group-detail-card {
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-name {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.group-description {
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.preview-dialog {
  .preview-content {
    padding: 20px;
  }

  .preview-header {
    margin-bottom: 20px;
    text-align: center;

    h3 {
      margin: 0 0 8px;
    }

    p {
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }

  .preview-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .preview-label {
    padding: 8px 16px;
    font-size: 14px;

    .shortcut {
      margin-left: 4px;
      opacity: 0.7;
    }
  }
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 