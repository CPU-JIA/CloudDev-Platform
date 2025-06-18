package com.clouddev.project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Task实体类
 * 表示项目任务
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType type = TaskType.TASK;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Long reporterId;

    @Column
    private Long assigneeId;

    @Column
    private LocalDateTime dueDate;

    @Column
    private LocalDateTime startDate;

    @Column
    private LocalDateTime completedDate;

    @Column
    private Integer estimatedHours;

    @Column
    private Integer actualHours = 0;

    @Column
    private Integer storyPoints;

    @Column
    private String acceptanceCriteria;

    @Column
    private Integer orderIndex = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    private Task parentTask;

    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> subTasks = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "task_labels", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "label")
    private Set<String> labels = new HashSet<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaskComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaskAttachment> attachments = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 任务状态枚举
     */
    public enum TaskStatus {
        TODO,           // 待办
        IN_PROGRESS,    // 进行中
        REVIEW,         // 审查中
        TESTING,        // 测试中
        DONE,           // 完成
        CANCELLED       // 已取消
    }

    /**
     * 任务优先级枚举
     */
    public enum TaskPriority {
        LOW,        // 低
        MEDIUM,     // 中
        HIGH,       // 高
        URGENT      // 紧急
    }

    /**
     * 任务类型枚举
     */
    public enum TaskType {
        TASK,       // 任务
        BUG,        // 缺陷
        FEATURE,    // 功能
        STORY,      // 用户故事
        EPIC        // 史诗
    }

    // 业务方法

    /**
     * 检查任务是否已完成
     */
    public boolean isCompleted() {
        return this.status == TaskStatus.DONE;
    }

    /**
     * 检查任务是否逾期
     */
    public boolean isOverdue() {
        return this.dueDate != null && 
               !isCompleted() && 
               LocalDateTime.now().isAfter(this.dueDate);
    }

    /**
     * 检查任务是否已分配
     */
    public boolean isAssigned() {
        return this.assigneeId != null;
    }

    /**
     * 检查用户是否为任务负责人
     */
    public boolean isAssignee(Long userId) {
        return this.assigneeId != null && this.assigneeId.equals(userId);
    }

    /**
     * 检查用户是否为任务报告人
     */
    public boolean isReporter(Long userId) {
        return this.reporterId.equals(userId);
    }

    /**
     * 完成任务
     */
    public void complete() {
        this.status = TaskStatus.DONE;
        this.completedDate = LocalDateTime.now();
        
        // 更新项目统计
        if (this.project != null) {
            this.project.incrementCompletedTaskCount();
        }
    }

    /**
     * 重新打开任务
     */
    public void reopen() {
        if (this.status == TaskStatus.DONE) {
            this.status = TaskStatus.TODO;
            this.completedDate = null;
            
            // 更新项目统计
            if (this.project != null) {
                this.project.decrementCompletedTaskCount();
            }
        }
    }

    /**
     * 分配任务
     */
    public void assign(Long userId) {
        this.assigneeId = userId;
        if (this.status == TaskStatus.TODO) {
            this.status = TaskStatus.IN_PROGRESS;
        }
    }

    /**
     * 取消分配
     */
    public void unassign() {
        this.assigneeId = null;
        if (this.status == TaskStatus.IN_PROGRESS) {
            this.status = TaskStatus.TODO;
        }
    }

    /**
     * 计算任务进度
     */
    public double getProgress() {
        switch (this.status) {
            case TODO: return 0.0;
            case IN_PROGRESS: return 30.0;
            case REVIEW: return 60.0;
            case TESTING: return 80.0;
            case DONE: return 100.0;
            case CANCELLED: return 0.0;
            default: return 0.0;
        }
    }

    /**
     * 获取工时完成率
     */
    public double getHoursCompletionRate() {
        if (this.estimatedHours == null || this.estimatedHours == 0) {
            return 0.0;
        }
        return (double) this.actualHours / this.estimatedHours * 100;
    }

    /**
     * 计算剩余工时
     */
    public int getRemainingHours() {
        if (this.estimatedHours == null) {
            return 0;
        }
        return Math.max(0, this.estimatedHours - this.actualHours);
    }

    /**
     * 添加标签
     */
    public void addLabel(String label) {
        this.labels.add(label);
    }

    /**
     * 移除标签
     */
    public void removeLabel(String label) {
        this.labels.remove(label);
    }

    /**
     * 记录工时
     */
    public void logHours(int hours) {
        this.actualHours += hours;
    }

    /**
     * 检查是否为子任务
     */
    public boolean isSubTask() {
        return this.parentTask != null;
    }

    /**
     * 检查是否有子任务
     */
    public boolean hasSubTasks() {
        return !this.subTasks.isEmpty();
    }

    /**
     * 获取子任务完成率
     */
    public double getSubTaskCompletionRate() {
        if (this.subTasks.isEmpty()) {
            return 100.0;
        }
        
        long completedSubTasks = this.subTasks.stream()
            .mapToInt(task -> task.isCompleted() ? 1 : 0)
            .sum();
        
        return (double) completedSubTasks / this.subTasks.size() * 100;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public Integer getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Integer getActualHours() {
        return actualHours;
    }

    public void setActualHours(Integer actualHours) {
        this.actualHours = actualHours;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public String getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(String acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Task getParentTask() {
        return parentTask;
    }

    public void setParentTask(Task parentTask) {
        this.parentTask = parentTask;
    }

    public List<Task> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<Task> subTasks) {
        this.subTasks = subTasks;
    }

    public Set<String> getLabels() {
        return labels;
    }

    public void setLabels(Set<String> labels) {
        this.labels = labels;
    }

    public List<TaskComment> getComments() {
        return comments;
    }

    public void setComments(List<TaskComment> comments) {
        this.comments = comments;
    }

    public List<TaskAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<TaskAttachment> attachments) {
        this.attachments = attachments;
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
}