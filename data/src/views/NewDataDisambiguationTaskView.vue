<template>
    <div class="new-data-disambiguation-task-page">
      <h1>新建数据消歧任务</h1>
      <p>请根据以下步骤创建新的数据消歧任务。</p>
      <el-form>
        <el-form-item label="选择数据集">
          <el-select v-model="selectedDataset" placeholder="请选择数据集">
            <el-option label="数据集1" value="dataset1"></el-option>
            <el-option label="数据集2" value="dataset2"></el-option>
          </el-select>
          <small>选择需要消歧的数据集。</small>
        </el-form-item>
  
        <el-form-item label="消歧方案">
          <el-radio-group v-model="disambiguationPlan">
            <el-radio label="standard">通用消歧方案</el-radio>
            <el-radio label="custom">定制消歧方案</el-radio>
          </el-radio-group>
          <small>选择适合的消歧方案。</small>
        </el-form-item>
  
        <el-form-item v-if="disambiguationPlan === 'standard'">
          <h3>消歧选项</h3>
          <el-checkbox-group v-model="disambiguationOptions">
            <el-checkbox label="自动消歧">自动消歧</el-checkbox>
            <el-checkbox label="手动调整">手动调整</el-checkbox>
          </el-checkbox-group>
          <small>选择消歧选项以优化数据处理。</small>
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary">提交</el-button>
          <el-button>返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElCheckbox, ElCheckboxGroup, ElRadio, ElRadioGroup, ElSelect, ElOption, ElForm, ElFormItem, ElButton } from 'element-plus'
  
  const selectedDataset = ref('')
  const disambiguationPlan = ref('standard')
  const disambiguationOptions = ref([])
  </script>
  
  <style scoped>
  .new-data-disambiguation-task-page {
    padding: 20px;
  }
  </style>