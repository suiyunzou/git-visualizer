# Git Visualizer

一个帮助初学者学习Git的可视化学习平台。

## 功能特点

- Git工作流程可视化
- 交互式信息展示
- 详细的组件说明和操作指导
- Git命令实践模块
- 循序渐进的教程系统

## 技术栈

- Vue 3
- Vuex
- Vue Router
- D3.js
- Element Plus

## 开始使用

1. 克隆项目
```bash
git clone [repository-url]
cd git-visualizer
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 可复用的UI组件
│   ├── common/         # 通用组件
│   ├── git/            # Git相关组件
│   └── tutorial/       # 教程相关组件
├── models/             # 数据模型
├── utils/              # 工具类
├── services/           # 服务层
├── styles/             # 样式文件
└── assets/             # 静态资源
```

## 开发指南

请参考 `technical-design.md` 了解详细的技术设计和开发规范。

## 功能规划

请参考 `features.md` 了解详细的功能列表和开发计划。
