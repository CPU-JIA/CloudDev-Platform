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
 * Pipeline实体类
 * 表示CI/CD流水线配置
 */
@Entity
@Table(name = "pipelines")
public class Pipeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 200)
    private String repository;

    @Column(nullable = false, length = 50)
    private String branch = "main";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PipelineStatus status = PipelineStatus.ACTIVE;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long createdBy;

    @ElementCollection
    @CollectionTable(name = "pipeline_tags", joinColumns = @JoinColumn(name = "pipeline_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "pipeline_variables", joinColumns = @JoinColumn(name = "pipeline_id"))
    @MapKeyColumn(name = "variable_key")
    @Column(name = "variable_value", length = 1000)
    private Map<String, String> variables = new HashMap<>();

    // 触发器配置
    @Embedded
    private PipelineTriggers triggers;

    // 流水线配置(JSON格式存储)
    @Column(columnDefinition = "TEXT")
    private String configuration;

    // 统计信息
    @Column
    private Integer totalExecutions = 0;

    @Column
    private Integer successfulExecutions = 0;

    @Column
    private Integer failedExecutions = 0;

    @Column
    private Double successRate = 0.0;

    @Column
    private Long lastExecutionId;

    @Column
    private LocalDateTime lastExecutionTime;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 关联关系
    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PipelineExecution> executions = new ArrayList<>();

    /**
     * 流水线状态枚举
     */
    public enum PipelineStatus {
        ACTIVE,     // 活跃
        INACTIVE,   // 未激活
        ARCHIVED    // 归档
    }

    /**
     * 流水线触发器配置
     */
    @Embeddable
    public static class PipelineTriggers {
        
        @Column(name = "webhook_enabled")
        private Boolean webhookEnabled = true;

        @Column(name = "manual_enabled")
        private Boolean manualEnabled = true;

        @Column(name = "schedule_enabled")
        private Boolean scheduleEnabled = false;

        @Column(name = "schedule_cron", length = 100)
        private String scheduleCron;

        @Column(name = "pr_enabled")
        private Boolean pullRequestEnabled = false;

        @Column(name = "tag_enabled")
        private Boolean tagEnabled = false;

        // Getters and Setters
        public Boolean getWebhookEnabled() {
            return webhookEnabled;
        }

        public void setWebhookEnabled(Boolean webhookEnabled) {
            this.webhookEnabled = webhookEnabled;
        }

        public Boolean getManualEnabled() {
            return manualEnabled;
        }

        public void setManualEnabled(Boolean manualEnabled) {
            this.manualEnabled = manualEnabled;
        }

        public Boolean getScheduleEnabled() {
            return scheduleEnabled;
        }

        public void setScheduleEnabled(Boolean scheduleEnabled) {
            this.scheduleEnabled = scheduleEnabled;
        }

        public String getScheduleCron() {
            return scheduleCron;
        }

        public void setScheduleCron(String scheduleCron) {
            this.scheduleCron = scheduleCron;
        }

        public Boolean getPullRequestEnabled() {
            return pullRequestEnabled;
        }

        public void setPullRequestEnabled(Boolean pullRequestEnabled) {
            this.pullRequestEnabled = pullRequestEnabled;
        }

        public Boolean getTagEnabled() {
            return tagEnabled;
        }

        public void setTagEnabled(Boolean tagEnabled) {
            this.tagEnabled = tagEnabled;
        }
    }

    // 业务方法

    /**
     * 更新统计信息
     */
    public void updateStatistics(boolean isSuccess) {
        this.totalExecutions++;
        if (isSuccess) {
            this.successfulExecutions++;
        } else {
            this.failedExecutions++;
        }
        this.successRate = this.totalExecutions > 0 ? 
            (double) this.successfulExecutions / this.totalExecutions * 100 : 0.0;
    }

    /**
     * 检查是否可以执行
     */
    public boolean canExecute() {
        return this.status == PipelineStatus.ACTIVE;
    }

    /**
     * 添加标签
     */
    public void addTag(String tag) {
        if (!this.tags.contains(tag)) {
            this.tags.add(tag);
        }
    }

    /**
     * 移除标签
     */
    public void removeTag(String tag) {
        this.tags.remove(tag);
    }

    /**
     * 添加变量
     */
    public void addVariable(String key, String value) {
        this.variables.put(key, value);
    }

    /**
     * 移除变量
     */
    public void removeVariable(String key) {
        this.variables.remove(key);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRepository() {
        return repository;
    }

    public void setRepository(String repository) {
        this.repository = repository;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public PipelineStatus getStatus() {
        return status;
    }

    public void setStatus(PipelineStatus status) {
        this.status = status;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Map<String, String> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, String> variables) {
        this.variables = variables;
    }

    public PipelineTriggers getTriggers() {
        return triggers;
    }

    public void setTriggers(PipelineTriggers triggers) {
        this.triggers = triggers;
    }

    public String getConfiguration() {
        return configuration;
    }

    public void setConfiguration(String configuration) {
        this.configuration = configuration;
    }

    public Integer getTotalExecutions() {
        return totalExecutions;
    }

    public void setTotalExecutions(Integer totalExecutions) {
        this.totalExecutions = totalExecutions;
    }

    public Integer getSuccessfulExecutions() {
        return successfulExecutions;
    }

    public void setSuccessfulExecutions(Integer successfulExecutions) {
        this.successfulExecutions = successfulExecutions;
    }

    public Integer getFailedExecutions() {
        return failedExecutions;
    }

    public void setFailedExecutions(Integer failedExecutions) {
        this.failedExecutions = failedExecutions;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    public Long getLastExecutionId() {
        return lastExecutionId;
    }

    public void setLastExecutionId(Long lastExecutionId) {
        this.lastExecutionId = lastExecutionId;
    }

    public LocalDateTime getLastExecutionTime() {
        return lastExecutionTime;
    }

    public void setLastExecutionTime(LocalDateTime lastExecutionTime) {
        this.lastExecutionTime = lastExecutionTime;
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

    public List<PipelineExecution> getExecutions() {
        return executions;
    }

    public void setExecutions(List<PipelineExecution> executions) {
        this.executions = executions;
    }
}