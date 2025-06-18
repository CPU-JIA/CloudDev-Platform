package com.clouddev.cicd.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PipelineExecution实体类
 * 表示流水线执行实例
 */
@Entity
@Table(name = "pipeline_executions")
public class PipelineExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String executionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id", nullable = false)
    private Pipeline pipeline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TriggerType triggerType;

    @Column(nullable = false)
    private Long triggeredBy;

    @Column(length = 100)
    private String branch;

    @Column(length = 50)
    private String commitHash;

    @Column(length = 500)
    private String commitMessage;

    @Column(length = 100)
    private String commitAuthor;

    @Column
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column
    private Long durationSeconds;

    @ElementCollection
    @CollectionTable(name = "execution_variables", joinColumns = @JoinColumn(name = "execution_id"))
    @MapKeyColumn(name = "variable_key")
    @Column(name = "variable_value", length = 1000)
    private Map<String, String> variables = new HashMap<>();

    @Column(columnDefinition = "TEXT")
    private String logs;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 关联关系
    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExecutionStage> stages = new ArrayList<>();

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExecutionArtifact> artifacts = new ArrayList<>();

    /**
     * 执行状态枚举
     */
    public enum ExecutionStatus {
        PENDING,    // 等待中
        RUNNING,    // 运行中
        SUCCESS,    // 成功
        FAILED,     // 失败
        CANCELLED,  // 已取消
        TIMEOUT     // 超时
    }

    /**
     * 触发类型枚举
     */
    public enum TriggerType {
        MANUAL,     // 手动触发
        WEBHOOK,    // Webhook触发
        SCHEDULE,   // 定时触发
        API,        // API触发
        PULL_REQUEST, // Pull Request触发
        TAG         // Tag触发
    }

    // 业务方法

    /**
     * 开始执行
     */
    public void start() {
        this.status = ExecutionStatus.RUNNING;
        this.startTime = LocalDateTime.now();
    }

    /**
     * 完成执行
     */
    public void complete(ExecutionStatus finalStatus) {
        this.status = finalStatus;
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.durationSeconds = java.time.Duration.between(this.startTime, this.endTime).getSeconds();
        }
    }

    /**
     * 取消执行
     */
    public void cancel() {
        this.status = ExecutionStatus.CANCELLED;
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.durationSeconds = java.time.Duration.between(this.startTime, this.endTime).getSeconds();
        }
    }

    /**
     * 检查是否正在运行
     */
    public boolean isRunning() {
        return this.status == ExecutionStatus.RUNNING;
    }

    /**
     * 检查是否已完成
     */
    public boolean isFinished() {
        return this.status == ExecutionStatus.SUCCESS || 
               this.status == ExecutionStatus.FAILED || 
               this.status == ExecutionStatus.CANCELLED ||
               this.status == ExecutionStatus.TIMEOUT;
    }

    /**
     * 检查是否成功
     */
    public boolean isSuccessful() {
        return this.status == ExecutionStatus.SUCCESS;
    }

    /**
     * 添加日志
     */
    public void appendLog(String logEntry) {
        if (this.logs == null) {
            this.logs = logEntry;
        } else {
            this.logs += "\n" + logEntry;
        }
    }

    /**
     * 添加变量
     */
    public void addVariable(String key, String value) {
        this.variables.put(key, value);
    }

    /**
     * 获取执行进度百分比
     */
    public int getProgressPercentage() {
        if (this.stages.isEmpty()) {
            return 0;
        }
        
        long completedStages = this.stages.stream()
            .mapToInt(stage -> stage.isFinished() ? 1 : 0)
            .sum();
        
        return (int) ((completedStages * 100) / this.stages.size());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExecutionNumber() {
        return executionNumber;
    }

    public void setExecutionNumber(String executionNumber) {
        this.executionNumber = executionNumber;
    }

    public Pipeline getPipeline() {
        return pipeline;
    }

    public void setPipeline(Pipeline pipeline) {
        this.pipeline = pipeline;
    }

    public ExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionStatus status) {
        this.status = status;
    }

    public TriggerType getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(TriggerType triggerType) {
        this.triggerType = triggerType;
    }

    public Long getTriggeredBy() {
        return triggeredBy;
    }

    public void setTriggeredBy(Long triggeredBy) {
        this.triggeredBy = triggeredBy;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getCommitHash() {
        return commitHash;
    }

    public void setCommitHash(String commitHash) {
        this.commitHash = commitHash;
    }

    public String getCommitMessage() {
        return commitMessage;
    }

    public void setCommitMessage(String commitMessage) {
        this.commitMessage = commitMessage;
    }

    public String getCommitAuthor() {
        return commitAuthor;
    }

    public void setCommitAuthor(String commitAuthor) {
        this.commitAuthor = commitAuthor;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Map<String, String> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, String> variables) {
        this.variables = variables;
    }

    public String getLogs() {
        return logs;
    }

    public void setLogs(String logs) {
        this.logs = logs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
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

    public List<ExecutionStage> getStages() {
        return stages;
    }

    public void setStages(List<ExecutionStage> stages) {
        this.stages = stages;
    }

    public List<ExecutionArtifact> getArtifacts() {
        return artifacts;
    }

    public void setArtifacts(List<ExecutionArtifact> artifacts) {
        this.artifacts = artifacts;
    }
}