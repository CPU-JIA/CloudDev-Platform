package com.clouddev.ide.service;

import com.clouddev.ide.entity.Workspace;
import com.clouddev.ide.exception.WorkspaceNotFoundException;
import com.clouddev.ide.exception.WorkspacePermissionException;
import com.clouddev.ide.repository.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 工作空间服务类
 */
@Service
public class WorkspaceService {

    private static final Logger logger = LoggerFactory.getLogger(WorkspaceService.class);

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ContainerService containerService;

    @Autowired
    private CodeFileService codeFileService;

    /**
     * 创建工作空间
     */
    public Workspace createWorkspace(String projectId, String userId, String name, String language, String framework) {
        logger.info("Creating workspace for project: {}, user: {}, name: {}", projectId, userId, name);

        Workspace workspace = new Workspace(projectId, userId, name);
        workspace.setLanguage(language);
        workspace.setFramework(framework);

        // 设置默认环境配置
        Workspace.EnvironmentConfig envConfig = createDefaultEnvironmentConfig(language, framework);
        workspace.setEnvironmentConfig(envConfig);

        // 设置默认容器配置
        Workspace.ContainerConfig containerConfig = createDefaultContainerConfig(language, framework);
        workspace.setContainerConfig(containerConfig);

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        logger.info("Workspace created successfully: {}", savedWorkspace.getId());

        return savedWorkspace;
    }

    /**
     * 获取工作空间详情
     */
    public Workspace getWorkspace(String workspaceId, String userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new WorkspaceNotFoundException("工作空间不存在: " + workspaceId));

        // 检查访问权限
        if (!workspace.isCollaborator(userId)) {
            throw new WorkspacePermissionException("无权限访问该工作空间");
        }

        // 更新最后访问时间
        workspace.updateLastAccessed();
        workspaceRepository.save(workspace);

