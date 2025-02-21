<template>
  <div class="data-generation-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据合成</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.data-generation-page {
  padding: 20px;
}

.main-content {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 4px;
  min-height: 500px;
}
</style> 