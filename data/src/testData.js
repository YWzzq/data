// 测试数据集
export const testData = {
  // 文本分类数据
  textClassification: [
    {
      id: 1,
      content: "这款手机的屏幕显示效果很好，操作流畅，续航也不错，总体来说很满意。",
      type: "product_review",
      status: "pending"
    },
    {
      id: 2,
      content: "今天的天气真是糟糕，一直在下雨，出门都不方便。",
      type: "sentiment",
      status: "pending"
    },
    {
      id: 3,
      content: "最新研究表明，每天适量运动可以显著提升身体免疫力。",
      type: "news",
      status: "pending"
    },
    {
      id: 4,
      content: "请问如何解决Windows系统蓝屏问题？开机后总是出现错误。",
      type: "tech_support",
      status: "pending"
    },
    {
      id: 5,
      content: "这家餐厅的服务态度很差，菜品质量也一般，不推荐。",
      type: "review",
      status: "pending"
    }
  ],

  // 序列标注数据
  sequenceLabeling: [
    {
      id: 1,
      content: "张三在北京大学计算机系读研究生。",
      type: "ner",
      status: "pending"
    },
    {
      id: 2,
      content: "苹果公司发布了最新款iPhone手机，售价999美元。",
      type: "ner",
      status: "pending"
    },
    {
      id: 3,
      content: "昨天下午3点，李医生在协和医院成功完成了一例心脏手术。",
      type: "ner",
      status: "pending"
    },
    {
      id: 4,
      content: "2024年春节期间，上海迪士尼乐园游客量创下新高。",
      type: "ner",
      status: "pending"
    },
    {
      id: 5,
      content: "中国科学院在量子计算领域取得重大突破。",
      type: "ner",
      status: "pending"
    }
  ],

  // 图像标注数据
  imageAnnotation: [
    {
      id: 1,
      imageUrl: "/images/street.jpg",
      type: "object_detection",
      objects: ["car", "person", "traffic_light"],
      status: "pending"
    },
    {
      id: 2,
      imageUrl: "/images/kitchen.jpg",
      type: "object_detection",
      objects: ["table", "chair", "refrigerator"],
      status: "pending"
    },
    {
      id: 3,
      imageUrl: "/images/park.jpg",
      type: "scene_classification",
      categories: ["outdoor", "nature", "recreation"],
      status: "pending"
    },
    {
      id: 4,
      imageUrl: "/images/animals.jpg",
      type: "object_detection",
      objects: ["cat", "dog", "bird"],
      status: "pending"
    },
    {
      id: 5,
      imageUrl: "/images/office.jpg",
      type: "scene_classification",
      categories: ["indoor", "workplace", "business"],
      status: "pending"
    }
  ],

  // 音频标注数据
  audioAnnotation: [
    {
      id: 1,
      audioUrl: "/audio/speech1.mp3",
      type: "speech_recognition",
      duration: "00:15",
      status: "pending"
    },
    {
      id: 2,
      audioUrl: "/audio/music1.mp3",
      type: "music_classification",
      duration: "00:30",
      status: "pending"
    },
    {
      id: 3,
      audioUrl: "/audio/ambient1.mp3",
      type: "sound_classification",
      duration: "00:20",
      status: "pending"
    }
  ],

  // 视频标注数据
  videoAnnotation: [
    {
      id: 1,
      videoUrl: "/videos/traffic.mp4",
      type: "object_tracking",
      duration: "00:30",
      status: "pending"
    },
    {
      id: 2,
      videoUrl: "/videos/sports.mp4",
      type: "action_recognition",
      duration: "00:45",
      status: "pending"
    },
    {
      id: 3,
      videoUrl: "/videos/cooking.mp4",
      type: "scene_segmentation",
      duration: "01:00",
      status: "pending"
    }
  ]
}

// 标签组配置
export const labelGroups = {
  // 文本分类标签组
  textClassification: {
    sentiment: [
      { id: 1, name: "正面", color: "#67C23A" },
      { id: 2, name: "负面", color: "#F56C6C" },
      { id: 3, name: "中性", color: "#909399" }
    ],
    news: [
      { id: 1, name: "科技", color: "#409EFF" },
      { id: 2, name: "体育", color: "#67C23A" },
      { id: 3, name: "娱乐", color: "#E6A23C" },
      { id: 4, name: "政治", color: "#F56C6C" },
      { id: 5, name: "经济", color: "#909399" }
    ],
    product_review: [
      { id: 1, name: "质量", color: "#409EFF" },
      { id: 2, name: "价格", color: "#67C23A" },
      { id: 3, name: "服务", color: "#E6A23C" },
      { id: 4, name: "物流", color: "#F56C6C" }
    ]
  },

  // 序列标注标签组
  sequenceLabeling: {
    ner: [
      { id: 1, name: "人名", color: "#409EFF" },
      { id: 2, name: "地名", color: "#67C23A" },
      { id: 3, name: "机构", color: "#E6A23C" },
      { id: 4, name: "时间", color: "#F56C6C" },
      { id: 5, name: "数字", color: "#909399" }
    ]
  },

  // 图像标注标签组
  imageAnnotation: {
    object_detection: [
      { id: 1, name: "人", color: "#409EFF" },
      { id: 2, name: "车", color: "#67C23A" },
      { id: 3, name: "动物", color: "#E6A23C" },
      { id: 4, name: "植物", color: "#F56C6C" }
    ],
    scene_classification: [
      { id: 1, name: "室内", color: "#409EFF" },
      { id: 2, name: "室外", color: "#67C23A" },
      { id: 3, name: "自然", color: "#E6A23C" },
      { id: 4, name: "城市", color: "#F56C6C" }
    ]
  }
}

// 标注任务状态
export const taskStatus = {
  PENDING: { text: "待处理", type: "info" },
  IN_PROGRESS: { text: "进行中", type: "warning" },
  COMPLETED: { text: "已完成", type: "success" },
  REVIEWING: { text: "审核中", type: "warning" },
  REJECTED: { text: "已驳回", type: "danger" }
} 