        return workspace;
    }

    /**
     * 启动工作空间
     */
    public Workspace startWorkspace(String workspaceId, String userId) {
        logger.info("Starting workspace: {} by user: {}", workspaceId, userId);

        Workspace workspace = getWorkspace(workspaceId, userId);

        if (workspace.getStatus() == Workspace.WorkspaceStatus.RUNNING) {
            logger.info("Workspace {} is already running", workspaceId);
            return workspace;
        }

        try {
            workspace.setStatus(Workspace.WorkspaceStatus.STARTING);
            workspaceRepository.save(workspace);

            // 启动容器
            String containerId = containerService.startContainer(workspace);
            workspace.setContainerId(containerId);

            // 设置容器访问URL
            String containerUrl = containerService.getContainerUrl(containerId);
            workspace.setContainerUrl(containerUrl);

            workspace.setStatus(Workspace.WorkspaceStatus.RUNNING);
            workspace.updateLastAccessed();

            Workspace savedWorkspace = workspaceRepository.save(workspace);
            logger.info("Workspace {} started successfully", workspaceId);

            return savedWorkspace;

        } catch (Exception e) {
            logger.error("Failed to start workspace: {}", workspaceId, e);
            workspace.setStatus(Workspace.WorkspaceStatus.ERROR);
            workspaceRepository.save(workspace);
            throw new RuntimeException("启动工作空间失败: " + e.getMessage());
        }
    }

    /**
     * 停止工作空间
     */
    public Workspace stopWorkspace(String workspaceId, String userId) {
        logger.info("Stopping workspace: {} by user: {}", workspaceId, userId);

        Workspace workspace = getWorkspace(workspaceId, userId);

        if (workspace.getStatus() == Workspace.WorkspaceStatus.STOPPED) {
            logger.info("Workspace {} is already stopped", workspaceId);
            return workspace;
        }

        try {
            workspace.setStatus(Workspace.WorkspaceStatus.STOPPING);
            workspaceRepository.save(workspace);

            // 停止容器
            if (workspace.getContainerId() != null) {
                containerService.stopContainer(workspace.getContainerId());
            }

            workspace.setStatus(Workspace.WorkspaceStatus.STOPPED);
            workspace.setContainerId(null);
            workspace.setContainerUrl(null);

            Workspace savedWorkspace = workspaceRepository.save(workspace);
            logger.info("Workspace {} stopped successfully", workspaceId);

            return savedWorkspace;

        } catch (Exception e) {
            logger.error("Failed to stop workspace: {}", workspaceId, e);
            workspace.setStatus(Workspace.WorkspaceStatus.ERROR);
            workspaceRepository.save(workspace);
            throw new RuntimeException("停止工作空间失败: " + e.getMessage());
        }
    }

    /**
     * 删除工作空间
     */
    public void deleteWorkspace(String workspaceId, String userId) {
        logger.info("Deleting workspace: {} by user: {}", workspaceId, userId);

        Workspace workspace = getWorkspace(workspaceId, userId);

        // 只有拥有者才能删除工作空间
        if (!workspace.isOwner(userId)) {
            throw new WorkspacePermissionException("只有工作空间拥有者才能删除");
        }

        try {
            // 先停止工作空间
            if (workspace.getStatus() == Workspace.WorkspaceStatus.RUNNING) {
                stopWorkspace(workspaceId, userId);
            }

            // 删除容器
            if (workspace.getContainerId() != null) {
                containerService.deleteContainer(workspace.getContainerId());
            }

            // 删除所有文件
            codeFileService.deleteAllFiles(workspaceId);

            // 删除工作空间
            workspaceRepository.deleteById(workspaceId);

            logger.info("Workspace {} deleted successfully", workspaceId);

        } catch (Exception e) {
            logger.error("Failed to delete workspace: {}", workspaceId, e);
            throw new RuntimeException("删除工作空间失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的工作空间列表
     */
    public Page<Workspace> getUserWorkspaces(String userId, Pageable pageable) {
        return workspaceRepository.findByUserId(userId, pageable);
    }

    /**
     * 获取用户参与的所有工作空间
     */
    public List<Workspace> getUserAllWorkspaces(String userId) {
        return workspaceRepository.findByUserIdOrCollaboratorsContaining(userId);
    }

    /**
     * 添加协作者
     */
    public Workspace addCollaborator(String workspaceId, String userId, String collaboratorId) {
        Workspace workspace = getWorkspace(workspaceId, userId);

        // 只有拥有者才能添加协作者
        if (!workspace.isOwner(userId)) {
            throw new WorkspacePermissionException("只有工作空间拥有者才能添加协作者");
        }

        workspace.addCollaborator(collaboratorId);
        return workspaceRepository.save(workspace);
    }

    /**
     * 移除协作者
     */
    public Workspace removeCollaborator(String workspaceId, String userId, String collaboratorId) {
        Workspace workspace = getWorkspace(workspaceId, userId);

        // 只有拥有者才能移除协作者
        if (!workspace.isOwner(userId)) {
            throw new WorkspacePermissionException("只有工作空间拥有者才能移除协作者");
        }

        workspace.removeCollaborator(collaboratorId);
        return workspaceRepository.save(workspace);
    }

    /**
     * 更新工作空间信息
     */
    public Workspace updateWorkspace(String workspaceId, String userId, Workspace updateData) {
        Workspace workspace = getWorkspace(workspaceId, userId);

        // 只有拥有者才能更新工作空间信息
        if (!workspace.isOwner(userId)) {
            throw new WorkspacePermissionException("只有工作空间拥有者才能更新工作空间");
        }

        // 更新允许的字段
        if (updateData.getName() != null) {
            workspace.setName(updateData.getName());
        }
        if (updateData.getDescription() != null) {
            workspace.setDescription(updateData.getDescription());
        }
        if (updateData.getEnvironmentConfig() != null) {
            workspace.setEnvironmentConfig(updateData.getEnvironmentConfig());
        }

        return workspaceRepository.save(workspace);
    }

    /**
     * 搜索工作空间
     */
    public List<Workspace> searchWorkspaces(String userId, String searchText) {
        return workspaceRepository.findByUserIdAndNameContainingIgnoreCase(userId, searchText);
    }

    /**
     * 获取最近访问的工作空间
     */
    public List<Workspace> getRecentWorkspaces(String userId, int limit) {
        List<Workspace> workspaces = workspaceRepository.findByUserIdOrderByLastAccessedAtDesc(userId);
        return workspaces.subList(0, Math.min(limit, workspaces.size()));
    }

    /**
     * 清理非活跃工作空间
     */
    public void cleanupInactiveWorkspaces() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(30); // 30天未访问
        List<Workspace> inactiveWorkspaces = workspaceRepository.findInactiveWorkspaces(cutoffTime);

        for (Workspace workspace : inactiveWorkspaces) {
            try {
                logger.info("Cleaning up inactive workspace: {}", workspace.getId());

                // 停止并删除容器
                if (workspace.getContainerId() != null) {
                    containerService.deleteContainer(workspace.getContainerId());
                }

                // 更新状态
                workspace.setStatus(Workspace.WorkspaceStatus.SUSPENDED);
                workspace.setContainerId(null);
                workspace.setContainerUrl(null);
                workspaceRepository.save(workspace);

            } catch (Exception e) {
                logger.error("Failed to cleanup workspace: {}", workspace.getId(), e);
            }
        }
    }

    /**
     * 创建默认环境配置
     */
    private Workspace.EnvironmentConfig createDefaultEnvironmentConfig(String language, String framework) {
        Workspace.EnvironmentConfig config = new Workspace.EnvironmentConfig();

        // 根据语言设置默认Docker镜像
        switch (language.toLowerCase()) {
            case "java":
                config.setDockerImage("openjdk:11-jdk");
                config.setWorkingDirectory("/workspace");
                break;
            case "javascript":
            case "typescript":
                config.setDockerImage("node:16-alpine");
                config.setWorkingDirectory("/workspace");
                break;
            case "python":
                config.setDockerImage("python:3.9");
                config.setWorkingDirectory("/workspace");
                break;
            case "go":
                config.setDockerImage("golang:1.19");
                config.setWorkingDirectory("/workspace");
                break;
            default:
                config.setDockerImage("ubuntu:20.04");
                config.setWorkingDirectory("/workspace");
        }

        // 设置默认资源限制
        Workspace.ResourceLimits resourceLimits = new Workspace.ResourceLimits("1Gi", "0.5", "5Gi");
        config.setResourceLimits(resourceLimits);

        return config;
    }

    /**
     * 创建默认容器配置
     */
    private Workspace.ContainerConfig createDefaultContainerConfig(String language, String framework) {
        Workspace.ContainerConfig config = new Workspace.ContainerConfig();

        // 根据语言设置默认配置
        switch (language.toLowerCase()) {
            case "java":
                config.setImage("openjdk:11-jdk");
                break;
            case "javascript":
            case "typescript":
                config.setImage("node:16-alpine");
                break;
            case "python":
                config.setImage("python:3.9");
                break;
            case "go":
                config.setImage("golang:1.19");
                break;
            default:
                config.setImage("ubuntu:20.04");
        }

        return config;
    }
}