<template>
    <div class="new-data-deduplication-task-page">
      <h1>新建数据去重任务</h1>
      <p>请根据以下步骤创建新的数据去重任务。</p>
      <el-form>
        <el-form-item label="选择数据集">
          <el-select v-model="selectedDataset" placeholder="请选择数据集">
            <el-option label="数据集1" value="dataset1"></el-option>
            <el-option label="数据集2" value="dataset2"></el-option>
          </el-select>
          <small>选择需要去重的数据集。</small>
        </el-form-item>
  
        <el-form-item label="去重方案">
          <el-radio-group v-model="deduplicationPlan">
            <el-radio label="standard">通用去重方案</el-radio>
            <el-radio label="custom">定制去重方案</el-radio>
          </el-radio-group>
          <small>选择适合的去重方案。</small>
        </el-form-item>
  
        <el-form-item v-if="deduplicationPlan === 'standard'">
          <h3>去重选项</h3>
          <el-checkbox-group v-model="deduplicationOptions">
            <el-checkbox label="自动去重">自动去重</el-checkbox>
            <el-checkbox label="手动检查">手动检查</el-checkbox>
          </el-checkbox-group>
          <small>选择去重选项以优化数据处理。</small>
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
  const deduplicationPlan = ref('standard')
  const deduplicationOptions = ref([])
  </script>
  
  <style scoped>
  .new-data-deduplication-task-page {
    padding: 20px;
  }
  </style>