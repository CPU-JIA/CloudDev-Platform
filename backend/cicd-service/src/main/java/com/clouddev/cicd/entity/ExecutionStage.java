package com.clouddev.cicd.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ExecutionStage实体类
 * 表示流水线执行阶段
 */
@Entity
@Table(name = "execution_stages")
public class ExecutionStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private PipelineExecution execution;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer stageOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StageStatus status = StageStatus.PENDING;

    @Column
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column
    private Long durationSeconds;

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
    @OneToMany(mappedBy = "stage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExecutionJob> jobs = new ArrayList<>();

    /**
     * 阶段状态枚举
     */
    public enum StageStatus {
        PENDING,    // 等待中
        RUNNING,    // 运行中
        SUCCESS,    // 成功
        FAILED,     // 失败
        CANCELLED,  // 已取消
        SKIPPED     // 已跳过
    }

    // 业务方法

    /**
     * 开始执行阶段
     */
    public void start() {
        this.status = StageStatus.RUNNING;
        this.startTime = LocalDateTime.now();
    }

    /**
     * 完成阶段执行
     */
    public void complete(StageStatus finalStatus) {
        this.status = finalStatus;
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.durationSeconds = java.time.Duration.between(this.startTime, this.endTime).getSeconds();
        }
    }

    /**
     * 跳过阶段
     */
    public void skip() {
        this.status = StageStatus.SKIPPED;
        this.endTime = LocalDateTime.now();
    }

    /**
     * 取消阶段
     */
    public void cancel() {
        this.status = StageStatus.CANCELLED;
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.durationSeconds = java.time.Duration.between(this.startTime, this.endTime).getSeconds();
        }
    }

    /**
     * 检查是否正在运行
     */
    public boolean isRunning() {
        return this.status == StageStatus.RUNNING;
    }

    /**
     * 检查是否已完成
     */
    public boolean isFinished() {
        return this.status == StageStatus.SUCCESS || 
               this.status == StageStatus.FAILED || 
               this.status == StageStatus.CANCELLED ||
               this.status == StageStatus.SKIPPED;
    }

    /**
     * 检查是否成功
     */
    public boolean isSuccessful() {
        return this.status == StageStatus.SUCCESS;
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
     * 获取阶段进度百分比
     */
    public int getProgressPercentage() {
        if (this.jobs.isEmpty()) {
            return 0;
        }
        
        long completedJobs = this.jobs.stream()
            .mapToInt(job -> job.isFinished() ? 1 : 0)
            .sum();
        
        return (int) ((completedJobs * 100) / this.jobs.size());
    }

    /**
     * 检查所有任务是否成功
     */
    public boolean allJobsSuccessful() {
        return this.jobs.stream().allMatch(ExecutionJob::isSuccessful);
    }

    /**
     * 检查是否有任务失败
     */
    public boolean hasFailedJobs() {
        return this.jobs.stream().anyMatch(job -> job.getStatus() == ExecutionJob.JobStatus.FAILED);
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getStageOrder() {
        return stageOrder;
    }

    public void setStageOrder(Integer stageOrder) {
        this.stageOrder = stageOrder;
    }

    public StageStatus getStatus() {
        return status;
    }

    public void setStatus(StageStatus status) {
        this.status = status;
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

    public List<ExecutionJob> getJobs() {
        return jobs;
    }

    public void setJobs(List<ExecutionJob> jobs) {
        this.jobs = jobs;
    }
}