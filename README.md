# blog-frontend

个人博客系统前端 —— Vue 3 单页应用，与后端通过 RESTful API + JWT 交互。

- 在线体验：http://47.94.95.8
- 前端仓库：https://github.com/liushiqi-dev/blog-frontend
- 后端仓库：https://github.com/liushiqi-dev/my-blog-backend

## 技术栈

Vue 3 · Vite · Element Plus · Axios · Pinia · Vue Router

## 功能特性

- 文章列表 / 详情浏览，浏览量、点赞数展示
- 点赞交互：乐观更新 + 已赞状态高亮
- 用户注册 / 登录（JWT 存储于 localStorage）
- 管理员权限控制：分类、写文章入口仅管理员可见，路由守卫拦截非管理员访问
- Axios 拦截器统一携带 Token、统一处理 401 / 业务错误

## 快速开始

```bash
npm install
npm run dev     # 开发环境 http://localhost:5173
npm run build   # 打包产物输出至 dist/
```

开发环境通过 Vite 代理将 `/api` 转发至后端 `http://localhost:8080`。

## 部署说明

`npm run build` 产物（dist/）由 Nginx 容器承载，与后端、MySQL、Redis、RabbitMQ
一同通过 Docker Compose 编排，详见后端仓库。
