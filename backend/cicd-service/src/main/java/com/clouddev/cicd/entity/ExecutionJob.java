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
 * ExecutionJob实体类
 * 表示流水线执行任务
 */
@Entity
@Table(name = "execution_jobs")
public class ExecutionJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private ExecutionStage stage;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer jobOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.PENDING;

    @Column(length = 200)
    private String dockerImage;

    @Column(length = 100)
    private String containerId;

    @Column
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column
    private Long durationSeconds;

    @ElementCollection
    @CollectionTable(name = "job_commands", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "command", length = 1000)
    private List<String> commands = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_variables", joinColumns = @JoinColumn(name = "job_id"))
    @MapKeyColumn(name = "variable_key")
    @Column(name = "variable_value", length = 1000)
    private Map<String, String> variables = new HashMap<>();

    @Column(columnDefinition = "TEXT")
    private String logs;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column
    private Integer exitCode;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 关联关系
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExecutionArtifact> artifacts = new ArrayList<>();

    /**
     * 任务状态枚举
     */
    public enum JobStatus {
        PENDING,    // 等待中
        RUNNING,    // 运行中
        SUCCESS,    // 成功
        FAILED,     // 失败
        CANCELLED,  // 已取消
        SKIPPED     // 已跳过
    }

    // 业务方法

    /**
     * 开始执行任务
     */
    public void start() {
        this.status = JobStatus.RUNNING;
        this.startTime = LocalDateTime.now();
    }

    /**
     * 完成任务执行
     */
    public void complete(JobStatus finalStatus, Integer exitCode) {
        this.status = finalStatus;
        this.exitCode = exitCode;
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.durationSeconds = java.time.Duration.between(this.startTime, this.endTime).getSeconds();
        }
    }

    /**
     * 跳过任务
     */
    public void skip() {
        this.status = JobStatus.SKIPPED;
        this.endTime = LocalDateTime.now();
    }

    /**
     * 取消任务
     */
    public void cancel() {
        this.status = JobStatus.CANCELLED;
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.durationSeconds = java.time.Duration.between(this.startTime, this.endTime).getSeconds();
        }
    }

    /**
     * 检查是否正在运行
     */
    public boolean isRunning() {
        return this.status == JobStatus.RUNNING;
    }

    /**
     * 检查是否已完成
     */
    public boolean isFinished() {
        return this.status == JobStatus.SUCCESS || 
               this.status == JobStatus.FAILED || 
               this.status == JobStatus.CANCELLED ||
               this.status == JobStatus.SKIPPED;
    }

    /**
     * 检查是否成功
     */
    public boolean isSuccessful() {
        return this.status == JobStatus.SUCCESS;
    }

    /**
     * 添加日志
     */
    public void appendLog(String logEntry) {
        if (this.logs == null) {
            this.logs = logEntry + "\n";
        } else {
            this.logs += logEntry + "\n";
        }
    }

    /**
     * 添加命令
     */
    public void addCommand(String command) {
        this.commands.add(command);
    }

    /**
     * 添加变量
     */
    public void addVariable(String key, String value) {
        this.variables.put(key, value);
    }

    /**
     * 获取格式化的持续时间
     */
    public String getFormattedDuration() {
        if (this.durationSeconds == null) {
            return "0s";
        }
        
        long minutes = this.durationSeconds / 60;
        long seconds = this.durationSeconds % 60;
        
        if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds);
        } else {
            return String.format("%ds", seconds);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExecutionStage getStage() {
        return stage;
    }

    public void setStage(ExecutionStage stage) {
        this.stage = stage;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getJobOrder() {
        return jobOrder;
    }

    public void setJobOrder(Integer jobOrder) {
        this.jobOrder = jobOrder;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getDockerImage() {
        return dockerImage;
    }

    public void setDockerImage(String dockerImage) {
        this.dockerImage = dockerImage;
    }

    public String getContainerId() {
        return containerId;
    }

    public void setContainerId(String containerId) {
        this.containerId = containerId;
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

    public List<String> getCommands() {
        return commands;
    }

    public void setCommands(List<String> commands) {
        this.commands = commands;
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

    public Integer getExitCode() {
        return exitCode;
    }

    public void setExitCode(Integer exitCode) {
        this.exitCode = exitCode;
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

    public List<ExecutionArtifact> getArtifacts() {
        return artifacts;
    }

    public void setArtifacts(List<ExecutionArtifact> artifacts) {
        this.artifacts = artifacts;
    }
}