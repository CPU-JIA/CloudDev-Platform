package com.clouddev.ide.service;

import com.clouddev.ide.entity.Workspace;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 容器服务类
 * 用于管理工作空间的容器生命周期
 */
@Service
public class ContainerService {

    private static final Logger logger = LoggerFactory.getLogger(ContainerService.class);

    @Value("${app.container.registry:clouddev}")
    private String containerRegistry;

    @Value("${app.container.base-url:http://localhost}")
    private String containerBaseUrl;

    @Value("${app.container.port-range-start:8000}")
    private int portRangeStart;

    @Value("${app.container.port-range-end:9000}")
    private int portRangeEnd;

    // 模拟容器存储
    private final Map<String, ContainerInfo> containers = new HashMap<>();

    /**
     * 启动容器
     */
    public String startContainer(Workspace workspace) {
        logger.info("Starting container for workspace: {}", workspace.getId());

        try {
            String containerId = generateContainerId();
            ContainerInfo container = createContainer(workspace, containerId);

            // 模拟容器启动过程
            Thread.sleep(2000); // 模拟启动时间

            container.setStatus("running");
            containers.put(containerId, container);

            logger.info("Container started successfully: {}", containerId);
            return containerId;

        } catch (Exception e) {
            logger.error("Failed to start container for workspace: {}", workspace.getId(), e);
            throw new RuntimeException("容器启动失败: " + e.getMessage());
        }
    }

    /**
     * 停止容器
     */
    public void stopContainer(String containerId) {
        logger.info("Stopping container: {}", containerId);

        ContainerInfo container = containers.get(containerId);
        if (container != null) {
            container.setStatus("stopped");
            logger.info("Container stopped successfully: {}", containerId);
        } else {
            logger.warn("Container not found: {}", containerId);
        }
    }

    /**
     * 删除容器
     */
    public void deleteContainer(String containerId) {
        logger.info("Deleting container: {}", containerId);

        ContainerInfo container = containers.get(containerId);
        if (container != null) {
            // 先停止容器
            if ("running".equals(container.getStatus())) {
                stopContainer(containerId);
            }

            // 删除容器
            containers.remove(containerId);
            logger.info("Container deleted successfully: {}", containerId);
        } else {
            logger.warn("Container not found: {}", containerId);
        }
    }

    /**
     * 获取容器状态
     */
    public String getContainerStatus(String containerId) {
        ContainerInfo container = containers.get(containerId);
        return container != null ? container.getStatus() : "not_found";
    }

    /**
     * 获取容器访问URL
     */
    public String getContainerUrl(String containerId) {
        ContainerInfo container = containers.get(containerId);
        if (container != null) {
            return containerBaseUrl + ":" + container.getPort();
        }
        return null;
    }

    /**
     * 获取容器日志
     */
    public String getContainerLogs(String containerId, int lines) {
        ContainerInfo container = containers.get(containerId);
        if (container != null) {
            // 模拟日志返回
            StringBuilder logs = new StringBuilder();
            for (int i = 1; i <= lines; i++) {
                logs.append("Log line ").append(i).append(" from container ").append(containerId).append("\n");
            }
            return logs.toString();
        }
        return "Container not found";
    }

    /**
     * 执行容器命令
     */
    public String executeCommand(String containerId, String command) {
        logger.info("Executing command in container {}: {}", containerId, command);

        ContainerInfo container = containers.get(containerId);
        if (container == null) {
            throw new RuntimeException("容器不存在: " + containerId);
        }

        if (!"running".equals(container.getStatus())) {
            throw new RuntimeException("容器未运行: " + containerId);
        }

        // 模拟命令执行
        try {
            Thread.sleep(500); // 模拟执行时间
            return "Command executed successfully: " + command;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("命令执行被中断");
        }
    }

    /**
     * 获取容器资源使用情况
     */
    public ContainerStats getContainerStats(String containerId) {
        ContainerInfo container = containers.get(containerId);
        if (container == null) {
            throw new RuntimeException("容器不存在: " + containerId);
        }

        // 模拟资源使用数据
        ContainerStats stats = new ContainerStats();
        stats.setCpuUsage(Math.random() * 100);
        stats.setMemoryUsage(Math.random() * 1024); // MB
        stats.setNetworkIO(new ContainerStats.NetworkIO(
            (long)(Math.random() * 1000000), // bytes in
            (long)(Math.random() * 1000000)  // bytes out
        ));
        stats.setDiskIO(new ContainerStats.DiskIO(
            (long)(Math.random() * 1000000), // bytes read
            (long)(Math.random() * 1000000)  // bytes write
        ));

        return stats;
    }

