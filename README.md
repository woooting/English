# English Learning Platform

一个面向英语学习场景的全栈练习平台，集成「词库检索、课程学习、AI 对话、支付购买、学习摘要」等能力。项目采用 pnpm workspace 管理前端、后端与共享类型包，适合作为 Vue + NestJS + Prisma + LangChain 的完整业务实践项目。

## 项目亮点

- **AI 英语学习助手**：基于 LangChain 接入 DeepSeek 对话与推理模型，支持不同角色模式、流式输出、历史会话与可选联网搜索。
- **完整学习闭环**：从课程购买、词库筛选、单词练习到掌握记录沉淀，覆盖英语学习平台的核心路径。
- **前后端类型共享**：通过 `packages/common` 维护用户、词库、课程、支付、聊天等 DTO/类型，减少接口字段漂移。
- **多应用后端拆分**：`server` 主服务负责用户、课程、支付、词库与 WebSocket，`ai` 服务独立承载 AI 对话与学习摘要任务。
- **实时支付反馈**：支付宝下单与回调落库后，通过 Socket.IO 主动通知前端支付成功，优化购买体验。
- **现代化前端体验**：Vue 3 + Vite + Element Plus + Tailwind CSS，结合 Three.js 3D 模型、GSAP 动效、SSE 流式消息和语音输入能力。
- **基础设施完整**：Prisma + PostgreSQL 管理业务数据，MinIO 管理课程图片/头像资源，BullMQ + Redis 处理学习摘要邮件任务。

## 功能模块

| 模块 | 说明 |
| --- | --- |
| 首页展示 | 使用 Three.js 模型与 GSAP 滚动动画打造学习产品介绍页 |
| 用户系统 | 支持注册、登录、JWT 刷新、资料编辑、头像上传与登录态持久化 |
| 词库中心 | 支持分页、关键词检索，以及高考、中考、GRE、TOEFL、IELTS、CET4、CET6、考研等标签筛选 |
| 课程中心 | 展示课程列表、我的课程、课程封面、讲师、价格与购买入口 |
| 单词练习 | 按已购买课程拉取未掌握单词，练习后写入掌握记录并累计学习数量 |
| AI 对话 | 支持智能助手、英语大师、商务英语等角色，SSE 流式返回 Markdown 内容 |
| 支付链路 | 支付宝网页支付、订单记录、支付回调、课程解锁与 WebSocket 成功通知 |
| 学习摘要 | 基于 BullMQ 定时任务与 LLM 工具调用生成每日学习摘要，并通过邮件发送 |

## 技术栈

**前端**

- Vue 3 / Vite / TypeScript
- Vue Router / Pinia / pinia-plugin-persistedstate
- Element Plus / Tailwind CSS
- Three.js / GSAP / marked
- Axios / Socket.IO Client / `@microsoft/fetch-event-source`

**后端**

- NestJS 11 / TypeScript
- Prisma 7 / PostgreSQL
- JWT / 全局响应拦截器 / 全局异常过滤器
- Socket.IO / BullMQ / Redis
- MinIO / Nodemailer / Alipay SDK
- LangChain / DeepSeek / LangGraph PostgreSQL Checkpoint

**工程化**

- pnpm workspace monorepo
- 共享配置包：`@en/config`
- 共享类型包：`@en/common`
- 共享 Nest 基础设施库：`server/libs/shared`

## 项目结构

```text
.
├── apps/
│   └── vue/                 # 前端应用：页面、路由、状态、API、3D 模型资源
├── packages/
│   ├── common/              # 前后端共享类型：user、word、course、pay、chat、learn
│   └── config/              # 共享端口等基础配置
├── server/
│   ├── apps/
│   │   ├── server/          # 主业务服务：用户、词库、课程、支付、学习、Socket
│   │   └── ai/              # AI 服务：聊天、提示词、学习摘要任务
│   ├── libs/
│   │   └── shared/          # Prisma、响应封装、鉴权、MinIO、支付、邮件、拦截器
│   └── prisma/              # 数据模型、迁移、种子脚本与课程封面资源
├── package.json             # 根脚本：统一启动前端、主服务、AI 服务
└── pnpm-workspace.yaml      # workspace 配置
```

## 架构设计

```text
Vue Web(8080)
  ├─ /api/v1  ───────────────> Nest Server(3000)
  │                             ├─ User / WordBook / Course / Learn / Pay
  │                             ├─ Prisma -> PostgreSQL
  │                             ├─ MinIO -> 头像与课程封面
  │                             └─ Socket.IO -> 支付成功通知
  └─ /ai/v1   ───────────────> Nest AI(3001)
                                ├─ Chat / Prompt / Digest
                                ├─ LangChain -> DeepSeek
                                ├─ Checkpoint -> PostgreSQL
                                └─ BullMQ -> Redis -> Email
```

前端通过 Vite proxy 将 `/api` 和 `/ai` 分别转发到主业务服务与 AI 服务。后端公共能力抽入 `server/libs/shared`，业务接口与前端模型通过 `packages/common` 共享类型定义，降低跨端维护成本。

## 快速开始

> 需要先准备 Node.js、pnpm、PostgreSQL、Redis、MinIO，以及 DeepSeek/支付宝/邮件等相关环境变量。

```bash
pnpm install
pnpm run all
```

常用脚本：

```bash
pnpm run web       # 启动前端，默认端口 8080
pnpm run server    # 启动主业务服务，默认端口 3000
pnpm run ai        # 启动 AI 服务，默认端口 3001
pnpm run all       # 同时启动前端、主服务与 AI 服务
```

服务启动后：

- 前端访问：`http://localhost:8080`
- 主服务接口：`http://localhost:3000/api/v1`
- AI 服务接口：`http://localhost:3001/ai/v1`

## 环境变量参考

项目会从 `server/.env` 读取服务端配置，代码中涉及的关键变量包括：

```env
DATABASE_URL=
AI_DATABASE_URL=
SECRET_KEY=

REDIS_HOST=
REDIS_PORT=

MINIO_ENDPOINT=
MINIO_PORT=
MINIO_USE_SSL=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

DEEPSEEK_API_KEY=
DEEPSEEK_API_MODEL=
DEEPSEEK_REASONER_API_MODEL=
BOCHA_SEARCH_URL=
BOCHA_API_KEY=

ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_GATEWAY=
ALIPAY_NOTIFY_URL=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USE_SSL=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

## 数据与资源

- Prisma schema 位于 `server/prisma/schema.prisma`，包含用户、词库、课程、支付记录、课程购买记录和单词掌握记录。
- 课程种子与封面上传逻辑位于 `server/prisma/seed.ts`，会将课程图片上传至 MinIO 的 `course` bucket。
- 前端 3D 模型资源位于 `apps/vue/public/models`，分别用于首页、登录、注册等展示场景。

## 适合展示的工程特点

- **业务完整度高**：不仅有页面展示，也包含登录鉴权、订单支付、学习记录、AI 能力与定时任务。
- **模块边界清晰**：前端视图、API 层、共享类型、后端业务模块、基础设施模块职责分离。
- **扩展性好**：新增学习类型时，可以沿用课程表 `value` 与词库标签字段扩展；新增 AI 角色时，可在 Prompt 配置中集中维护。
- **体验细节丰富**：支持 Token 自动刷新、支付实时通知、Markdown 渲染、SSE 流式对话和头像对象存储。

