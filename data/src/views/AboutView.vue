<template>
  <div class="about-page">
    <!-- 实验室介绍 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <h2 class="title">实验室介绍</h2>
        </div>
      </template>
      <div class="lab-intro">
        <img src="../assets/logo.svg" alt="Logo" class="logo">
        <h3 class="lab-name">TYUT-THETA实验室</h3>
        <p class="desc">TYUT-THETA实验室隶属于太原理工大学计算机科学与技术学院（大数据学院），专注于人工智能、大数据处理、自然语言处理等领域的研究与应用。</p>
      </div>
    </el-card>

    <!-- 研究方向 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <h3>研究方向</h3>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="research-item">
            <el-icon class="icon"><DataLine /></el-icon>
            <h4>大数据处理与分析</h4>
            <ul>
              <li>大规模数据处理</li>
              <li>数据挖掘与分析</li>
              <li>数据可视化</li>
            </ul>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="research-item">
            <el-icon class="icon"><ChatLineRound /></el-icon>
            <h4>自然语言处理</h4>
            <ul>
              <li>文本分类与生成</li>
              <li>信息抽取</li>
              <li>机器翻译</li>
            </ul>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="research-item">
            <el-icon class="icon"><Monitor /></el-icon>
            <h4>人工智能应用</h4>
            <ul>
              <li>深度学习</li>
              <li>机器学习</li>
              <li>智能系统开发</li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 实验室成果 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <h3>实验室成果</h3>
        </div>
      </template>
      <div class="achievements">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="achievement-section">
              <h4>科研项目</h4>
              <ul>
                <li>国家自然科学基金项目</li>
                <li>省部级重点研发项目</li>
                <li>企业合作项目</li>
              </ul>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="achievement-section">
              <h4>学术成果</h4>
              <ul>
                <li>高水平学术论文发表</li>
                <li>专利与软件著作权</li>
                <li>学术交流与合作</li>
              </ul>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 联系方式 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>联系方式</h3>
        </div>
      </template>
      <div class="contact-info">
        <p><strong>实验室：</strong>TYUT-THETA实验室</p>
        <p><strong>邮箱：</strong>tyuttheta@163.com</p>
        <p><strong>地址：</strong>山西省晋中市榆次区大学街209号太原理工大学明向校区计算机科学与技术学院（大数据学院）</p>
        <p><strong>具体位置：</strong>信计南楼8层820</p>
        <p><strong>官网：</strong><a href="https://lab.rjmart.cn/10787/tyuttheta" target="_blank">https://lab.rjmart.cn/10787/tyuttheta</a></p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { DataLine, ChatLineRound, Monitor } from '@element-plus/icons-vue'
</script>

<style scoped>
.about-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  
  h2, h3 {
    margin: 0;
    font-weight: 500;
  }
}

.lab-intro {
  text-align: center;
  padding: 20px 0;

  .logo {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
  }

  .lab-name {
    font-size: 24px;
    font-weight: 500;
    color: var(--el-color-primary);
    margin: 0 0 16px;
  }

  .desc {
    font-size: 16px;
    color: var(--el-text-color-regular);
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.research-item {
  text-align: center;
  padding: 20px;

  .icon {
    font-size: 40px;
    color: var(--el-color-primary);
    margin-bottom: 16px;
  }

  h4 {
    margin: 0 0 16px;
    font-weight: 500;
  }

  ul {
    text-align: left;
    padding-left: 20px;
    margin: 0;
    color: var(--el-text-color-regular);

    li {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.achievement-section {
  h4 {
    margin: 0 0 16px;
    font-weight: 500;
  }

  ul {
    padding-left: 20px;
    margin: 0;
    color: var(--el-text-color-regular);

    li {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.contact-info {
  p {
    margin: 0 0 12px;
    color: var(--el-text-color-regular);

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: var(--el-text-color-primary);
      margin-right: 8px;
    }

    a {
      color: var(--el-color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
