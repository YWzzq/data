<template>
  <div class="datasource-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>新建数据源
        </el-button>
      </div>
      <div class="right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索数据源..."
          prefix-icon="Search"
          class="search-input"
        />
      </div>
    </div>

    <!-- 数据源列表 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>数据源列表</span>
        </div>
      </template>
      
      <el-table :data="filteredDataSources" style="width: 100%">
        <el-table-column prop="name" label="数据源名称" min-width="200">
          <template #default="scope">
            <div class="name-cell">
              <el-icon><DataLine /></el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="数据源类型" width="150">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="connectionStatus" label="连接状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.connectionStatus.type">
              {{ scope.row.connectionStatus.text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastSync" label="最后同步时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button text size="small" @click="testConnection(scope.row)">测试连接</el-button>
            <el-button text size="small" type="primary" @click="editDataSource(scope.row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="deleteDataSource(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑数据源对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingDataSource ? '编辑数据源' : '新建数据源'"
      width="600px"
      @close="resetForm"
    >
      <el-form 
        ref="formRef"
        :model="dataSourceForm" 
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="数据源名称" required>
          <el-input v-model="dataSourceForm.name" placeholder="请输入数据源名称" />
        </el-form-item>
        
        <el-form-item label="数据源类型" required>
          <el-select v-model="dataSourceForm.type" placeholder="请选择数据源类型" style="width: 100%">
            <el-option-group label="本地数据源">
              <el-option label="本地文件" value="local_file" />
              <el-option label="本地文件夹" value="local_folder" />
            </el-option-group>
            <el-option-group label="远程数据源">
              <el-option label="FTP" value="ftp" />
              <el-option label="SFTP" value="sftp" />
              <el-option label="对象存储" value="object_storage" />
            </el-option-group>
            <el-option-group label="数据库">
              <el-option label="MySQL" value="mysql" />
              <el-option label="PostgreSQL" value="postgresql" />
              <el-option label="MongoDB" value="mongodb" />
            </el-option-group>
            <el-option-group label="API">
              <el-option label="REST API" value="rest_api" />
              <el-option label="GraphQL" value="graphql" />
            </el-option-group>
          </el-select>
        </el-form-item>

        <!-- 根据数据源类型显示不同的配置项 -->
        <template v-if="dataSourceForm.type === 'local_file' || dataSourceForm.type === 'local_folder'">
          <el-form-item label="路径" required>
            <el-input v-model="dataSourceForm.path" placeholder="请输入本地路径">
              <template #append>
                <el-button @click="selectPath">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
        </template>

        <template v-if="dataSourceForm.type === 'ftp' || dataSourceForm.type === 'sftp'">
          <el-form-item label="主机地址" required>
            <el-input v-model="dataSourceForm.host" placeholder="请输入主机地址" />
          </el-form-item>
          <el-form-item label="端口" required>
            <el-input-number v-model="dataSourceForm.port" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="用户名" required>
            <el-input v-model="dataSourceForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" required>
            <el-input v-model="dataSourceForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
        </template>

        <template v-if="dataSourceForm.type === 'object_storage'">
          <el-form-item label="存储类型" required>
            <el-select v-model="dataSourceForm.storageType" placeholder="请选择存储类型">
              <el-option label="阿里云 OSS" value="aliyun_oss" />
              <el-option label="腾讯云 COS" value="tencent_cos" />
              <el-option label="AWS S3" value="aws_s3" />
            </el-select>
          </el-form-item>
          <el-form-item label="Access Key" required>
            <el-input v-model="dataSourceForm.accessKey" placeholder="请输入 Access Key" />
          </el-form-item>
          <el-form-item label="Secret Key" required>
            <el-input v-model="dataSourceForm.secretKey" type="password" placeholder="请输入 Secret Key" />
          </el-form-item>
          <el-form-item label="Bucket" required>
            <el-input v-model="dataSourceForm.bucket" placeholder="请输入 Bucket 名称" />
          </el-form-item>
        </template>

        <template v-if="['mysql', 'postgresql', 'mongodb'].includes(dataSourceForm.type)">
          <el-form-item label="连接URL" required>
            <el-input v-model="dataSourceForm.url" placeholder="请输入数据库连接URL" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="dataSourceForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="dataSourceForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
        </template>

        <template v-if="['rest_api', 'graphql'].includes(dataSourceForm.type)">
          <el-form-item label="API地址" required>
            <el-input v-model="dataSourceForm.apiUrl" placeholder="请输入API地址" />
          </el-form-item>
          <el-form-item label="认证方式">
            <el-select v-model="dataSourceForm.authType" placeholder="请选择认证方式">
              <el-option label="无认证" value="none" />
              <el-option label="Basic Auth" value="basic" />
              <el-option label="Bearer Token" value="bearer" />
              <el-option label="API Key" value="apikey" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="同步设置">
          <el-switch
            v-model="dataSourceForm.autoSync"
            active-text="自动同步"
            inactive-text="手动同步"
          />
        </el-form-item>

        <el-form-item label="同步间隔" v-if="dataSourceForm.autoSync">
          <el-select v-model="dataSourceForm.syncInterval" placeholder="请选择同步间隔">
            <el-option label="5分钟" value="5" />
            <el-option label="15分钟" value="15" />
            <el-option label="30分钟" value="30" />
            <el-option label="1小时" value="60" />
            <el-option label="6小时" value="360" />
            <el-option label="12小时" value="720" />
            <el-option label="24小时" value="1440" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveDataSource">确认</el-button>
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
  DataLine,
  Search
} from '@element-plus/icons-vue'

// 数据源列表
const dataSources = ref([
  {
    id: 1,
    name: '本地文件数据源',
    type: '本地文件',
    connectionStatus: { type: 'success', text: '已连接' },
    lastSync: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'FTP数据源',
    type: 'FTP',
    connectionStatus: { type: 'warning', text: '未连接' },
    lastSync: '2024-01-02 15:30:00'
  }
])

// 搜索和过滤
const searchQuery = ref('')
const filteredDataSources = computed(() => {
  if (!searchQuery.value) return dataSources.value
  return dataSources.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 创建/编辑数据源
const showCreateDialog = ref(false)
const editingDataSource = ref(null)
const dataSourceForm = ref({
  name: '',
  type: '',
  path: '',
  host: '',
  port: 21,
  username: '',
  password: '',
  storageType: '',
  accessKey: '',
  secretKey: '',
  bucket: '',
  url: '',
  apiUrl: '',
  authType: 'none',
  autoSync: false,
  syncInterval: '60'
})

const formRef = ref(null)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入数据源名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择数据源类型', trigger: 'change' }
  ],
  // 本地数据源规则
  path: [
    { required: true, message: '请输入或选择路径', trigger: 'blur' }
  ],
  // FTP/SFTP规则
  host: [
    { required: true, message: '请输入主机地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口号范围为1-65535', trigger: 'blur' }
  ],
  // 对象存储规则
  storageType: [
    { required: true, message: '请选择存储类型', trigger: 'change' }
  ],
  accessKey: [
    { required: true, message: '请输入Access Key', trigger: 'blur' }
  ],
  secretKey: [
    { required: true, message: '请输入Secret Key', trigger: 'blur' }
  ],
  bucket: [
    { required: true, message: '请输入Bucket名称', trigger: 'blur' }
  ],
  // 数据库规则
  url: [
    { required: true, message: '请输入数据库连接URL', trigger: 'blur' }
  ],
  // API规则
  apiUrl: [
    { required: true, message: '请输入API地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  dataSourceForm.value = {
    name: '',
    type: '',
    path: '',
    host: '',
    port: 21,
    username: '',
    password: '',
    storageType: '',
    accessKey: '',
    secretKey: '',
    bucket: '',
    url: '',
    apiUrl: '',
    authType: 'none',
    autoSync: false,
    syncInterval: '60'
  }
  editingDataSource.value = null
}

// 选择本地路径
const selectPath = () => {
  // TODO: 实现本地路径选择
  ElMessage.info('选择路径功能待实现')
}

// 测试连接
const testConnection = async (dataSource) => {
  try {
    ElMessage({
      message: '当前为演示环境，暂不支持实际连接测试',
      type: 'info'
    })
  } catch (error) {
    ElMessage.error('连接测试失败：' + error.message)
  }
}

// 编辑数据源
const editDataSource = (dataSource) => {
  editingDataSource.value = dataSource
  // 深拷贝避免直接修改原数据
  Object.assign(dataSourceForm.value, JSON.parse(JSON.stringify(dataSource)))
  showCreateDialog.value = true
}

// 删除数据源
const deleteDataSource = (dataSource) => {
  ElMessageBox.confirm(
    '确定要删除该数据源吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = dataSources.value.findIndex(d => d.id === dataSource.id)
    if (index !== -1) {
      dataSources.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 保存数据源
const saveDataSource = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 模拟保存操作
    if (editingDataSource.value) {
      // 更新现有数据源
      const index = dataSources.value.findIndex(d => d.id === editingDataSource.value.id)
      if (index !== -1) {
        dataSources.value[index] = {
          ...dataSources.value[index],
          ...dataSourceForm.value,
          connectionStatus: { type: 'warning', text: '未连接' }
        }
      }
    } else {
      // 创建新数据源
      dataSources.value.push({
        id: Date.now(),
        ...dataSourceForm.value,
        connectionStatus: { type: 'warning', text: '未连接' },
        lastSync: '-'
      })
    }

    showCreateDialog.value = false
    ElMessage.success(editingDataSource.value ? '更新成功' : '创建成功')
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单填写是否正确')
  }
}
</script>

<style scoped>
.datasource-page {
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

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
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

/* 添加一些响应式调整 */
@media (max-width: 768px) {
  .search-input {
    width: 200px;
  }
  
  .el-dialog {
    width: 90% !important;
  }
}
</style> 