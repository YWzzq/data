<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <img src="../../assets/logo.svg" alt="Logo" class="logo" />
        <el-menu mode="horizontal" :router="true" class="header-menu">
          <el-menu-item index="/">控制台首页</el-menu-item>
          <el-menu-item index="/guide">快速入门</el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-input
          placeholder="搜索..."
          prefix-icon="Search"
          class="search-input"
        />
        <el-button icon="Bell" circle />
        <el-button icon="QuestionFilled" circle />
        <el-dropdown>
          <el-avatar size="small">用户</el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="app-body">
      <!-- 侧边栏 -->
      <aside class="app-sidebar">
        <el-menu
          default-active="1"
          class="side-menu"
          :router="true"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>数据管理</span>
            </template>
            <el-menu-item index="/datasets">数据集管理</el-menu-item>
            <el-menu-item index="/datasources">数据源管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              <el-icon><Edit /></el-icon>
              <span>标注任务</span>
            </template>
            <el-menu-item index="/tasks">标注项目</el-menu-item>
            <el-menu-item index="/labels">标签管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="3">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/users">用户管理</el-menu-item>
            <el-menu-item index="/settings">系统设置</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="app-main">
        <div class="main-container">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
/* 基础布局框架 - 固定尺寸 */
.app-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.app-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 12px;
  box-sizing: border-box;
  position: relative;
  gap: 12px;
}

/* 侧边栏 - 固定宽度 */
.app-sidebar {
  width: 220px;
  background-color: #fff;
  border-radius: 4px;
  flex-shrink: 0;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
}

/* 主内容区 - 自适应 */
.app-main {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: transparent;
  min-width: 0;
}

.main-container {
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 顶部导航栏组件样式 */
.header-left {
  display: flex;
  align-items: center;
}

.logo {
  height: 36px;
  margin-right: 24px;
}

.header-menu {
  border-bottom: none;
  background: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e4e7ed;
  border-radius: 4px;
}

.search-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 0 0 1px #dcdfe6;
}

/* 菜单样式 */
.side-menu {
  border-right: none;
  height: 100%;
  padding: 8px;
}

:deep(.el-menu-item) {
  border-radius: 4px;
  margin: 4px 0;
}

:deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: var(--el-color-primary);
}

:deep(.el-sub-menu__title) {
  border-radius: 4px;
  margin: 4px 0;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #f5f7fa;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .app-sidebar {
    width: 64px;
    padding: 0;
  }
  
  .search-input {
    display: none;
  }

  .app-body {
    padding: 8px 8px 8px 0;
  }
}

/* 确保子组件样式正确 */
:deep(.el-menu) {
  border-right: none !important;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

/* 按钮样式优化 */
:deep(.el-button.is-circle) {
  box-shadow: 0 0 0 1px #e4e7ed;
  &:hover {
    box-shadow: 0 0 0 1px #dcdfe6;
  }
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style> 