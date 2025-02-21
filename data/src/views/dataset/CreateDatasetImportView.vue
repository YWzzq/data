<template>
  <el-form
    ref="importFormRef"
    :model="importForm"
    :rules="formRules"
    label-width="120px"
    class="import-form"
    @submit.prevent
  >
    <!-- 数据标注状态 -->
    <el-form-item label="数据标注状态" prop="hasAnnotation">
      <el-radio-group v-model="importForm.hasAnnotation">
        <el-radio :value="false">无标注信息</el-radio>
        <el-radio :value="true">有标注信息</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 导入方式 -->
    <el-form-item label="导入方式" prop="importType">
      <el-select v-model="importForm.importType" placeholder="请选择导入方式">
        <el-option label="本地导入" value="local" />
        <el-option label="URL导入" value="url" />
      </el-select>
    </el-form-item>

    <!-- 文件类型 -->
    <el-form-item label="文件类型" prop="fileType">
      <el-select v-model="importForm.fileType" placeholder="请选择文件类型">
        <el-option
          v-for="option in fileTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>

    <!-- 文本数据配置 -->
    <template v-if="dataType === '文本'">
      <el-form-item label="文本编码" prop="textConfig.encoding">
        <el-select v-model="importForm.textConfig.encoding">
          <el-option label="UTF-8" value="utf-8" />
          <el-option label="GBK" value="gbk" />
          <el-option label="ASCII" value="ascii" />
        </el-select>
      </el-form-item>

      <el-form-item label="分隔符" prop="separator" v-if="importForm.fileType === 'txt'">
        <el-radio-group v-model="importForm.separator">
          <el-radio value="line">换行符</el-radio>
          <el-radio value="semicolon">分号</el-radio>
          <el-radio value="tab">制表符</el-radio>
          <el-radio value="space">空格</el-radio>
          <el-radio value="custom">自定义</el-radio>
        </el-radio-group>
        <el-input
          v-if="importForm.separator === 'custom'"
          v-model="importForm.customSeparator"
          placeholder="请输入自定义分隔符"
          class="custom-separator-input"
        />
      </el-form-item>

      <el-form-item label="文本处理">
        <el-checkbox v-model="importForm.textConfig.skipEmptyLines">跳过空行</el-checkbox>
        <el-checkbox v-model="importForm.textConfig.trimSpaces">去除首尾空格</el-checkbox>
      </el-form-item>
    </template>

    <!-- 图片数据配置 -->
    <template v-else-if="dataType === '图片'">
      <el-form-item label="图片格式" prop="imageConfig.formats">
        <el-checkbox-group v-model="importForm.imageConfig.formats">
          <el-checkbox label="jpg">JPG</el-checkbox>
          <el-checkbox label="png">PNG</el-checkbox>
          <el-checkbox label="jpeg">JPEG</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="大小限制" prop="imageConfig.sizeLimit">
        <el-input-number 
          v-model="importForm.imageConfig.sizeLimit"
          :min="1"
          :max="50"
          :step="1"
          placeholder="单位：MB"
        />
        <div class="form-tip">单个文件大小限制，最大50MB</div>
      </el-form-item>

      <el-form-item label="预处理选项">
        <el-checkbox v-model="importForm.imageConfig.preprocessOptions.resize">调整尺寸</el-checkbox>
        <el-checkbox v-model="importForm.imageConfig.preprocessOptions.normalize">标准化</el-checkbox>
        <el-checkbox v-model="importForm.imageConfig.preprocessOptions.grayscale">灰度化</el-checkbox>
      </el-form-item>

      <el-form-item 
        label="目标尺寸" 
        v-if="importForm.imageConfig.preprocessOptions.resize"
      >
        <el-row :gutter="12">
          <el-col :span="11">
            <el-input-number 
              v-model="importForm.imageConfig.width"
              :min="1"
              placeholder="宽度（像素）"
            />
          </el-col>
          <el-col :span="2" class="text-center">×</el-col>
          <el-col :span="11">
            <el-input-number 
              v-model="importForm.imageConfig.height"
              :min="1"
              placeholder="高度（像素）"
            />
          </el-col>
        </el-row>
      </el-form-item>
    </template>

    <!-- 音频数据配置 -->
    <template v-else-if="dataType === '音频'">
      <el-form-item label="音频格式" prop="audioConfig.formats">
        <el-checkbox-group v-model="importForm.audioConfig.formats">
          <el-checkbox label="mp3">MP3</el-checkbox>
          <el-checkbox label="wav">WAV</el-checkbox>
          <el-checkbox label="ogg">OGG</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="时长限制" prop="audioConfig.maxDuration">
        <el-input-number 
          v-model="importForm.audioConfig.maxDuration"
          :min="1"
          :max="3600"
          :step="60"
          placeholder="单位：秒"
        />
        <div class="form-tip">单个文件最大时长限制</div>
      </el-form-item>

      <el-form-item label="采样率" prop="audioConfig.sampleRate">
        <el-select v-model="importForm.audioConfig.sampleRate">
          <el-option label="8000 Hz" :value="8000" />
          <el-option label="16000 Hz" :value="16000" />
          <el-option label="44100 Hz" :value="44100" />
          <el-option label="48000 Hz" :value="48000" />
        </el-select>
      </el-form-item>

      <el-form-item label="预处理选项">
        <el-checkbox v-model="importForm.audioConfig.preprocessOptions.normalize">音量标准化</el-checkbox>
        <el-checkbox v-model="importForm.audioConfig.preprocessOptions.denoise">降噪</el-checkbox>
        <el-checkbox v-model="importForm.audioConfig.preprocessOptions.trim">去除静音</el-checkbox>
      </el-form-item>
    </template>

    <!-- 视频数据配置 -->
    <template v-else-if="dataType === '视频'">
      <el-form-item label="视频格式" prop="videoConfig.formats">
        <el-checkbox-group v-model="importForm.videoConfig.formats">
          <el-checkbox label="mp4">MP4</el-checkbox>
          <el-checkbox label="avi">AVI</el-checkbox>
          <el-checkbox label="mov">MOV</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="时长限制" prop="videoConfig.maxDuration">
        <el-input-number 
          v-model="importForm.videoConfig.maxDuration"
          :min="1"
          :max="7200"
          :step="60"
          placeholder="单位：秒"
        />
        <div class="form-tip">单个文件最大时长限制</div>
      </el-form-item>

      <el-form-item label="分辨率" prop="videoConfig.resolution">
        <el-select v-model="importForm.videoConfig.resolution">
          <el-option label="480p" value="480p" />
          <el-option label="720p" value="720p" />
          <el-option label="1080p" value="1080p" />
          <el-option label="4K" value="4k" />
        </el-select>
      </el-form-item>

      <el-form-item label="预处理选项">
        <el-checkbox v-model="importForm.videoConfig.preprocessOptions.resize">调整分辨率</el-checkbox>
        <el-checkbox v-model="importForm.videoConfig.preprocessOptions.compress">压缩</el-checkbox>
        <el-checkbox v-model="importForm.videoConfig.preprocessOptions.extractFrames">提取关键帧</el-checkbox>
      </el-form-item>
    </template>

    <!-- 表格数据配置 -->
    <template v-else-if="dataType === '表格'">
      <el-form-item label="表头行" prop="excelConfig.headerRow">
        <el-input-number 
          v-model="importForm.excelConfig.headerRow"
          :min="1"
          :max="10"
          placeholder="表头所在行号"
        />
        <div class="form-tip">指定表头所在的行号，从1开始计数</div>
      </el-form-item>

      <el-form-item label="数据范围" prop="excelConfig.dataRange">
        <el-row :gutter="12">
          <el-col :span="11">
            <el-input-number 
              v-model="importForm.excelConfig.dataRange[0]"
              :min="1"
              placeholder="起始行"
            />
          </el-col>
          <el-col :span="2" class="text-center">至</el-col>
          <el-col :span="11">
            <el-input-number 
              v-model="importForm.excelConfig.dataRange[1]"
              placeholder="结束行（可选）"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="数据处理">
        <el-checkbox v-model="importForm.excelConfig.skipEmpty">跳过空行</el-checkbox>
      </el-form-item>
    </template>

    <!-- 文件上传 -->
    <el-form-item label="上传文件" prop="fileList" required>
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="importForm.fileList"
        :accept="supportedFileTypes"
        :multiple="dataType === '图片'"
        :limit="dataType === '图片' ? 100 : 1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 {{ supportedFileTypes }} 格式文件
            <template v-if="dataType === '图片'">，可同时上传多个文件</template>
            <template v-else>，单个文件不超过50MB</template>
          </div>
        </template>
      </el-upload>
    </el-form-item>

    <!-- 数据去重 -->
    <el-form-item label="数据去重" prop="deduplication">
      <el-radio-group v-model="importForm.deduplication">
        <el-radio :value="true">自动去重</el-radio>
        <el-radio :value="false">不去重</el-radio>
      </el-radio-group>
      <el-tooltip content="选择自动去重后，系统会对重复的数据进行去重处理" placement="right">
        <el-icon class="info-icon"><info-filled /></el-icon>
      </el-tooltip>
    </el-form-item>

    <!-- 导入记录 -->
    <el-form-item label="导入记录">
      <div class="import-record">
        <el-empty description="暂无导入记录" />
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue'

