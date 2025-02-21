<template>
  <div class="general-generation-create">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/data-generation/general' }">一般数据生成</el-breadcrumb-item>
      <el-breadcrumb-item>创建任务</el-breadcrumb-item>
    </el-breadcrumb>

    <el-form :model="generationForm" label-width="120px" class="generation-form">
      <!-- 基本信息 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="任务名称" required>
          <el-input 
            v-model="generationForm.name" 
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="数据类型" required>
          <el-radio-group v-model="generationForm.dataType">
            <el-radio-button label="text">
              <el-icon><Document /></el-icon>文本数据
            </el-radio-button>
            <el-radio-button label="image">
              <el-icon><Picture /></el-icon>图像数据
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生成数量" required>
          <el-input-number 
            v-model="generationForm.count" 
            :min="1" 
            :max="10000"
            controls-position="right"
          />
        </el-form-item>
      </el-card>

      <!-- 数据来源配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>数据来源配置</span>
          </div>
        </template>

        <el-form-item label="数据来源" required>
          <el-radio-group v-model="generationForm.source.type">
            <el-radio label="dataset">已有数据集</el-radio>
            <el-radio label="upload">本地上传</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="generationForm.source.type === 'dataset'">
          <el-form-item label="选择数据集">
            <el-select v-model="generationForm.source.datasetId" placeholder="请选择数据集">
              <el-option
                v-for="dataset in datasets"
                :key="dataset.id"
                :label="dataset.name"
                :value="dataset.id"
              />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="上传文件">
            <el-upload
              class="upload-area"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  {{ generationForm.dataType === 'text' ? '支持 TXT、CSV 格式文件' : '支持 JPG、PNG 格式图片' }}
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </template>
      </el-card>

      <!-- 增强配置 -->
      <el-card class="mb-20">
        <template #header>
          <div class="card-header">
            <span>增强配置</span>
          </div>
        </template>

        <template v-if="generationForm.dataType === 'text'">
          <el-form-item label="增强方式" required>
            <el-checkbox-group v-model="generationForm.enhancement.methods">
              <el-checkbox label="synonym">同义词替换</el-checkbox>
              <el-checkbox label="back_translation">回译</el-checkbox>
              <el-checkbox label="eda">EDA</el-checkbox>
              <el-checkbox label="template">模板生成</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('synonym')"
            label="同义词配置"
          >
            <el-input-number
              v-model="generationForm.enhancement.synonymConfig.replaceRatio"
              :min="0.1"
              :max="1"
              :step="0.1"
              controls-position="right"
            >
              <template #prefix>替换比例</template>
            </el-input-number>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('back_translation')"
            label="回译配置"
          >
            <el-select v-model="generationForm.enhancement.translationConfig.languages" multiple placeholder="选择中间语言">
              <el-option label="英语" value="en" />
              <el-option label="日语" value="ja" />
              <el-option label="韩语" value="ko" />
              <el-option label="法语" value="fr" />
            </el-select>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('eda')"
            label="EDA配置"
          >
            <el-checkbox-group v-model="generationForm.enhancement.edaConfig.operations">
              <el-checkbox label="insert">随机插入</el-checkbox>
              <el-checkbox label="delete">随机删除</el-checkbox>
              <el-checkbox label="swap">随机交换</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('template')"
            label="模板配置"
          >
            <el-input
              v-model="generationForm.enhancement.templateConfig.template"
              type="textarea"
              :rows="3"
              placeholder="请输入文本模板，使用 {slot} 表示变量位置"
            />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="增强方式" required>
            <el-checkbox-group v-model="generationForm.enhancement.methods">
              <el-checkbox label="flip">翻转</el-checkbox>
              <el-checkbox label="rotate">旋转</el-checkbox>
              <el-checkbox label="noise">添加噪声</el-checkbox>
              <el-checkbox label="color">颜色变换</el-checkbox>
              <el-checkbox label="crop">裁剪</el-checkbox>
              <el-checkbox label="scale">缩放</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('rotate')"
            label="旋转配置"
          >
            <el-slider
              v-model="generationForm.enhancement.rotateConfig.angle"
              :min="0"
              :max="360"
              :step="15"
              show-input
            >
              <template #prefix>旋转角度</template>
            </el-slider>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('noise')"
            label="噪声配置"
          >
            <el-select v-model="generationForm.enhancement.noiseConfig.type" placeholder="选择噪声类型">
              <el-option label="高斯噪声" value="gaussian" />
              <el-option label="椒盐噪声" value="salt_pepper" />
              <el-option label="泊松噪声" value="poisson" />
            </el-select>
          </el-form-item>

          <el-form-item 
            v-if="generationForm.enhancement.methods.includes('color')"
            label="颜色配置"
          >
            <el-checkbox-group v-model="generationForm.enhancement.colorConfig.operations">
              <el-checkbox label="brightness">亮度调整</el-checkbox>
              <el-checkbox label="contrast">对比度调整</el-checkbox>
              <el-checkbox label="saturation">饱和度调整</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <el-form-item label="增强倍数" required>
          <el-input-number
            v-model="generationForm.enhancement.augmentRatio"
            :min="1"
            :max="10"
            controls-position="right"
          />
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Picture,
  UploadFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据集列表
const datasets = ref([
  { id: 1, name: '新闻文本数据集' },
  { id: 2, name: '商品评论数据集' },
  { id: 3, name: '街景图片数据集' },
  { id: 4, name: '人物照片数据集' }
])

// 表单数据
const generationForm = ref({
  name: '',
  dataType: 'text',
  count: 100,
  source: {
    type: 'dataset',
    datasetId: '',
    file: null
  },
  enhancement: {
    methods: [],
    augmentRatio: 2,
    synonymConfig: {
      replaceRatio: 0.3
    },
    translationConfig: {
      languages: ['en']
    },
    edaConfig: {
      operations: ['insert', 'delete']
    },
    templateConfig: {
      template: ''
    },
    rotateConfig: {
      angle: 90
    },
    noiseConfig: {
      type: 'gaussian'
    },
    colorConfig: {
      operations: ['brightness', 'contrast']
    }
  }
})

// 处理文件上传
const handleFileChange = (file) => {
  generationForm.value.source.file = file
}

// 取消创建
const cancel = () => {
  router.back()
}

// 创建任务
const createTask = () => {
  // 表单验证
  if (!generationForm.value.name.trim()) {
    ElMessage.warning('请输入任务名称')
    return
  }
  if (!generationForm.value.enhancement.methods.length) {
    ElMessage.warning('请选择至少一种增强方式')
    return
  }

  // TODO: 调用API创建任务
  ElMessage.success('任务创建成功')
  router.push({ name: 'general-generation' })
}
</script>

<style scoped>
.general-generation-create {
  padding: 20px;
}

.generation-form {
  max-width: 800px;
  margin: 0 auto;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-area {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style> 