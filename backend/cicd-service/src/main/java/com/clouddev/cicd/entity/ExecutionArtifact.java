package com.clouddev.cicd.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ExecutionArtifact实体类
 * 表示流水线执行产生的构建产物
 */
@Entity
@Table(name = "execution_artifacts")
public class ExecutionArtifact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private PipelineExecution execution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private ExecutionJob job;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArtifactType type;

    @Column(nullable = false, length = 500)
    private String path;

    @Column(nullable = false, length = 500)
    private String storagePath;

    @Column
    private Long sizeBytes;

    @Column(length = 100)
    private String mimeType;

    @Column(length = 64)
    private String checksum;

    @Column
    private LocalDateTime expiresAt;

    @Column
    private Boolean isPublic = false;

    @Column
    private Integer downloadCount = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 构建产物类型枚举
     */
    public enum ArtifactType {
        BUILD_OUTPUT,   // 构建输出
        TEST_REPORT,    // 测试报告
        CODE_COVERAGE,  // 代码覆盖率报告
        DOCUMENTATION,  // 文档
        DOCKER_IMAGE,   // Docker镜像
        PACKAGE,        // 软件包
        LOG_FILE,       // 日志文件
        DEPLOYMENT,     // 部署文件
        OTHER           // 其他
    }

    // 业务方法

    /**
     * 增加下载次数
     */
    public void incrementDownloadCount() {
        this.downloadCount = (this.downloadCount == null ? 0 : this.downloadCount) + 1;
    }

    /**
     * 检查是否已过期
     */
    public boolean isExpired() {
        return this.expiresAt != null && LocalDateTime.now().isAfter(this.expiresAt);
    }

    /**
     * 设置过期时间（从创建时间开始计算天数）
     */
    public void setExpirationDays(int days) {
        this.expiresAt = this.createdAt.plusDays(days);
    }

    /**
     * 获取格式化的文件大小
     */
    public String getFormattedSize() {
        if (this.sizeBytes == null || this.sizeBytes == 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = this.sizeBytes.doubleValue();

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.1f %s", size, units[unitIndex]);
    }

    /**
     * 获取文件扩展名
     */
    public String getFileExtension() {
        if (this.name == null || !this.name.contains(".")) {
            return "";
        }
        return this.name.substring(this.name.lastIndexOf(".") + 1).toLowerCase();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PipelineExecution getExecution() {
        return execution;
    }

    public void setExecution(PipelineExecution execution) {
        this.execution = execution;
    }

    public ExecutionJob getJob() {
        return job;
    }

    public void setJob(ExecutionJob job) {
        this.job = job;
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

    public ArtifactType getType() {
        return type;
    }

    public void setType(ArtifactType type) {
        this.type = type;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}