const importFormRef = ref(null)
const uploadRef = ref(null)

// 从父组件获取数据类型
const dataType = inject('dataType', ref('文本'))

// 文件类型配置
const fileTypeOptions = computed(() => {
  switch (dataType.value) {
    case '文本':
      return [
        { label: 'TXT文本', value: 'txt' },
        { label: 'CSV文件', value: 'csv' },
        { label: 'JSON文件', value: 'json' }
      ]
    case '图片':
      return [
        { label: '图片文件', value: 'image' },
        { label: '图片压缩包', value: 'zip' }
      ]
    case '音频':
      return [
        { label: '音频文件', value: 'audio' },
        { label: '音频压缩包', value: 'zip' }
      ]
    case '视频':
      return [
        { label: '视频文件', value: 'video' },
        { label: '视频压缩包', value: 'zip' }
      ]
    case '表格':
      return [
        { label: 'Excel文件', value: 'excel' },
        { label: 'CSV文件', value: 'csv' }
      ]
    case '跨模态':
      return [
        { label: '图文数据', value: 'image_text' },
        { label: '音视频文本', value: 'audio_video_text' }
      ]
    default:
      return []
  }
})

// 导入配置表单
const importForm = ref({
  hasAnnotation: false,
  importType: 'local',
  fileType: '',
  separator: 'line',
  customSeparator: '',
  deduplication: true,
  fileList: [],
  
  // 文本配置
  textConfig: {
    encoding: 'utf-8',
    skipEmptyLines: true,
    trimSpaces: true
  },
  
  // 图片配置
  imageConfig: {
    formats: ['jpg', 'png', 'jpeg'],
    sizeLimit: 5,
    width: 0,
    height: 0,
    preprocessOptions: {
      resize: false,
      normalize: false,
      grayscale: false
    }
  },
  
  // 音频配置
  audioConfig: {
    formats: ['mp3', 'wav', 'ogg'],
    sizeLimit: 50,
    maxDuration: 600, // 10分钟
    sampleRate: 16000,
    preprocessOptions: {
      normalize: false,
      denoise: false,
      trim: false
    }
  },
  
  // 视频配置
  videoConfig: {
    formats: ['mp4', 'avi', 'mov'],
    sizeLimit: 200,
    maxDuration: 1800, // 30分钟
    resolution: '720p',
    preprocessOptions: {
      resize: false,
      compress: false,
      extractFrames: false
    }
  },
  
  // 表格配置
  excelConfig: {
    headerRow: 1,
    dataRange: [2, null],
    sheets: [],
    skipEmpty: true
  }
})

