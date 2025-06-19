# CloudDev Platform - 云端开发协作平台

> 🚀 现代化的云原生开发协作平台，提供完整的软件开发生命周期管理解决方案

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/clouddev/platform)
[![Version](https://img.shields.io/badge/version-v2.0.0-blue)](https://github.com/clouddev/platform/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Coverage](https://img.shields.io/badge/coverage-90%25-success)](https://codecov.io/gh/clouddev/platform)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://hub.docker.com/r/clouddev/platform)
[![Kubernetes](https://img.shields.io/badge/kubernetes-compatible-326ce5)](https://kubernetes.io/)

## 📋 目录

- [项目概述](#-项目概述)
- [核心特性](#-核心特性)
- [技术架构](#️-技术架构)
- [快速开始](#-快速开始)
- [API 使用指南](#-api-使用指南)
- [配置指南](#️-配置指南)
- [开发指南](#️-开发指南)
- [部署指南](#-部署指南)
- [故障排除](#-故障排除指南)
- [性能优化](#-性能基准和优化)
- [安全配置](#-安全配置和最佳实践)
- [监控运维](#-监控和运维)
- [贡献指南](#-贡献指南)
- [版本历史](#-版本历史)
- [许可证](#-许可证)
- [联系我们](#-联系我们)

## 📋 项目概述

CloudDev Platform 是一个企业级的云端开发协作平台，集成了 IDE、版本控制、CI/CD、项目管理、团队协作、监控告警、AI 辅助编程和安全合规等功能，为开发团队提供一站式的开发体验。

### 🎯 核心特性

### ☁️ 云端 IDE
- **多语言支持**: 支持 JavaScript、TypeScript、Python、Java、Go、C++、Rust 等 20+ 种编程语言
- **智能编辑**: 基于 Monaco Editor，提供语法高亮、代码补全、错误检测、代码格式化
- **实时协作**: 支持多人同时编辑，实时光标跟踪，冲突自动解决
- **插件生态**: 丰富的插件市场，支持自定义插件开发
- **容器化环境**: 每个工作空间独立的 Docker 容器，环境隔离安全

### 🔄 版本控制
- **Git 深度集成**: 完整的 Git 操作支持，可视化分支管理
- **代码审查**: Pull Request 工作流，在线代码审查和评论
- **分支策略**: 支持 Git Flow、GitHub Flow 等分支策略
- **冲突解决**: 智能合并冲突检测和可视化解决工具
- **历史追踪**: 完整的代码变更历史和文件追踪

### 🔧 CI/CD 流水线
- **可视化配置**: 拖拽式流水线编辑器，所见即所得
- **多环境部署**: 支持开发、测试、预生产、生产环境自动部署
- **容器化构建**: 基于 Docker 的构建环境，支持多种构建工具
- **自动化测试**: 集成单元测试、集成测试、端到端测试
- **部署策略**: 支持蓝绿部署、金丝雀发布、滚动更新

### 📊 项目管理
- **敏捷看板**: 可定制的 Kanban 看板，支持 Scrum 和敏捷开发
- **任务管理**: 用户故事、任务分配、时间追踪、进度管理
- **Sprint 规划**: 迭代规划、燃尽图、速度分析
- **报告分析**: 项目进度报告、团队效率分析、质量指标

### 👥 团队协作
- **实时通信**: 集成聊天、语音通话、视频会议
- **权限管理**: 细粒度的用户权限控制和角色管理
- **活动流**: 项目活动时间线，实时动态更新
- **文档协作**: 在线文档编辑，支持 Markdown 和富文本
- **屏幕共享**: 支持远程协助和代码演示

### 📈 监控告警
- **应用监控**: APM 性能监控，响应时间、吞吐量、错误率
- **基础设施监控**: 服务器资源监控，CPU、内存、磁盘、网络
- **智能告警**: 基于机器学习的异常检测和预警
- **日志分析**: 集中化日志收集、搜索、分析和可视化
- **链路追踪**: 分布式系统调用链路追踪和性能分析

### 🤖 AI 助手
- **智能补全**: 基于上下文的代码自动补全和生成
- **Bug 检测**: 自动代码质量检查和潜在问题识别
- **优化建议**: 代码性能优化建议和重构推荐
- **文档生成**: 自动生成代码注释和API文档
- **测试生成**: 智能生成单元测试用例

### 🔒 安全合规
- **漏洞扫描**: 代码安全漏洞检测和修复建议
- **访问审计**: 完整的用户操作日志和审计追踪
- **合规检查**: 符合 GDPR、SOC2、ISO27001 等标准
- **数据加密**: 传输和存储数据的端到端加密
- **权限控制**: 基于角色的访问控制（RBAC）和多因素认证

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit
- **UI 组件**: Ant Design
- **代码编辑器**: Monaco Editor
- **构建工具**: Vite
- **实时通信**: WebSocket
- **图表库**: Recharts
- **拖拽**: react-beautiful-dnd

### 后端技术栈
- **框架**: Spring Boot 3.2
- **微服务**: Spring Cloud 2023
- **数据库**: PostgreSQL + Redis
- **消息队列**: RabbitMQ
- **容器化**: Docker + Kubernetes
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **安全**: Spring Security + JWT

### 基础设施
- **云平台**: AWS/阿里云/腾讯云
- **容器编排**: Kubernetes
- **服务发现**: Eureka
- **API 网关**: Spring Cloud Gateway
- **配置中心**: Spring Cloud Config
- **链路追踪**: Zipkin

## 项目结构

```
CloudDev Platform/
├── frontend/              # 前端应用
│   ├── src/              # 源代码
│   ├── public/           # 静态资源
│   └── package.json      # 依赖配置
├── backend/              # 后端服务
│   ├── auth-service/     # 认证服务
│   ├── ide-service/      # IDE服务
│   ├── git-service/      # Git服务
│   ├── project-service/  # 项目管理服务
│   └── gateway/          # API网关
├── database/             # 数据库相关
│   ├── migrations/       # 数据迁移
│   └── init-scripts/     # 初始化脚本
├── deployment/           # 部署配置
│   ├── docker/           # Docker配置
│   ├── kubernetes/       # K8s配置
│   └── helm/             # Helm charts
├── docs/                 # 文档
│   ├── api/              # API文档
│   ├── architecture/     # 架构文档
│   └── user-guide/       # 用户指南
├── scripts/              # 脚本工具
└── tests/                # 测试代码
```

## 🚀 快速开始

### 系统要求

#### 硬件要求
- **开发环境**: 
  - CPU: 4核心以上
  - 内存: 8GB 以上
  - 磁盘: 50GB 可用空间
- **生产环境**:
  - CPU: 8核心以上
  - 内存: 32GB 以上
  - 磁盘: 500GB 可用空间

#### 软件要求
- **Node.js**: 16.x 或更高版本
- **Java**: JDK 11 或更高版本
- **Docker**: 20.10.0 或更高版本
- **Docker Compose**: 2.0.0 或更高版本
- **Git**: 2.30.0 或更高版本

#### 数据库要求
- **PostgreSQL**: 13.x 或更高版本
- **Redis**: 6.x 或更高版本
- **MongoDB**: 5.0.x 或更高版本（可选，用于文档存储）

### 快速启动（Docker 方式）

推荐使用 Docker Compose 进行快速部署：

```bash
# 1. 克隆项目
git clone https://github.com/company/clouddev-platform.git
cd clouddev-platform

# 2. 复制环境配置文件
cp .env.example .env

# 3. 一键启动所有服务
docker-compose up -d

# 4. 等待服务启动完成（约 2-3 分钟）
docker-compose logs -f

# 5. 访问应用
# - 前端应用: http://localhost:3000
# - API 网关: http://localhost:8080
# - 管理后台: http://localhost:3001
```

### 本地开发环境搭建

#### 步骤 1: 环境准备

确保已安装所有必需的软件：

```bash
# 检查 Node.js 版本
node --version  # 应显示 v16.x.x 或更高

# 检查 Java 版本
java --version  # 应显示 11.x.x 或更高

# 检查 Docker 版本
docker --version  # 应显示 20.10.x 或更高
docker-compose --version  # 应显示 2.x.x 或更高
```

#### 步骤 2: 克隆项目

```bash
git clone https://github.com/company/clouddev-platform.git
cd clouddev-platform
```

#### 步骤 3: 配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env
```

主要配置项：
```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/clouddev
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400

# OAuth 配置（可选）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI 服务配置（可选）
OPENAI_API_KEY=your-openai-api-key
```

#### 步骤 4: 启动数据库服务

```bash
# 启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis

# 等待数据库启动
sleep 10

# 初始化数据库
cd backend
./mvnw flyway:migrate
```

#### 步骤 5: 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖并启动认证服务
cd auth-service
./mvnw spring-boot:run &

# 启动 IDE 服务
cd ../ide-service
./mvnw spring-boot:run &

# 启动项目管理服务
cd ../project-service
./mvnw spring-boot:run &

# 启动 CI/CD 服务
cd ../cicd-service
./mvnw spring-boot:run &

# 启动 API 网关
cd ../gateway
./mvnw spring-boot:run &
```

#### 步骤 6: 启动前端应用

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start

# 或使用 yarn
yarn install
yarn start
```

#### 步骤 7: 验证安装

访问以下地址验证服务正常运行：

- **前端应用**: http://localhost:3000
- **API 网关**: http://localhost:8080
- **管理后台**: http://localhost:3001
- **API 文档**: http://localhost:8080/swagger-ui.html

### 健康检查

可以通过以下命令检查各服务状态：

```bash
# 检查所有容器状态
docker-compose ps

# 检查 API 网关健康状态
curl http://localhost:8080/actuator/health

# 检查前端服务
curl http://localhost:3000

# 查看服务日志
docker-compose logs -f [service-name]
```

### 默认登录信息

初次安装后，可以使用以下默认管理员账户登录：

- **用户名**: admin@clouddev.com
- **密码**: CloudDev123!

> ⚠️ **安全提醒**: 首次登录后请立即修改默认密码！

### 下一步

安装完成后，建议：

1. 阅读 [用户指南](docs/USER_GUIDE.md)
2. 查看 [API 文档](docs/api/)
3. 配置 [CI/CD 流水线](docs/cicd-setup.md)
4. 设置 [监控告警](docs/monitoring-setup.md)

## 📚 API 使用指南

### REST API 示例

#### 用户认证

```bash
# 用户登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "developer@example.com",
    "password": "password123"
  }'

# 响应示例
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": "uuid",
    "username": "developer",
    "email": "developer@example.com"
  }
}
```

#### 工作空间管理

```bash
# 创建工作空间
curl -X POST http://localhost:8080/api/ide/workspaces \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "language": "javascript",
    "framework": "react"
  }'

# 获取工作空间列表
curl -X GET http://localhost:8080/api/ide/workspaces \
  -H "Authorization: Bearer {token}"
```

#### 项目管理

```bash
# 创建项目
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Project description",
    "visibility": "private"
  }'

# 创建任务
curl -X POST http://localhost:8080/api/projects/{projectId}/tasks \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature",
    "description": "Feature description",
    "priority": "HIGH",
    "assigneeId": "user-id"
  }'
```

### WebSocket 实时协作

```javascript
// 连接协作 WebSocket
const socket = new WebSocket('ws://localhost:8080/ws/collaboration/{workspaceId}');

// 监听连接事件
socket.onopen = function(event) {
    console.log('Connected to collaboration server');
    
    // 加入工作空间
    socket.send(JSON.stringify({
        type: 'join_workspace',
        workspaceId: 'workspace-id',
        userId: 'user-id'
    }));
};

// 监听消息
socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    
    switch(message.type) {
        case 'user_joined':
            console.log('User joined:', message.payload);
            break;
        case 'code_change':
            console.log('Code changed:', message.payload);
            break;
        case 'cursor_update':
            console.log('Cursor updated:', message.payload);
            break;
    }
};

// 发送代码变更
function sendCodeChange(change) {
    socket.send(JSON.stringify({
        type: 'code_change',
        payload: {
            fileId: 'file-id',
            operation: 'insert',
            position: 100,
            content: 'console.log("Hello");',
            version: 1
        }
    }));
}
```

### SDK 使用示例

#### JavaScript/Node.js SDK

```javascript
const CloudDevSDK = require('@clouddev/sdk');

// 初始化 SDK
const client = new CloudDevSDK({
    apiUrl: 'http://localhost:8080',
    accessToken: 'your-access-token'
});

// 创建工作空间
async function createWorkspace() {
    try {
        const workspace = await client.workspaces.create({
            name: 'My Workspace',
            language: 'javascript',
            framework: 'react'
        });
        console.log('Workspace created:', workspace);
    } catch (error) {
        console.error('Error creating workspace:', error);
    }
}

// 获取项目列表
async function getProjects() {
    try {
        const projects = await client.projects.list({
            page: 0,
            size: 10
        });
        console.log('Projects:', projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}
```

#### Python SDK

```python
from clouddev_sdk import CloudDevClient

# 初始化客户端
client = CloudDevClient(
    api_url='http://localhost:8080',
    access_token='your-access-token'
)

# 创建工作空间
def create_workspace():
    try:
        workspace = client.workspaces.create(
            name='My Python Workspace',
            language='python',
            framework='django'
        )
        print(f'Workspace created: {workspace}')
    except Exception as e:
        print(f'Error creating workspace: {e}')

# 执行 CI/CD 流水线
def trigger_pipeline(project_id):
    try:
        execution = client.pipelines.execute(
            project_id=project_id,
            branch='main',
            environment='staging'
        )
        print(f'Pipeline execution started: {execution}')
    except Exception as e:
        print(f'Error triggering pipeline: {e}')
```

## ⚙️ 配置指南

### 环境变量配置

创建 `.env` 文件并配置以下环境变量：

```bash
# 应用配置
APP_NAME=CloudDev Platform
APP_VERSION=2.0.0
APP_ENV=development
APP_PORT=8080

# 数据库配置
DATABASE_URL=postgresql://clouddev:password@localhost:5432/clouddev_db
DATABASE_MAX_CONNECTIONS=20
DATABASE_CONNECTION_TIMEOUT=30000

# Redis 配置
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DATABASE=0
REDIS_MAX_CONNECTIONS=10

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_ACCESS_TOKEN_EXPIRATION=3600
JWT_REFRESH_TOKEN_EXPIRATION=604800

# OAuth 配置
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI 服务配置
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
AI_CODE_COMPLETION_ENABLED=true

# 文件存储配置
FILE_STORAGE_TYPE=local  # local, s3, minio
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=clouddev-storage
AWS_S3_REGION=us-east-1

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@clouddev.com

# 监控配置
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
LOGGING_LEVEL=INFO

# 安全配置
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Docker 配置
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_REGISTRY=localhost:5000
KUBERNETES_CONFIG_PATH=/path/to/kubeconfig
```

### application.yml 配置

```yaml
server:
  port: ${APP_PORT:8080}
  servlet:
    context-path: /api

spring:
  application:
    name: clouddev-platform
  
  datasource:
    url: ${DATABASE_URL}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: ${DATABASE_MAX_CONNECTIONS:20}
      connection-timeout: ${DATABASE_CONNECTION_TIMEOUT:30000}
  
  redis:
    url: ${REDIS_URL}
    password: ${REDIS_PASSWORD:}
    database: ${REDIS_DATABASE:0}
    lettuce:
      pool:
        max-active: ${REDIS_MAX_CONNECTIONS:10}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: user:email, read:user
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email

jwt:
  secret: ${JWT_SECRET}
  access-token-expiration: ${JWT_ACCESS_TOKEN_EXPIRATION:3600}
  refresh-token-expiration: ${JWT_REFRESH_TOKEN_EXPIRATION:604800}

ai:
  openai:
    api-key: ${OPENAI_API_KEY}
    model: ${OPENAI_MODEL:gpt-3.5-turbo}
  code-completion:
    enabled: ${AI_CODE_COMPLETION_ENABLED:true}

logging:
  level:
    com.clouddev: ${LOGGING_LEVEL:INFO}
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
```

### Docker Compose 配置

```yaml
version: '3.8'

services:
  # 数据库服务
  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: clouddev_db
      POSTGRES_USER: clouddev
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init-scripts:/docker-entrypoint-initdb.d
    networks:
      - clouddev-network

  # Redis 缓存
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - clouddev-network

  # API 网关
  gateway:
    build: ./backend/gateway
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://clouddev:password@postgres:5432/clouddev_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - clouddev-network

  # 认证服务
  auth-service:
    build: ./backend/auth-service
    environment:
      - DATABASE_URL=postgresql://clouddev:password@postgres:5432/clouddev_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - clouddev-network

  # IDE 服务
  ide-service:
    build: ./backend/ide-service
    environment:
      - DATABASE_URL=postgresql://clouddev:password@postgres:5432/clouddev_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - clouddev-network

  # 前端应用
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
    depends_on:
      - gateway
    networks:
      - clouddev-network

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - clouddev-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - clouddev-network

volumes:
  postgres_data:
  redis_data:
  grafana_data:

networks:
  clouddev-network:
    driver: bridge
```

## 🛠️ 开发指南

### 代码规范

#### Java 代码规范
- 遵循 [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- 使用 Checkstyle 进行代码检查
- 类名使用 PascalCase，方法名使用 camelCase
- 常量使用 SCREAMING_SNAKE_CASE

#### TypeScript 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 启用严格模式 TypeScript 配置
- 组件名使用 PascalCase，变量名使用 camelCase
- 使用绝对路径导入模块

#### 提交信息规范
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能提交
feat(scope): add new feature

# 错误修复
fix(scope): fix bug description

# 文档更新
docs(scope): update documentation

# 样式改动
style(scope): format code

# 代码重构
refactor(scope): refactor component

# 测试相关
test(scope): add unit tests

# 构建相关
build(scope): update build configuration
```

### 开发流程

#### 1. 创建功能分支
```bash
# 从主分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/feature-name

# 从开发分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
```

#### 2. 开发功能
```bash
# 进行开发工作
# 编写代码
# 添加测试
# 更新文档

# 定期提交代码
git add .
git commit -m "feat: implement new feature"
```

#### 3. 代码质量检查
```bash
# 运行代码检查
npm run lint          # 前端代码检查
./mvnw checkstyle:check  # 后端代码检查

# 运行测试
npm test              # 前端测试
./mvnw test           # 后端测试

# 检查代码覆盖率
npm run test:coverage
./mvnw jacoco:report
```

#### 4. 提交 Pull Request
```bash
# 推送分支
git push origin feature/feature-name

# 在 GitHub/GitLab 上创建 Pull Request
# 填写 PR 描述
# 指定审查者
# 等待代码审查
```

#### 5. 代码审查和合并
- 至少需要 2 名团队成员审查
- 所有测试必须通过
- 代码覆盖率不能降低
- 审查通过后合并到主分支

### 测试策略

#### 单元测试
- **覆盖率要求**: > 80%
- **前端测试**: Jest + React Testing Library
- **后端测试**: JUnit 5 + Mockito + TestContainers

```javascript
// 前端单元测试示例
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  test('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

```java
// 后端单元测试示例
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        CreateUserRequest request = new CreateUserRequest("john@example.com", "password");
        User expectedUser = new User("john@example.com");
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);
        
        // When
        User result = userService.createUser(request);
        
        // Then
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        verify(userRepository).save(any(User.class));
    }
}
```

#### 集成测试
覆盖核心业务流程的端到端测试：

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldAuthenticateUserSuccessfully() {
        // Given
        LoginRequest request = new LoginRequest("admin@example.com", "password");
        
        // When
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/login", request, AuthResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getAccessToken()).isNotNull();
    }
}
```

#### E2E 测试
使用 Cypress 进行端到端测试：

```javascript
// cypress/integration/workspace.spec.js
describe('Workspace Management', () => {
  beforeEach(() => {
    cy.login('developer@example.com', 'password');
  });

  it('should create new workspace', () => {
    cy.visit('/workspaces');
    cy.get('[data-testid="create-workspace-btn"]').click();
    
    cy.get('[data-testid="workspace-name"]').type('My Test Workspace');
    cy.get('[data-testid="workspace-language"]').select('javascript');
    cy.get('[data-testid="workspace-framework"]').select('react');
    
    cy.get('[data-testid="create-btn"]').click();
    
    cy.url().should('include', '/workspaces/');
    cy.get('[data-testid="workspace-title"]').should('contain', 'My Test Workspace');
  });
});
```

## 🚢 部署指南

### 生产环境部署

#### Kubernetes 部署

使用 Kubernetes 进行容器化部署：

```bash
# 1. 构建所有服务镜像
./scripts/build-images.sh

# 2. 创建 Kubernetes 命名空间
kubectl create namespace clouddev-platform

# 3. 创建配置映射和密钥
kubectl create configmap clouddev-config --from-env-file=.env -n clouddev-platform
kubectl create secret generic clouddev-secrets --from-env-file=.env.secrets -n clouddev-platform

# 4. 部署数据库服务
kubectl apply -f deployment/kubernetes/database/ -n clouddev-platform

# 5. 等待数据库就绪
kubectl wait --for=condition=ready pod -l app=postgres -n clouddev-platform --timeout=300s

# 6. 部署后端服务
kubectl apply -f deployment/kubernetes/backend/ -n clouddev-platform

# 7. 部署前端服务
kubectl apply -f deployment/kubernetes/frontend/ -n clouddev-platform

# 8. 部署监控服务
kubectl apply -f deployment/kubernetes/monitoring/ -n clouddev-platform
```

#### Helm 部署

推荐使用 Helm 进行更灵活的部署管理：

```bash
# 1. 添加依赖的 Helm 仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 2. 安装依赖服务
helm install postgresql bitnami/postgresql -f deployment/helm/values/postgresql.yaml
helm install redis bitnami/redis -f deployment/helm/values/redis.yaml

# 3. 安装主应用
helm install clouddev-platform deployment/helm/clouddev-platform/ \
  --values deployment/helm/values/production.yaml \
  --namespace clouddev-platform \
  --create-namespace

# 4. 验证部署状态
helm status clouddev-platform -n clouddev-platform
```

#### Docker Swarm 部署

```bash
# 1. 初始化 Docker Swarm（如果还未初始化）
docker swarm init

# 2. 部署应用栈
docker stack deploy -c docker-compose.prod.yml clouddev-platform

# 3. 查看服务状态
docker stack services clouddev-platform

# 4. 查看服务日志
docker service logs clouddev-platform_gateway
```

### 环境配置

#### 开发环境 (development)
```yaml
replicas: 1
resources:
  cpu: "0.5"
  memory: "1Gi"
database:
  replicas: 1
  storage: "10Gi"
monitoring:
  enabled: false
```

#### 测试环境 (testing)
```yaml
replicas: 2
resources:
  cpu: "1"
  memory: "2Gi"
database:
  replicas: 2
  storage: "50Gi"
monitoring:
  enabled: true
```

#### 预生产环境 (staging)
```yaml
replicas: 3
resources:
  cpu: "2"
  memory: "4Gi"
database:
  replicas: 3
  storage: "200Gi"
monitoring:
  enabled: true
ssl:
  enabled: true
```

#### 生产环境 (production)
```yaml
replicas: 5
resources:
  cpu: "4"
  memory: "8Gi"
database:
  replicas: 3
  storage: "1Ti"
monitoring:
  enabled: true
ssl:
  enabled: true
backup:
  enabled: true
  schedule: "0 2 * * *"
```

## ❓ 故障排除指南

### 常见问题

#### 1. 服务启动失败

**问题**: 服务无法启动或启动后立即退出

**解决方案**:
```bash
# 检查服务日志
docker-compose logs [service-name]
kubectl logs -f deployment/[service-name] -n clouddev-platform

# 检查配置文件
cat .env | grep -v "^#" | grep -v "^$"

# 检查端口占用
netstat -tulpn | grep :8080

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

**常见原因**:
- 环境变量配置错误
- 端口被占用
- 磁盘空间不足
- 内存不足
- 数据库连接失败

#### 2. 数据库连接错误

**问题**: 无法连接到数据库

**解决方案**:
```bash
# 检查数据库服务状态
docker-compose ps postgres
kubectl get pods -l app=postgres -n clouddev-platform

# 测试数据库连接
psql -h localhost -p 5432 -U clouddev -d clouddev_db

# 检查网络连通性
telnet localhost 5432

# 重启数据库服务
docker-compose restart postgres
kubectl rollout restart deployment/postgres -n clouddev-platform
```

#### 3. Redis 连接失败

**问题**: Redis 缓存服务不可用

**解决方案**:
```bash
# 检查 Redis 服务状态
docker-compose ps redis
kubectl get pods -l app=redis -n clouddev-platform

# 测试 Redis 连接
redis-cli -h localhost -p 6379 ping

# 检查 Redis 配置
redis-cli -h localhost -p 6379 config get "*"

# 清理 Redis 缓存
redis-cli -h localhost -p 6379 flushdb
```

#### 4. 前端页面无法加载

**问题**: 前端应用白屏或加载失败

**解决方案**:
```bash
# 检查前端服务状态
curl -I http://localhost:3000

# 检查 API 连接
curl -I http://localhost:8080/api/health

# 检查浏览器控制台错误
# 按 F12 打开开发者工具查看错误信息

# 清理浏览器缓存
# Ctrl + F5 强制刷新

# 重新构建前端
cd frontend
npm run build
```

#### 5. API 响应超时

**问题**: API 请求响应时间过长或超时

**解决方案**:
```bash
# 检查 API 网关状态
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/health

# 检查数据库查询性能
# 在数据库中启用慢查询日志

# 检查缓存命中率
redis-cli -h localhost -p 6379 info stats

# 分析应用性能
# 使用 APM 工具查看性能瓶颈
```

### 调试工具

#### 日志查看命令

```bash
# Docker Compose 环境
docker-compose logs -f --tail=100 [service-name]

# Kubernetes 环境
kubectl logs -f deployment/[service-name] -n clouddev-platform --tail=100

# 查看特定时间段的日志
kubectl logs deployment/[service-name] -n clouddev-platform --since=1h

# 查看所有容器日志
kubectl logs -l app=clouddev-platform -n clouddev-platform --all-containers=true
```

#### 性能分析命令

```bash
# 检查资源使用情况
docker stats
kubectl top pods -n clouddev-platform
kubectl top nodes

# 检查网络连接
netstat -an | grep :8080
ss -tulpn | grep :8080

# 检查进程状态
ps aux | grep java
htop
```

### 紧急恢复程序

#### 服务快速重启

```bash
# Docker Compose 环境
docker-compose down && docker-compose up -d

# Kubernetes 环境
kubectl rollout restart deployment -n clouddev-platform
```

#### 数据库恢复

```bash
# 从备份恢复数据库
pg_restore -h localhost -U clouddev -d clouddev_db /backup/clouddev_backup.sql

# 检查数据完整性
psql -h localhost -U clouddev -d clouddev_db -c "SELECT COUNT(*) FROM users;"
```

#### 缓存清理

```bash
# 清理 Redis 缓存
redis-cli -h localhost -p 6379 flushall

# 清理应用缓存
curl -X POST http://localhost:8080/api/admin/cache/clear
```

## 📊 性能基准和优化

### 性能基准

#### 系统性能指标

| 指标 | 开发环境 | 测试环境 | 生产环境 |
|------|----------|----------|----------|
| 页面加载时间 | < 3秒 | < 2秒 | < 1秒 |
| API 响应时间 | < 1秒 | < 500ms | < 200ms |
| 并发用户数 | 100 | 1000 | 10000 |
| 数据库 QPS | 100 | 1000 | 5000 |
| 内存使用率 | < 70% | < 80% | < 85% |
| CPU 使用率 | < 60% | < 70% | < 80% |

#### 压力测试

使用 Apache Bench 进行基本性能测试：

```bash
# API 性能测试
ab -n 1000 -c 10 http://localhost:8080/api/health

# 登录接口测试
ab -n 500 -c 5 -p login.json -T application/json http://localhost:8080/api/auth/login

# 创建工作空间接口测试
ab -n 100 -c 5 -H "Authorization: Bearer token" -p workspace.json -T application/json http://localhost:8080/api/ide/workspaces
```

使用 JMeter 进行复杂场景测试：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan>
      <stringProp name="TestPlan.comments">CloudDev Platform Performance Test</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
  </hashTree>
</jmeterTestPlan>
```

### 性能优化建议

#### 数据库优化

```sql
-- 创建适当的索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX CONCURRENTLY idx_projects_created_at ON projects(created_at DESC);

-- 优化查询语句
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- 配置数据库连接池
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

#### 缓存策略

```java
// 配置多级缓存
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
            .RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration());
        return builder.build();
    }
    
    private RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}

// 使用缓存注解
@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#userId")
    public User findById(String userId) {
        return userRepository.findById(userId);
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

#### 前端优化

```javascript
// 代码分割和懒加载
const LazyWorkspace = React.lazy(() => import('./Workspace'));
const LazyDashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/workspace/*" element={<LazyWorkspace />} />
          <Route path="/dashboard" element={<LazyDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// 使用 React.memo 优化组件渲染
const FileTree = React.memo(({ files, onFileSelect }) => {
  return (
    <div>
      {files.map(file => (
        <FileItem 
          key={file.id} 
          file={file} 
          onSelect={onFileSelect} 
        />
      ))}
    </div>
  );
});

// 虚拟滚动优化长列表
import { FixedSizeList as List } from 'react-window';

const VirtualizedFileList = ({ files }) => (
  <List
    height={600}
    itemCount={files.length}
    itemSize={35}
    itemData={files}
  >
    {FileRow}
  </List>
);
```

#### 监控和分析

```yaml
# Prometheus 配置
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'clouddev-platform'
    static_configs:
      - targets: ['localhost:8080', 'localhost:8081', 'localhost:8082']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

## 🔒 安全配置和最佳实践

### 安全配置

#### HTTPS 配置

```nginx
# Nginx SSL 配置
server {
    listen 443 ssl http2;
    server_name clouddev.example.com;
    
    ssl_certificate /etc/ssl/certs/clouddev.crt;
    ssl_certificate_key /etc/ssl/private/clouddev.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 防火墙配置

```bash
# UFW 防火墙配置
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH
sudo ufw allow ssh

# 允许 HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 允许应用端口（仅内网）
sudo ufw allow from 10.0.0.0/8 to any port 8080
sudo ufw allow from 172.16.0.0/12 to any port 8080
sudo ufw allow from 192.168.0.0/16 to any port 8080

# 启用防火墙
sudo ufw enable
```

#### 数据库安全

```sql
-- 创建受限权限的应用用户
CREATE USER clouddev_app WITH PASSWORD 'strong_password';

-- 授予必要的权限
GRANT CONNECT ON DATABASE clouddev_db TO clouddev_app;
GRANT USAGE ON SCHEMA public TO clouddev_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO clouddev_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO clouddev_app;

-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_access_policy ON users FOR ALL TO clouddev_app USING (id = current_user_id());

-- 配置 SSL 连接
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';
```

### 安全最佳实践

#### 密码和密钥管理

```java
// 使用强密码编码
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(jwkSource());
    }
    
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        RSAKey rsaKey = generateRsa();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }
    
    private static RSAKey generateRsa() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        return new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(UUID.randomUUID().toString())
            .build();
    }
}

// 敏感信息加密存储
@Service
public class EncryptionService {
    
    @Value("${app.encryption.key}")
    private String encryptionKey;
    
    public String encrypt(String data) {
        // 使用 AES-256 加密
        return AESUtil.encrypt(data, encryptionKey);
    }
    
    public String decrypt(String encryptedData) {
        return AESUtil.decrypt(encryptedData, encryptionKey);
    }
}
```

#### 输入验证和清理

```java
// 输入验证注解
@Entity
public class User {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]", 
             message = "Password must contain at least one lowercase letter, one uppercase letter, one digit and one special character")
    private String password;
}

// SQL 注入防护
@Repository
public class UserRepository {
    
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
    
    // 避免动态 SQL 拼接
    // 错误示例: "SELECT * FROM users WHERE email = '" + email + "'"
    // 正确示例: 使用参数化查询
}
```

#### API 安全

```java
// 请求限流
@Configuration
public class RateLimitConfig {
    
    @Bean
    public RedisRateLimiter rateLimiter() {
        return new RedisRateLimiter(10, 20); // 每秒10个请求，突发20个
    }
}

// CORS 配置
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("https://*.example.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}

// API 版本控制和废弃
@RestController
@RequestMapping("/api/v1")
public class UserControllerV1 {
    
    @GetMapping("/users/{id}")
    @Deprecated
    public ResponseEntity<User> getUser(@PathVariable String id) {
        // 在响应头中标明废弃信息
        HttpHeaders headers = new HttpHeaders();
        headers.add("Deprecated", "true");
        headers.add("Sunset", "2024-12-31");
        headers.add("Link", "</api/v2/users/{id}>; rel=\"successor-version\"");
        
        User user = userService.findById(id);
        return ResponseEntity.ok().headers(headers).body(user);
    }
}
```

#### 安全审计

```java
// 操作审计日志
@Aspect
@Component
public class AuditAspect {
    
    private final AuditLogRepository auditLogRepository;
    
    @Around("@annotation(Auditable)")
    public Object auditOperation(ProceedingJoinPoint joinPoint) throws Throwable {
        String userId = getCurrentUserId();
        String operation = joinPoint.getSignature().getName();
        String resource = getResourceName(joinPoint);
        
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setOperation(operation);
        auditLog.setResource(resource);
        auditLog.setTimestamp(Instant.now());
        auditLog.setIpAddress(getCurrentIpAddress());
        
        try {
            Object result = joinPoint.proceed();
            auditLog.setStatus("SUCCESS");
            return result;
        } catch (Exception e) {
            auditLog.setStatus("FAILED");
            auditLog.setErrorMessage(e.getMessage());
            throw e;
        } finally {
            auditLogRepository.save(auditLog);
        }
    }
}

// 安全事件监控
@Component
public class SecurityEventListener {
    
    @EventListener
    public void handleFailedLogin(AuthenticationFailureBadCredentialsEvent event) {
        String username = event.getAuthentication().getName();
        String ipAddress = getIpAddress();
        
        // 记录失败登录尝试
        securityEventService.recordFailedLogin(username, ipAddress);
        
        // 检查是否需要锁定账户
        if (securityEventService.getFailedLoginCount(username) > 5) {
            userService.lockAccount(username);
            alertService.sendSecurityAlert("Account locked due to multiple failed login attempts: " + username);
        }
    }
}
```

## 📈 监控和运维

### 监控指标

#### 应用性能监控 (APM)
- **响应时间**: API 平均响应时间、P95、P99 响应时间
- **吞吐量**: 每秒请求数 (QPS)、并发用户数
- **错误率**: 4xx、5xx 错误率统计
- **可用性**: 服务可用率、健康检查状态

#### 基础设施监控
- **CPU 使用率**: 平均使用率、峰值使用率
- **内存使用**: 内存消耗、垃圾回收频率
- **磁盘 I/O**: 读写速度、磁盘使用率
- **网络流量**: 入站/出站流量、连接数

#### 业务指标监控
- **用户活跃度**: DAU/MAU、会话时长
- **功能使用情况**: 工作空间创建数、代码提交数
- **协作指标**: 实时协作会话数、文件编辑频率
- **系统容量**: 并发用户数、存储使用量

### 告警规则

#### 系统告警
- **可用性告警**: 系统可用性 < 99.9%
- **性能告警**: API 响应时间 > 2秒
- **错误率告警**: 错误率 > 1%
- **资源告警**: CPU/内存使用率 > 80%

#### 业务告警
- **用户体验**: 页面加载时间 > 5秒
- **协作功能**: WebSocket 连接失败率 > 5%
- **存储容量**: 磁盘使用率 > 85%
- **数据库性能**: 慢查询数量 > 100/分钟

### 日志管理

```yaml
# Logback 配置示例
logging:
  level:
    com.clouddev: INFO
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId}] %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId}] %logger{36} - %msg%n"
  file:
    name: logs/clouddev-platform.log
    max-size: 100MB
    max-history: 30
```

## 🤝 贡献指南

### 如何贡献

我们欢迎社区贡献！以下是参与项目的方式：

#### 1. 报告问题
- 使用 [GitHub Issues](https://github.com/company/clouddev-platform/issues) 报告 Bug
- 提供详细的问题描述和复现步骤
- 包含系统环境信息和错误日志

#### 2. 提出功能建议
- 在 Issues 中提出新功能建议
- 描述功能的使用场景和预期效果
- 讨论实现方案的可行性

#### 3. 提交代码
```bash
# 1. Fork 项目到个人账户
# 2. 克隆 Fork 的仓库
git clone https://github.com/your-username/clouddev-platform.git
cd clouddev-platform

# 3. 创建功能分支
git checkout -b feature/amazing-feature

# 4. 进行开发
# - 编写代码
# - 添加测试
# - 更新文档

# 5. 提交代码
git add .
git commit -m "feat: add amazing feature"

# 6. 推送到远程仓库
git push origin feature/amazing-feature

# 7. 创建 Pull Request
```

### 代码贡献指南

#### Pull Request 检查清单
- [ ] 代码遵循项目编码规范
- [ ] 添加了适当的测试用例
- [ ] 测试全部通过
- [ ] 更新了相关文档
- [ ] 提交信息遵循 Conventional Commits 规范
- [ ] 解决了所有合并冲突

#### 代码审查流程
1. **自检**: 提交前自行检查代码质量
2. **自动化检查**: CI/CD 流水线自动运行测试
3. **人工审查**: 至少需要 2 名维护者审查
4. **反馈改进**: 根据审查意见进行修改
5. **合并代码**: 审查通过后合并到主分支

### 社区规范

#### 行为准则
- 保持友好和专业的交流态度
- 尊重不同的观点和经验水平
- 建设性地提供反馈和建议
- 遵循开源社区的最佳实践

#### 沟通渠道
- **GitHub Discussions**: 技术讨论和问答
- **GitHub Issues**: Bug 报告和功能请求
- **Email**: support@clouddev-platform.com
- **文档反馈**: 直接编辑文档并提交 PR

## 📚 版本历史

### v2.0.0 (2024-06-17) - 企业级功能增强
**新增功能:**
- 🔒 企业级安全认证和权限管理
- 📊 高级项目管理和报告分析
- 🤖 AI 辅助编程和代码生成
- 🔍 智能代码审查和质量分析
- 📈 全面的监控和告警系统

**改进:**
- ⚡ 性能优化，响应时间提升 50%
- 🛡️ 安全加固，通过 SOC2 认证
- 🌐 多语言支持，国际化完善
- 📱 移动端适配和响应式设计

### v1.2.0 (2024-03-15) - 增强协作功能
**新增功能:**
- 👥 实时多人协作编辑
- 💬 集成聊天和视频通话
- 🔄 高级分支管理和合并策略
- 📝 在线文档协作和知识管理

**修复:**
- 🐛 修复协作冲突解决问题
- 🔧 优化 WebSocket 连接稳定性
- 📦 更新依赖包和安全补丁

### v1.1.0 (2024-01-20) - 添加 AI 辅助编程
**新增功能:**
- 🤖 AI 代码自动补全
- 🔍 智能 Bug 检测
- 📖 自动代码文档生成
- 🧪 智能测试用例生成

**改进:**
- 🚀 IDE 性能优化
- 🎨 UI/UX 界面改进
- 📊 数据分析和报告功能

### v1.0.0 (2023-12-01) - 基础平台功能
**核心功能:**
- ☁️ 云端 IDE 基础功能
- 🔄 Git 版本控制集成
- 🔧 基础 CI/CD 流水线
- 📊 项目管理工具
- 👤 用户认证和权限

## 📄 许可证

本项目采用 **MIT 许可证** 开源，详细内容请查看 [LICENSE](LICENSE) 文件。

### 许可证摘要
- ✅ 商业使用
- ✅ 修改
- ✅ 分发
- ✅ 私人使用
- ❌ 责任
- ❌ 保证

## 📞 联系我们

### 官方渠道
- 🌐 **项目主页**: https://clouddev-platform.com
- 📚 **文档中心**: https://docs.clouddev-platform.com
- 💬 **社区论坛**: https://community.clouddev-platform.com
- 📧 **技术支持**: support@clouddev-platform.com

### 开发者资源
- 🐛 **问题反馈**: https://github.com/company/clouddev-platform/issues
- 💡 **功能建议**: https://github.com/company/clouddev-platform/discussions
- 📖 **API 文档**: https://api.clouddev-platform.com
- 🎥 **视频教程**: https://youtube.com/clouddev-platform

### 社交媒体
- 🐦 Twitter: [@CloudDevPlatform](https://twitter.com/CloudDevPlatform)
- 📘 LinkedIn: [CloudDev Platform](https://linkedin.com/company/clouddev-platform)
- 🎮 Discord: [CloudDev Community](https://discord.gg/clouddev)

## 🙏 致谢

### 核心贡献者
感谢所有为项目做出贡献的开发者和社区成员！

### 技术支持
- **云服务商**: AWS、阿里云、腾讯云
- **开源项目**: Spring Boot、React、Monaco Editor、Docker、Kubernetes
- **监控工具**: Prometheus、Grafana、ELK Stack

### 特别鸣谢
- 所有参与 Beta 测试的用户和企业
- 提供宝贵反馈和建议的社区成员
- 开源社区的无私贡献和支持

---

<div align="center">

**🚀 CloudDev Platform - 让云端开发更简单！**

如果这个项目对您有帮助，请给我们一个 ⭐ Star！

[⬆ 回到顶部](#clouddev-platform---云端开发协作平台)

</div>

---

> **开发状态**: 本项目处于积极开发阶段，我们持续改进功能和性能。  
> **生产就绪**: v2.0.0 版本已可用于生产环境，具备企业级功能和安全保障。  
> **社区驱动**: 欢迎贡献代码、提出建议，让我们一起构建更好的云端开发平台！