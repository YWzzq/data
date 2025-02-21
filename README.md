# 数据标注平台

一个现代化的数据处理和标注平台，支持多种数据源接入、数据清洗、人工标注和AI辅助标注功能。

## 功能特性

### 数据管理
- 支持多种格式文件上传（TXT、CSV等）
- 数据集管理和预览
- 基础数据信息统计

### 数据处理
- 文本数据清洗
- 格式转换
- 数据质量检查

### 数据标注
- 直观的人工标注界面
- AI辅助标注
- 标注任务管理
- 标注质量控制

## 技术栈

### 前端
- Vue 3
- TypeScript
- Element Plus
- Pinia
- Vue Router
- Axios

### 后端
- Python
- FastAPI
- SQLite
- 文件系统存储

## 快速开始

### 环境要求
- Node.js >= 16
- Python >= 3.8
- Vue CLI

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装前端依赖
```bash
cd frontend
npm install
```

3. 安装后端依赖
```bash
cd backend
pip install -r requirements.txt
```

4. 启动开发服务器

前端：
```bash
cd frontend
npm run dev
```

后端：
```bash
cd backend
uvicorn main:app --reload
```

## 项目结构

```
├── frontend/                # 前端项目目录
│   ├── src/                # 源代码
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── router/        # 路由配置
│   │   ├── store/         # 状态管理
│   │   └── api/           # API接口
│   └── public/            # 公共资源
│
├── backend/               # 后端项目目录
│   ├── api/              # API接口
│   ├── models/           # 数据模型
│   ├── services/         # 业务逻辑
│   ├── utils/            # 工具函数
│   └── config/           # 配置文件

```

## 使用指南

### 数据上传
1. 登录系统
2. 进入数据管理页面
3. 点击"上传文件"按钮
4. 选择要上传的文件
5. 填写数据集基本信息
6. 确认上传

### 数据标注
1. 进入标注任务页面
2. 选择或创建标注任务
3. 进入标注界面
4. 选择标签进行标注
5. 使用AI辅助功能（可选）
6. 保存标注结果

## 开发规范

### 代码规范
- 使用ESLint进行代码检查
- 遵循Vue 3组件命名规范
- 使用TypeScript类型声明

### Git提交规范
提交信息格式：
```
<type>(<scope>): <subject>

<body>
```

type类型：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 版本历史

- 0.1.0 (开发中)
  - 基础项目架构搭建
  - 文件上传功能
  - 基础标注界面

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

项目维护者 - [维护者邮箱]

项目地址：[项目链接] 