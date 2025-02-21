<template>
  <div class="dataset-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button type="primary" @click="router.push('/datasets/create')">
          <el-icon><Plus /></el-icon>新建数据集
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
          placeholder="搜索数据集..."
          prefix-icon="Search"
          class="search-input"
        />
      </div>
    </div>

    <!-- 步骤引导 -->
    <StepGuide
      title="数据集管理功能引导"
      :steps="guideSteps"
      pageKey="dataset_management"
    />

    <!-- 数据集列表 - 表格视图 -->
    <el-card v-if="viewMode === 'table'" class="mt-20">
      <template #header>
        <div class="card-header">
          <span>数据集列表</span>
          <div class="header-operations">
            <el-button-group>
              <el-button :disabled="!selectedDatasets.length" @click="batchDelete">
                批量删除
              </el-button>
              <el-button :disabled="!selectedDatasets.length" @click="batchExport">
                批量导出
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="pagedDatasets" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="数据集名称" min-width="200">
          <template #default="scope">
            <div class="name-cell">
              <el-icon><Folder /></el-icon>
              <span class="clickable" @click="viewDataset(scope.row)">
                {{ scope.row.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="数据类型" width="120" />
        <el-table-column prop="size" label="数据量" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status.type">{{ scope.row.status.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button text size="small" @click="viewDataset(scope.row)">查看</el-button>
            <el-button text size="small" type="primary" @click="editDataset(scope.row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="deleteDataset(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredDatasets.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 数据集列表 - 卡片视图 -->
    <div v-else class="dataset-cards mt-20">
      <el-row :gutter="20">
        <el-col 
          v-for="dataset in pagedDatasets" 
          :key="dataset.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card class="dataset-card" :body-style="{ padding: '0px' }">
            <div class="dataset-card-header">
              <el-icon><Folder /></el-icon>
              <span class="dataset-name">{{ dataset.name }}</span>
            </div>
            <div class="dataset-card-content">
              <div class="info-item">
                <span class="label">数据类型：</span>
                <span>{{ dataset.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">数据量：</span>
                <span>{{ dataset.size }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span>{{ dataset.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <el-tag :type="dataset.status.type" size="small">
                  {{ dataset.status.text }}
                </el-tag>
              </div>
            </div>
            <div class="dataset-card-actions">
              <el-button text size="small" @click="viewDataset(dataset)">查看</el-button>
              <el-button text size="small" type="primary" @click="editDataset(dataset)">编辑</el-button>
              <el-button text size="small" type="danger" @click="deleteDataset(dataset)">删除</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="filteredDatasets.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Folder,
  Grid,
  List
} from '@element-plus/icons-vue'
import StepGuide from '@/components/common/StepGuide.vue'

const router = useRouter()

// 视图模式
const viewMode = ref('table')

// 数据集列表
const datasets = ref([
  {
    id: 1,
    name: '新闻分类数据集',
    type: '文本分类',
    size: '1000条',
    createTime: '2024-01-01 10:00:00',
    status: { type: 'success', text: '已完成' }
  },
  {
    id: 2,
    name: '商品评论数据',
    type: '情感分析',
    size: '5000条',
    createTime: '2024-01-02 15:30:00',
    status: { type: 'warning', text: '处理中' }
  }
])

// 搜索和过滤
const searchQuery = ref('')
const filteredDatasets = computed(() => {
  if (!searchQuery.value) return datasets.value
  return datasets.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 分页
const currentPage = ref(1)
const pageSize = ref(viewMode.value === 'table' ? 10 : 12)
const pagedDatasets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDatasets.value.slice(start, end)
})

// 批量操作
const selectedDatasets = ref([])
const handleSelectionChange = (selection) => {
  selectedDatasets.value = selection
}

const batchDelete = () => {
  if (!selectedDatasets.value.length) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedDatasets.value.length} 个数据集吗？此操作不可恢复`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // TODO: 实现批量删除逻辑
    selectedDatasets.value.forEach(dataset => {
      const index = datasets.value.findIndex(d => d.id === dataset.id)
      if (index !== -1) {
        datasets.value.splice(index, 1)
      }
    })
    ElMessage.success('批量删除成功')
    selectedDatasets.value = []
  }).catch(() => {})
}

const batchExport = () => {
  if (!selectedDatasets.value.length) return
  // TODO: 实现批量导出逻辑
  ElMessage.success('开始导出选中的数据集')
}

// 数据集操作
const viewDataset = (dataset) => {
  router.push(`/datasets/${dataset.id}`)
}

const editDataset = (dataset) => {
  router.push(`/datasets/${dataset.id}/edit`)
}

const deleteDataset = (dataset) => {
  ElMessageBox.confirm(
    '确定要删除该数据集吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = datasets.value.findIndex(d => d.id === dataset.id)
    if (index !== -1) {
      datasets.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 引导步骤配置
const guideSteps = [
  {
    title: '创建数据集',
    description: '创建新的数据集',
    icon: 'Plus',
    content: `
      <p>创建数据集的方式：</p>
      <ul>
        <li>从本地文件导入（支持Excel、TXT等格式）</li>
        <li>从数据源导入</li>
        <li>手动创建并添加数据</li>
      </ul>
    `
  },
  {
    title: '数据集配置',
    description: '配置数据集基本信息',
    icon: 'Setting',
    content: `
      <p>配置数据集的基本属性：</p>
      <ul>
        <li>设置数据集名称和描述</li>
        <li>选择数据类型（文本、图像等）</li>
        <li>配置标注类型和模板</li>
        <li>设置存储位置和权限</li>
      </ul>
    `
  },
  {
    title: '数据管理',
    description: '管理数据集内容',
    icon: 'Document',
    content: `
      <p>数据集创建后，您可以：</p>
      <ul>
        <li>预览和编辑数据内容</li>
        <li>添加或删除数据</li>
        <li>进行数据清洗</li>
        <li>导出数据集</li>
      </ul>
    `
  },
  {
    title: '版本控制',
    description: '管理数据集版本',
    icon: 'Timer',
    content: `
      <p>数据集版本管理功能：</p>
      <ul>
        <li>创建数据集快照</li>
        <li>回滚到历史版本</li>
        <li>比较不同版本</li>
        <li>导出特定版本</li>
      </ul>
    `
  }
]
</script>

<style scoped>
.dataset-page {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 卡片视图样式 */
.dataset-cards {
  .dataset-card {
    margin-bottom: 20px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    }
  }

  .dataset-card-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--el-fill-color-light);
  }

  .dataset-name {
    font-weight: bold;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dataset-card-content {
    padding: 16px;

    .info-item {
      margin-bottom: 8px;
      display: flex;
      align-items: center;

      .label {
        color: var(--el-text-color-secondary);
        width: 80px;
        flex-shrink: 0;
      }
    }
  }

  .dataset-card-actions {
    padding: 8px 16px;
    border-top: 1px solid var(--el-border-color-light);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    background-color: var(--el-fill-color-light);
  }
}
</style> 