    /**
     * 重启容器
     */
    public void restartContainer(String containerId) {
        logger.info("Restarting container: {}", containerId);

        ContainerInfo container = containers.get(containerId);
        if (container != null) {
            container.setStatus("restarting");
            
            try {
                Thread.sleep(3000); // 模拟重启时间
                container.setStatus("running");
                logger.info("Container restarted successfully: {}", containerId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                container.setStatus("error");
                throw new RuntimeException("容器重启失败");
            }
        } else {
            throw new RuntimeException("容器不存在: " + containerId);
        }
    }

    /**
     * 创建容器信息
     */
    private ContainerInfo createContainer(Workspace workspace, String containerId) {
        ContainerInfo container = new ContainerInfo();
        container.setId(containerId);
        container.setWorkspaceId(workspace.getId());
        container.setImage(getImageName(workspace));
        container.setPort(allocatePort());
        container.setStatus("starting");

        // 设置环境变量
        Map<String, String> envVars = new HashMap<>();
        envVars.put("WORKSPACE_ID", workspace.getId());
        envVars.put("USER_ID", workspace.getUserId());
        envVars.put("LANGUAGE", workspace.getLanguage());
        envVars.put("FRAMEWORK", workspace.getFramework());
        container.setEnvironmentVariables(envVars);

        return container;
    }

    /**
     * 获取镜像名称
     */
    private String getImageName(Workspace workspace) {
        String language = workspace.getLanguage().toLowerCase();
        String framework = workspace.getFramework();

        if (workspace.getEnvironmentConfig() != null && 
            workspace.getEnvironmentConfig().getDockerImage() != null) {
            return workspace.getEnvironmentConfig().getDockerImage();
        }

        // 默认镜像映射
        switch (language) {
            case "java":
                return containerRegistry + "/java-dev:latest";
            case "javascript":
            case "typescript":
                return containerRegistry + "/node-dev:latest";
            case "python":
                return containerRegistry + "/python-dev:latest";
            case "go":
                return containerRegistry + "/go-dev:latest";
            default:
                return containerRegistry + "/universal-dev:latest";
        }
    }

    /**
     * 分配端口
     */
    private int allocatePort() {
        // 简单的端口分配策略
        for (int port = portRangeStart; port <= portRangeEnd; port++) {
            boolean portInUse = containers.values().stream()
                    .anyMatch(container -> container.getPort() == port);
            if (!portInUse) {
                return port;
            }
        }
        throw new RuntimeException("没有可用端口");
    }

    /**
     * 生成容器ID
     */
    private String generateContainerId() {
        return "container_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    /**
     * 容器信息类
     */
    public static class ContainerInfo {
        private String id;
        private String workspaceId;
        private String image;
        private int port;
        private String status;
        private Map<String, String> environmentVariables;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getWorkspaceId() {
            return workspaceId;
        }

        public void setWorkspaceId(String workspaceId) {
            this.workspaceId = workspaceId;
        }

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public int getPort() {
            return port;
        }

        public void setPort(int port) {
            this.port = port;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Map<String, String> getEnvironmentVariables() {
            return environmentVariables;
        }

        public void setEnvironmentVariables(Map<String, String> environmentVariables) {
            this.environmentVariables = environmentVariables;
        }
    }

    /**
     * 容器统计信息类
     */
    public static class ContainerStats {
        private double cpuUsage;      // CPU使用率 (%)
        private double memoryUsage;   // 内存使用量 (MB)
        private NetworkIO networkIO;  // 网络IO
        private DiskIO diskIO;        // 磁盘IO

        // Getters and Setters
        public double getCpuUsage() {
            return cpuUsage;
        }

        public void setCpuUsage(double cpuUsage) {
            this.cpuUsage = cpuUsage;
        }

        public double getMemoryUsage() {
            return memoryUsage;
        }

        public void setMemoryUsage(double memoryUsage) {
            this.memoryUsage = memoryUsage;
        }

        public NetworkIO getNetworkIO() {
            return networkIO;
        }

        public void setNetworkIO(NetworkIO networkIO) {
            this.networkIO = networkIO;
        }

        public DiskIO getDiskIO() {
            return diskIO;
        }

        public void setDiskIO(DiskIO diskIO) {
            this.diskIO = diskIO;
        }

        public static class NetworkIO {
            private long bytesIn;
            private long bytesOut;

            public NetworkIO(long bytesIn, long bytesOut) {
                this.bytesIn = bytesIn;
                this.bytesOut = bytesOut;
            }

            public long getBytesIn() {
                return bytesIn;
            }

            public void setBytesIn(long bytesIn) {
                this.bytesIn = bytesIn;
            }

            public long getBytesOut() {
                return bytesOut;
            }

            public void setBytesOut(long bytesOut) {
                this.bytesOut = bytesOut;
            }
        }

        public static class DiskIO {
            private long bytesRead;
            private long bytesWrite;

            public DiskIO(long bytesRead, long bytesWrite) {
                this.bytesRead = bytesRead;
                this.bytesWrite = bytesWrite;
            }

            public long getBytesRead() {
                return bytesRead;
            }

            public void setBytesRead(long bytesRead) {
                this.bytesRead = bytesRead;
            }

            public long getBytesWrite() {
                return bytesWrite;
            }

            public void setBytesWrite(long bytesWrite) {
                this.bytesWrite = bytesWrite;
            }
        }
    }
}