// 监听数据类型变化，更新文件类型和相关配置
watch(() => dataType.value, (newType) => {
  // 重置文件列表
  importForm.value.fileList = []
  
  // 根据数据类型设置默认文件类型
  switch (newType) {
    case '文本':
      importForm.value.fileType = 'txt'
      break
    case '图片':
      importForm.value.fileType = 'image'
      break
    case '音频':
      importForm.value.fileType = 'audio'
      break
    case '视频':
      importForm.value.fileType = 'video'
      break
    case '表格':
      importForm.value.fileType = 'excel'
      break
    case '跨模态':
      importForm.value.fileType = 'image_text'
      break
  }
}, { immediate: true })

// 支持的文件类型
const supportedFileTypes = computed(() => {
  switch (dataType.value) {
    case '文本':
      switch (importForm.value.fileType) {
        case 'txt': return '.txt'
        case 'csv': return '.csv'
        case 'json': return '.json'
        default: return '.txt,.csv,.json'
      }
    case '图片':
      return importForm.value.imageConfig.formats.map(format => `.${format}`).join(',')
    case '音频':
      return importForm.value.audioConfig.formats.map(format => `.${format}`).join(',')
    case '视频':
      return importForm.value.videoConfig.formats.map(format => `.${format}`).join(',')
    case '表格':
      return '.xlsx,.xls,.csv'
    case '跨模态':
      return '.zip'
    default:
      return '*'
  }
})

