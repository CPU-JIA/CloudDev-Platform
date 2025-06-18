package com.clouddev.ide.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 工作空间实体
 */
@Document(collection = "workspaces")
public class Workspace {

    @Id
    private String id;

    @Field("project_id")
    private String projectId;

    @Field("user_id")
    private String userId;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("language")
    private String language;

    @Field("framework")
    private String framework;

    @Field("environment_config")
    private EnvironmentConfig environmentConfig;

    @Field("container_config")
    private ContainerConfig containerConfig;

    @Field("status")
    private WorkspaceStatus status = WorkspaceStatus.STOPPED;

    @Field("container_id")
    private String containerId;

    @Field("container_url")
    private String containerUrl;

    @Field("port_mappings")
    private Map<Integer, Integer> portMappings = new HashMap<>();

    @Field("environment_variables")
    private Map<String, String> environmentVariables = new HashMap<>();

    @Field("files")
    private List<FileInfo> files = new ArrayList<>();

    @Field("collaborators")
    private Set<String> collaborators = new HashSet<>();

    @Field("last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // 构造函数
    public Workspace() {}

    public Workspace(String projectId, String userId, String name) {
        this.projectId = projectId;
        this.userId = userId;
        this.name = name;
        this.lastAccessedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getFramework() {
        return framework;
    }

    public void setFramework(String framework) {
        this.framework = framework;
    }

    public EnvironmentConfig getEnvironmentConfig() {
        return environmentConfig;
    }

    public void setEnvironmentConfig(EnvironmentConfig environmentConfig) {
        this.environmentConfig = environmentConfig;
    }

    public ContainerConfig getContainerConfig() {
        return containerConfig;
    }

    public void setContainerConfig(ContainerConfig containerConfig) {
        this.containerConfig = containerConfig;
    }

    public WorkspaceStatus getStatus() {
        return status;
    }

    public void setStatus(WorkspaceStatus status) {
        this.status = status;
    }

    public String getContainerId() {
        return containerId;
    }

    public void setContainerId(String containerId) {
        this.containerId = containerId;
    }

    public String getContainerUrl() {
        return containerUrl;
    }

    public void setContainerUrl(String containerUrl) {
        this.containerUrl = containerUrl;
    }

    public Map<Integer, Integer> getPortMappings() {
        return portMappings;
    }

    public void setPortMappings(Map<Integer, Integer> portMappings) {
        this.portMappings = portMappings;
    }

    public Map<String, String> getEnvironmentVariables() {
        return environmentVariables;
    }

    public void setEnvironmentVariables(Map<String, String> environmentVariables) {
        this.environmentVariables = environmentVariables;
    }

    public List<FileInfo> getFiles() {
        return files;
    }

    public void setFiles(List<FileInfo> files) {
        this.files = files;
    }

    public Set<String> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(Set<String> collaborators) {
        this.collaborators = collaborators;
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 工具方法
    public void updateLastAccessed() {
        this.lastAccessedAt = LocalDateTime.now();
    }

    public void addCollaborator(String userId) {
        this.collaborators.add(userId);
    }

    public void removeCollaborator(String userId) {
        this.collaborators.remove(userId);
    }

    public boolean isOwner(String userId) {
        return this.userId.equals(userId);
    }

    public boolean isCollaborator(String userId) {
        return this.collaborators.contains(userId) || isOwner(userId);
    }

    public void addPortMapping(int containerPort, int hostPort) {
        this.portMappings.put(containerPort, hostPort);
    }

    public void addEnvironmentVariable(String key, String value) {
        this.environmentVariables.put(key, value);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Workspace)) return false;
        Workspace workspace = (Workspace) o;
        return Objects.equals(id, workspace.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Workspace{" +
                "id='" + id + '\'' +
                ", projectId='" + projectId + '\'' +
                ", userId='" + userId + '\'' +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", language='" + language + '\'' +
                ", framework='" + framework + '\'' +
                '}';
    }

    /**
     * 工作空间状态枚举
     */
    public enum WorkspaceStatus {
        STOPPED,    // 已停止
        STARTING,   // 启动中
        RUNNING,    // 运行中
        STOPPING,   // 停止中
        ERROR,      // 错误状态
        SUSPENDED   // 挂起
    }

    /**
     * 环境配置类
     */
    public static class EnvironmentConfig {
        private String dockerImage;
        private String workingDirectory;
        private List<String> startupCommands;
        private Map<String, String> envVariables;
        private ResourceLimits resourceLimits;

        public EnvironmentConfig() {
            this.startupCommands = new ArrayList<>();
            this.envVariables = new HashMap<>();
        }

        // Getters and Setters
        public String getDockerImage() {
            return dockerImage;
        }

        public void setDockerImage(String dockerImage) {
            this.dockerImage = dockerImage;
        }

        public String getWorkingDirectory() {
            return workingDirectory;
        }

        public void setWorkingDirectory(String workingDirectory) {
            this.workingDirectory = workingDirectory;
        }

        public List<String> getStartupCommands() {
            return startupCommands;
        }

        public void setStartupCommands(List<String> startupCommands) {
            this.startupCommands = startupCommands;
        }

        public Map<String, String> getEnvVariables() {
            return envVariables;
        }

        public void setEnvVariables(Map<String, String> envVariables) {
            this.envVariables = envVariables;
        }

        public ResourceLimits getResourceLimits() {
            return resourceLimits;
        }

        public void setResourceLimits(ResourceLimits resourceLimits) {
            this.resourceLimits = resourceLimits;
        }
    }

    /**
     * 容器配置类
     */
    public static class ContainerConfig {
        private String image;
        private List<String> command;
        private List<String> args;
        private Map<String, String> labels;
        private List<VolumeMount> volumeMounts;

        public ContainerConfig() {
            this.command = new ArrayList<>();
            this.args = new ArrayList<>();
            this.labels = new HashMap<>();
            this.volumeMounts = new ArrayList<>();
        }

        // Getters and Setters
        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public List<String> getCommand() {
            return command;
        }

        public void setCommand(List<String> command) {
            this.command = command;
        }

        public List<String> getArgs() {
            return args;
        }

        public void setArgs(List<String> args) {
            this.args = args;
        }

        public Map<String, String> getLabels() {
            return labels;
        }

        public void setLabels(Map<String, String> labels) {
            this.labels = labels;
        }

        public List<VolumeMount> getVolumeMounts() {
            return volumeMounts;
        }

        public void setVolumeMounts(List<VolumeMount> volumeMounts) {
            this.volumeMounts = volumeMounts;
        }
    }

    /**
     * 资源限制类
     */
    public static class ResourceLimits {
        private String memory;      // 内存限制，如 "512Mi"
        private String cpu;         // CPU限制，如 "0.5"
        private String storage;     // 存储限制，如 "10Gi"

        public ResourceLimits() {}

        public ResourceLimits(String memory, String cpu, String storage) {
            this.memory = memory;
            this.cpu = cpu;
            this.storage = storage;
        }

        // Getters and Setters
        public String getMemory() {
            return memory;
        }

        public void setMemory(String memory) {
            this.memory = memory;
        }

        public String getCpu() {
            return cpu;
        }

        public void setCpu(String cpu) {
            this.cpu = cpu;
        }

        public String getStorage() {
            return storage;
        }

        public void setStorage(String storage) {
            this.storage = storage;
        }
    }

    /**
     * 卷挂载类
     */
    public static class VolumeMount {
        private String name;
        private String mountPath;
        private String subPath;
        private boolean readOnly;

        public VolumeMount() {}

        public VolumeMount(String name, String mountPath) {
            this.name = name;
            this.mountPath = mountPath;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getMountPath() {
            return mountPath;
        }

        public void setMountPath(String mountPath) {
            this.mountPath = mountPath;
        }

        public String getSubPath() {
            return subPath;
        }

        public void setSubPath(String subPath) {
            this.subPath = subPath;
        }

        public boolean isReadOnly() {
            return readOnly;
        }

        public void setReadOnly(boolean readOnly) {
            this.readOnly = readOnly;
        }
    }

    /**
     * 文件信息类
     */
    public static class FileInfo {
        private String path;
        private String name;
        private String type;        // file, directory
        private long size;
        private LocalDateTime lastModified;
        private String mimeType;

        public FileInfo() {}

        public FileInfo(String path, String name, String type) {
            this.path = path;
            this.name = name;
            this.type = type;
            this.lastModified = LocalDateTime.now();
        }

        // Getters and Setters
        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public long getSize() {
            return size;
        }

        public void setSize(long size) {
            this.size = size;
        }

        public LocalDateTime getLastModified() {
            return lastModified;
        }

        public void setLastModified(LocalDateTime lastModified) {
            this.lastModified = lastModified;
        }

        public String getMimeType() {
            return mimeType;
        }

        public void setMimeType(String mimeType) {
            this.mimeType = mimeType;
        }
    }
}