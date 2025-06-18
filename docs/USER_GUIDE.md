# CloudDev Platform 用户使用指南

> 🚀 现代化的云原生开发协作平台，提供完整的软件开发生命周期管理解决方案

## 📋 目录

- [快速开始](#快速开始)
- [用户管理](#用户管理)
- [工作空间管理](#工作空间管理)
- [代码编辑器](#代码编辑器)
- [实时协作](#实时协作)
- [版本控制](#版本控制)
- [CI/CD流水线](#cicd流水线)
- [项目管理](#项目管理)
- [API文档](#api文档)
- [常见问题](#常见问题)

## 🚀 快速开始

### 1. 账户注册与登录

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "developer001",
  "email": "developer@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "firstName": "张",
  "lastName": "三",
  "agreeToTerms": true
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "developer001",
  "password": "SecurePass123"
}
```

**响应示例：**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "developer001",
    "email": "developer@example.com",
    "fullName": "张三",
    "roles": ["USER"]
  }
}
```

#### OAuth2 第三方登录
支持的第三方登录方式：
- **GitHub**: `GET /oauth2/authorize/github`
- **Google**: `GET /oauth2/authorize/google`
- **GitLab**: `GET /oauth2/authorize/gitlab`

### 2. 第一个工作空间

创建您的第一个开发工作空间：

```http
POST /api/ide/workspaces
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "projectId": "project-001",
  "name": "My First Workspace",
  "description": "学习CloudDev Platform的第一个工作空间",
  "language": "javascript",
  "framework": "react"
}
```

## 👤 用户管理

### 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### 更新用户资料
```http
PUT /api/auth/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "李",
  "lastName": "四",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+86 138 0013 8000"
}
```

### 修改密码
```http
PUT /api/auth/password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

### 刷新访问令牌
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

## 🏗️ 工作空间管理

### 创建工作空间
```http
POST /api/ide/workspaces
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "projectId": "project-001",
  "name": "React App Development",
  "description": "开发React应用的工作空间",
  "language": "javascript",
  "framework": "react",
  "environmentConfig": {
    "dockerImage": "node:16-alpine",
    "workingDirectory": "/workspace",
    "resourceLimits": {
      "memory": "1Gi",
      "cpu": "0.5",
      "storage": "10Gi"
    }
  }
}
```

### 启动工作空间
```http
POST /api/ide/workspaces/{workspaceId}/start
Authorization: Bearer {accessToken}
```

### 停止工作空间
```http
POST /api/ide/workspaces/{workspaceId}/stop
Authorization: Bearer {accessToken}
```

### 获取工作空间列表
```http
GET /api/ide/workspaces?page=0&size=10
Authorization: Bearer {accessToken}
```

### 获取工作空间详情
```http
GET /api/ide/workspaces/{workspaceId}
Authorization: Bearer {accessToken}
```

### 添加协作者
```http
POST /api/ide/workspaces/{workspaceId}/collaborators
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "collaboratorId": "user-002"
}
```

## 📝 代码编辑器

### 创建文件
```http
POST /api/ide/files
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "workspaceId": "workspace-001",
  "path": "/src/App.js",
  "name": "App.js",
  "content": "import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;"
}
```

### 获取文件内容
```http
GET /api/ide/files/{fileId}
Authorization: Bearer {accessToken}
```

### 更新文件内容
```http
PUT /api/ide/files/{fileId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "import React from 'react';\n\nfunction App() {\n  return <div>Hello CloudDev!</div>;\n}\n\nexport default App;"
}
```

### 删除文件
```http
DELETE /api/ide/files/{fileId}
Authorization: Bearer {accessToken}
```

### 重命名文件
```http
PUT /api/ide/files/{fileId}/rename
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "newName": "Application.js",
  "newPath": "/src/Application.js"
}
```

### 获取工作空间文件列表
```http
GET /api/ide/workspaces/{workspaceId}/files
Authorization: Bearer {accessToken}
```

### 搜索文件内容
```http
GET /api/ide/workspaces/{workspaceId}/files/search?q=React&type=content
Authorization: Bearer {accessToken}
```

### 搜索文件名
```http
GET /api/ide/workspaces/{workspaceId}/files/search?q=App&type=name
Authorization: Bearer {accessToken}
```

## 🤝 实时协作

### WebSocket 连接
```javascript
// 前端JavaScript示例
const socket = new WebSocket('ws://localhost:8080/ws/collaboration/{workspaceId}');

socket.onopen = function(event) {
    console.log('Connected to collaboration server');
    
    // 加入协作会话
    socket.send(JSON.stringify({
        type: 'join_session',
        fileId: 'file-001',
        user: {
            id: 'user-001',
            username: 'developer001',
            avatar: 'https://example.com/avatar.jpg'
        }
    }));
};

socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    
    switch(message.type) {
        case 'user_joined':
            console.log('User joined:', message.payload);
            break;
        case 'user_left':
            console.log('User left:', message.payload);
            break;
        case 'cursor_update':
            console.log('Cursor update:', message.payload);
            break;
        case 'operation':
            console.log('Code operation:', message.payload);
            break;
    }
};
```

### 发送代码编辑操作
```javascript
// 发送编辑操作
socket.send(JSON.stringify({
    type: 'operation',
    fileId: 'file-001',
    operation: {
        type: 'insert',
        position: 125,
        content: 'console.log("Hello World");',
        version: 5
    }
}));
```

### 更新光标位置
```javascript
// 更新光标位置
socket.send(JSON.stringify({
    type: 'cursor_update',
    fileId: 'file-001',
    line: 10,
    column: 25
}));
```

## 🔄 版本控制

### Git操作API

#### 初始化仓库
```http
POST /api/git/repositories
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "workspaceId": "workspace-001",
  "name": "my-project",
  "description": "我的项目",
  "private": true
}
```

#### 提交代码
```http
POST /api/git/commits
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "workspaceId": "workspace-001",
  "message": "feat: 添加新功能",
  "files": [
    {
      "path": "/src/App.js",
      "status": "modified"
    }
  ]
}
```

#### 创建分支
```http
POST /api/git/branches
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "workspaceId": "workspace-001",
  "branchName": "feature/new-component",
  "baseBranch": "main"
}
```

#### 合并分支
```http
POST /api/git/merge
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "workspaceId": "workspace-001",
  "sourceBranch": "feature/new-component",
  "targetBranch": "main",
  "message": "Merge feature/new-component into main"
}
```

## 🔧 CI/CD流水线

### 创建流水线
```http
POST /api/cicd/pipelines
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "projectId": "project-001",
  "name": "Build and Deploy",
  "description": "构建和部署流水线",
  "config": {
    "stages": [
      {
        "name": "Build",
        "jobs": [
          {
            "name": "compile",
            "script": ["npm install", "npm run build"],
            "image": "node:16-alpine"
          }
        ]
      },
      {
        "name": "Test",
        "jobs": [
          {
            "name": "unit-test",
            "script": ["npm test"],
            "image": "node:16-alpine"
          }
        ]
      },
      {
        "name": "Deploy",
        "jobs": [
          {
            "name": "deploy-staging",
            "script": ["kubectl apply -f k8s/"],
            "image": "kubectl:latest",
            "environment": "staging"
          }
        ]
      }
    ]
  }
}
```

### 执行流水线
```http
POST /api/cicd/pipelines/{pipelineId}/execute
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "branch": "main",
  "environment": "staging",
  "parameters": {
    "buildType": "release",
    "skipTests": false
  }
}
```

### 获取执行状态
```http
GET /api/cicd/executions/{executionId}
Authorization: Bearer {accessToken}
```

### 获取执行日志
```http
GET /api/cicd/executions/{executionId}/logs
Authorization: Bearer {accessToken}
```

## 📊 项目管理

### 创建项目
```http
POST /api/projects
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "我的Web应用",
  "description": "一个现代化的Web应用项目",
  "visibility": "private",
  "template": "react-app"
}
```

### 创建任务
```http
POST /api/projects/{projectId}/tasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "实现用户登录功能",
  "description": "开发用户认证和登录界面",
  "type": "FEATURE",
  "priority": "HIGH",
  "assigneeId": "user-002",
  "estimatedHours": 8,
  "dueDate": "2025-07-01T10:00:00"
}
```

### 更新任务状态
```http
PUT /api/projects/{projectId}/tasks/{taskId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### 创建Sprint
```http
POST /api/projects/{projectId}/sprints
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Sprint 1",
  "goal": "完成用户认证模块",
  "startDate": "2025-06-17T09:00:00",
  "endDate": "2025-06-30T18:00:00",
  "taskIds": ["task-001", "task-002", "task-003"]
}
```

## 📚 API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/password` - 修改密码

### IDE相关
- `POST /api/ide/workspaces` - 创建工作空间
- `GET /api/ide/workspaces` - 获取工作空间列表
- `GET /api/ide/workspaces/{id}` - 获取工作空间详情
- `POST /api/ide/workspaces/{id}/start` - 启动工作空间
- `POST /api/ide/workspaces/{id}/stop` - 停止工作空间
- `DELETE /api/ide/workspaces/{id}` - 删除工作空间
- `POST /api/ide/files` - 创建文件
- `GET /api/ide/files/{id}` - 获取文件
- `PUT /api/ide/files/{id}` - 更新文件
- `DELETE /api/ide/files/{id}` - 删除文件

### 项目管理相关
- `POST /api/projects` - 创建项目
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/{id}` - 获取项目详情
- `POST /api/projects/{id}/tasks` - 创建任务
- `GET /api/projects/{id}/tasks` - 获取任务列表
- `PUT /api/projects/{id}/tasks/{taskId}` - 更新任务

### CI/CD相关
- `POST /api/cicd/pipelines` - 创建流水线
- `GET /api/cicd/pipelines` - 获取流水线列表
- `POST /api/cicd/pipelines/{id}/execute` - 执行流水线
- `GET /api/cicd/executions/{id}` - 获取执行状态

## ❓ 常见问题

### Q: 如何设置开发环境？
A: 创建工作空间时，可以指定 `environmentConfig` 来自定义开发环境：
```json
{
  "environmentConfig": {
    "dockerImage": "node:16-alpine",
    "workingDirectory": "/workspace",
    "startupCommands": ["npm install"],
    "resourceLimits": {
      "memory": "2Gi",
      "cpu": "1",
      "storage": "20Gi"
    }
  }
}
```

### Q: 如何邀请团队成员协作？
A: 使用添加协作者API：
```http
POST /api/ide/workspaces/{workspaceId}/collaborators
{
  "collaboratorId": "user-email@example.com"
}
```

### Q: 如何配置CI/CD流水线？
A: 创建流水线时定义stages和jobs：
```json
{
  "config": {
    "stages": [
      {
        "name": "Build",
        "jobs": [
          {
            "name": "compile",
            "script": ["npm run build"],
            "image": "node:16"
          }
        ]
      }
    ]
  }
}
```

### Q: 如何处理合并冲突？
A: 使用Git API的冲突解决功能：
```http
POST /api/git/resolve-conflicts
{
  "workspaceId": "workspace-001",
  "conflictedFiles": [
    {
      "path": "/src/App.js",
      "resolution": "accept_current"
    }
  ]
}
```

### Q: 如何备份工作空间？
A: 使用导出API创建备份：
```http
POST /api/ide/workspaces/{workspaceId}/export
{
  "includeHistory": true,
  "format": "zip"
}
```

### Q: 工作空间的资源限制是什么？
A: 默认资源限制：
- 内存：1GB
- CPU：0.5核
- 存储：10GB
- 并发用户：50人

可以通过升级方案获得更多资源。

### Q: 支持哪些编程语言？
A: 目前支持的语言包括：
- JavaScript/TypeScript
- Python
- Java
- Go
- C/C++
- Rust
- PHP
- Ruby
- 更多语言持续添加中

### Q: 如何集成外部Git仓库？
A: 在创建工作空间时指定Git仓库：
```json
{
  "gitRepository": {
    "url": "https://github.com/username/repo.git",
    "branch": "main",
    "credentials": {
      "type": "oauth",
      "token": "github_token"
    }
  }
}
```

### Q: 数据安全如何保障？
A: 我们提供多层安全保护：
- 端到端加密
- 访问权限控制
- 定期备份
- 审计日志
- 符合GDPR和SOC2标准

---

## 📞 技术支持

如果您在使用过程中遇到问题，请通过以下方式联系我们：

- 📧 邮箱: support@clouddev.com
- 💬 在线客服: https://clouddev.com/support
- 📚 文档中心: https://docs.clouddev.com
- 🐛 问题反馈: https://github.com/clouddev/platform/issues

**CloudDev Platform Team**