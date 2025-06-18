# 贡献指南

感谢您对CloudDev Platform项目的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告问题
- 在提交问题前，请先搜索现有的issue确认问题尚未被报告
- 使用清晰、详细的标题描述问题
- 提供重现步骤、期望结果和实际结果
- 包含环境信息（操作系统、浏览器版本等）

### 功能建议
- 描述您希望看到的功能
- 解释为什么这个功能有用
- 提供可能的实现方案

### 代码贡献
1. Fork项目到您的GitHub账户
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📝 开发规范

### 代码风格
- **Java**: 遵循Google Java Style Guide
- **JavaScript/TypeScript**: 使用ESLint + Prettier
- **提交信息**: 遵循Conventional Commits

### 测试要求
- 新功能必须包含相应的单元测试
- 测试覆盖率不低于80%
- 所有测试必须通过

### Pull Request指南
- 确保代码已经过测试
- 更新相关文档
- 保持提交历史清晰
- 描述变更内容和原因

## 🚀 开发环境搭建

### 前置要求
- Node.js 16+
- Java 11+
- Docker & Docker Compose
- PostgreSQL 13+
- Redis 6+

### 本地开发
```bash
# 克隆项目
git clone https://github.com/your-username/clouddev-platform.git
cd clouddev-platform

# 启动后端服务
cd backend
docker-compose up -d
./mvnw spring-boot:run

# 启动前端应用
cd ../frontend
npm install
npm start
```

## 📜 行为准则

请阅读并遵守我们的[行为准则](CODE_OF_CONDUCT.md)。

## 📞 联系我们

如有任何问题，请通过以下方式联系：
- 提交Issue
- 发邮件至：contributors@clouddev.com