// 获取当前配置
const currentConfig = computed(() => {
  switch (dataType.value) {
    case '图片': return importForm.value.imageConfig
    case '音频': return importForm.value.audioConfig
    case '视频': return importForm.value.videoConfig
    case '表格': return importForm.value.excelConfig
    default: return importForm.value.textConfig
  }
})

// 表单验证规则
const formRules = {
  hasAnnotation: [
    { required: true, message: '请选择数据标注状态', trigger: 'change' }
  ],
  importType: [
    { required: true, message: '请选择导入方式', trigger: 'change' }
  ],
  fileType: [
    { required: true, message: '请选择文件类型', trigger: 'change' }
  ],
  separator: [
    { 
      required: true, 
      message: '请选择分隔符', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (importForm.value.fileType === 'txt' && !value) {
          callback(new Error('请选择分隔符'))
        } else {
          callback()
        }
      }
    }
  ],
  customSeparator: [
    { 
      validator: (rule, value, callback) => {
        if (importForm.value.separator === 'custom' && !value) {
          callback(new Error('请输入自定义分隔符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  imageFormat: [
    { 
      type: 'array',
      required: true,
      message: '请至少选择一种图片格式',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (dataType.value === '图片' && (!value || value.length === 0)) {
          callback(new Error('请至少选择一种图片格式'))
        } else {
          callback()
        }
      }
    }
  ],
  sizeLimit: [
    { 
      required: true,
      type: 'number',
      message: '请设置文件大小限制',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (dataType.value === '图片') {
          if (!value || value < 1 || value > 50) {
            callback(new Error('文件大小限制必须在1-50MB之间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ],
  fileList: [
    {
      required: true,
      message: '请上传文件',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请上传文件'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 文件上传处理
const handleFileChange = (file) => {
  // 获取当前配置
  const config = currentConfig.value
  
  // 文件大小限制
  const maxSize = (config.sizeLimit || 50) * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error(`文件大小不能超过${config.sizeLimit || 50}MB`)
    return false
  }

  // 文件类型验证
  const extension = file.name.split('.').pop().toLowerCase()
  const allowedFormats = config.formats || []
  if (allowedFormats.length && !allowedFormats.includes(extension)) {
    ElMessage.error(`只支持 ${allowedFormats.join(', ')} 格式的文件`)
    return false
  }

  // 更新文件列表
  if (dataType.value === '图片' || dataType.value === '音频') {
    importForm.value.fileList.push(file)
  } else {
    importForm.value.fileList = [file]
  }

  return false // 阻止自动上传
}

// 文件移除处理
const handleFileRemove = (file) => {
  const index = importForm.value.fileList.indexOf(file)
  if (index !== -1) {
    importForm.value.fileList.splice(index, 1)
  }
}

// 导出给父组件使用
defineExpose({
  importForm,
  validate: () => importFormRef.value?.validate(),
  upload: () => {
    return new Promise((resolve) => {
      // TODO: 实现文件上传逻辑
      setTimeout(() => {
        resolve({ success: true })
      }, 1000)
    })
  }
})
</script>

<style scoped>
.import-form {
  max-width: 800px;
}

.info-icon {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  cursor: help;
}

.import-record {
  padding: 20px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.custom-separator-input {
  width: 200px;
  margin-top: 12px;
}

.form-item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

:deep(.el-upload-list) {
  width: 100%;
}
</style> 