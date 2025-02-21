<template>
  <div class="new-data-cleaning-task-page">
    <h1>新建数据清洗任务</h1>
    <el-tabs v-model="cleaningType">
      <el-tab-pane label="图片数据集清洗" name="image">
        <el-form>
          <el-form-item label="清洗前">
            <el-select v-model="preCleaningDataset" placeholder="请选择数据集">
              <el-option label="数据集A" value="datasetA"></el-option>
              <el-option label="数据集B" value="datasetB"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="清洗后">
            <el-select v-model="selectedDataset" placeholder="请选择数据集">
              <el-option label="数据集1" value="dataset1"></el-option>
              <el-option label="数据集2" value="dataset2"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="清洗方案">
            <el-radio-group v-model="cleaningPlan">
              <el-radio label="standard">通用清洗方案</el-radio>
              <el-radio label="custom">定制清洗方案</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="cleaningPlan === 'standard'">
            <h3>图片清洗选项</h3>
            <el-checkbox-group v-model="imageCleaningOptions">
              <el-checkbox label="去重">去重</el-checkbox>
              <el-checkbox label="去模糊">去模糊</el-checkbox>
              <el-checkbox label="去噪声">去噪声</el-checkbox>
              <el-checkbox label="调整亮度">调整亮度</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item v-if="cleaningPlan === 'custom'">
            <h3>选择模型</h3>
            <el-radio-group v-model="modelType">
              <el-radio label="local">导入本地模型</el-radio>
              <el-radio label="online">在线模型选择</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary">提交</el-button>
            <el-button>返回</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="文本数据集清洗" name="text">
        <el-form>
          <el-form-item label="清洗前">
            <el-select v-model="preCleaningDataset" placeholder="请选择数据集">
              <el-option label="数据集A" value="datasetA"></el-option>
              <el-option label="数据集B" value="datasetB"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="清洗后">
            <el-select v-model="selectedDataset" placeholder="请选择数据集">
              <el-option label="数据集1" value="dataset1"></el-option>
              <el-option label="数据集2" value="dataset2"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="清洗方案">
            <el-radio-group v-model="cleaningPlan">
              <el-radio label="standard">通用清洗方案</el-radio>
              <el-radio label="custom">定制清洗方案</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="cleaningPlan === 'standard'">
            <h3>文本清洗选项</h3>
            <el-checkbox-group v-model="textCleaningOptions">
              <el-checkbox label="去除特殊字符">去除特殊字符</el-checkbox>
              <el-checkbox label="去除emoji">去除emoji</el-checkbox>
              <el-checkbox label="去除url">去除url</el-checkbox>
              <el-checkbox label="繁体转简体">繁体转简体</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item v-if="cleaningPlan === 'custom'">
            <h3>选择模型</h3>
            <el-radio-group v-model="modelType">
              <el-radio label="local">导入本地模型</el-radio>
              <el-radio label="online">在线模型选择</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary">提交</el-button>
            <el-button>返回</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElCheckbox, ElCheckboxGroup, ElRadio, ElRadioGroup, ElSelect, ElOption, ElForm, ElFormItem, ElButton, ElTabs, ElTabPane } from 'element-plus'

const preCleaningDataset = ref('')
const cleaningType = ref('image')
const selectedDataset = ref('')
const cleaningPlan = ref('standard')
const textCleaningOptions = ref([])
const imageCleaningOptions = ref([])
const modelType = ref('local')
</script>

<style scoped>
.new-data-cleaning-task-page {
  padding: 20px;
}
</style> 