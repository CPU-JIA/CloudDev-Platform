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
 * Project实体类
 * 表示项目基本信息
 */
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 1000)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectVisibility visibility = ProjectVisibility.PRIVATE;

    @Column(nullable = false)
    private Long ownerId;

    @Column(length = 200)
    private String repositoryUrl;

    @Column(length = 50)
    private String defaultBranch = "main";

    // 项目配置
    @Column
    private Boolean issueEnabled = true;

    @Column
    private Boolean wikiEnabled = true;

    @Column
    private Boolean cicdEnabled = true;

    @Column
    private Boolean containerRegistryEnabled = false;

    // 项目统计
    @Column
    private Integer memberCount = 0;

    @Column
    private Integer taskCount = 0;

    @Column
    private Integer completedTaskCount = 0;

    @Column
    private Integer commitCount = 0;

    @Column
    private Integer releaseCount = 0;

    @Column
    private Long storageUsed = 0L; // 字节

    @Column
    private Long storageLimit = 1073741824L; // 1GB 默认限制

    // 时间字段
    @Column
    private LocalDateTime lastActivityAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 关联关系
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProjectMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProjectActivity> activities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_tags", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    /**
     * 项目状态枚举
     */
    public enum ProjectStatus {
        ACTIVE,     // 活跃
        ARCHIVED,   // 归档
        SUSPENDED   // 暂停
    }

    /**
     * 项目可见性枚举
     */
    public enum ProjectVisibility {
        PUBLIC,     // 公开
        INTERNAL,   // 内部
        PRIVATE     // 私有
    }

    // 业务方法

    /**
     * 检查是否为项目所有者
     */
    public boolean isOwner(Long userId) {
        return this.ownerId.equals(userId);
    }

    /**
     * 检查用户是否为项目成员
     */
    public boolean isMember(Long userId) {
        return this.members.stream()
            .anyMatch(member -> member.getUserId().equals(userId) && member.isActive());
    }

    /**
     * 获取用户在项目中的角色
     */
    public ProjectMember.MemberRole getUserRole(Long userId) {
        if (isOwner(userId)) {
            return ProjectMember.MemberRole.OWNER;
        }
        
        return this.members.stream()
            .filter(member -> member.getUserId().equals(userId) && member.isActive())
            .map(ProjectMember::getRole)
            .findFirst()
            .orElse(null);
    }

    /**
     * 更新最后活动时间
     */
    public void updateLastActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }

    /**
     * 增加任务数量
     */
    public void incrementTaskCount() {
        this.taskCount++;
    }

    /**
     * 减少任务数量
     */
    public void decrementTaskCount() {
        if (this.taskCount > 0) {
            this.taskCount--;
        }
    }

    /**
     * 增加完成任务数量
     */
    public void incrementCompletedTaskCount() {
        this.completedTaskCount++;
    }

    /**
     * 减少完成任务数量
     */
    public void decrementCompletedTaskCount() {
        if (this.completedTaskCount > 0) {
            this.completedTaskCount--;
        }
    }

    /**
     * 计算任务完成率
     */
    public double getTaskCompletionRate() {
        if (this.taskCount == 0) {
            return 0.0;
        }
        return (double) this.completedTaskCount / this.taskCount * 100;
    }

    /**
     * 增加成员数量
     */
    public void incrementMemberCount() {
        this.memberCount++;
    }

    /**
     * 减少成员数量
     */
    public void decrementMemberCount() {
        if (this.memberCount > 0) {
            this.memberCount--;
        }
    }

    /**
     * 增加存储使用量
     */
    public void addStorageUsage(Long bytes) {
        this.storageUsed += bytes;
    }

    /**
     * 减少存储使用量
     */
    public void reduceStorageUsage(Long bytes) {
        this.storageUsed = Math.max(0, this.storageUsed - bytes);
    }

    /**
     * 检查存储是否超限
     */
    public boolean isStorageExceeded() {
        return this.storageUsed > this.storageLimit;
    }

    /**
     * 获取存储使用率
     */
    public double getStorageUsageRate() {
        if (this.storageLimit == 0) {
            return 0.0;
        }
        return (double) this.storageUsed / this.storageLimit * 100;
    }

    /**
     * 添加标签
     */
    public void addTag(String tag) {
        this.tags.add(tag);
    }

    /**
     * 移除标签
     */
    public void removeTag(String tag) {
        this.tags.remove(tag);
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

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public ProjectVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(ProjectVisibility visibility) {
        this.visibility = visibility;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public Boolean getIssueEnabled() {
        return issueEnabled;
    }

    public void setIssueEnabled(Boolean issueEnabled) {
        this.issueEnabled = issueEnabled;
    }

    public Boolean getWikiEnabled() {
        return wikiEnabled;
    }

    public void setWikiEnabled(Boolean wikiEnabled) {
        this.wikiEnabled = wikiEnabled;
    }

    public Boolean getCicdEnabled() {
        return cicdEnabled;
    }

    public void setCicdEnabled(Boolean cicdEnabled) {
        this.cicdEnabled = cicdEnabled;
    }

    public Boolean getContainerRegistryEnabled() {
        return containerRegistryEnabled;
    }

    public void setContainerRegistryEnabled(Boolean containerRegistryEnabled) {
        this.containerRegistryEnabled = containerRegistryEnabled;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public Integer getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(Integer taskCount) {
        this.taskCount = taskCount;
    }

    public Integer getCompletedTaskCount() {
        return completedTaskCount;
    }

    public void setCompletedTaskCount(Integer completedTaskCount) {
        this.completedTaskCount = completedTaskCount;
    }

    public Integer getCommitCount() {
        return commitCount;
    }

    public void setCommitCount(Integer commitCount) {
        this.commitCount = commitCount;
    }

    public Integer getReleaseCount() {
        return releaseCount;
    }

    public void setReleaseCount(Integer releaseCount) {
        this.releaseCount = releaseCount;
    }

    public Long getStorageUsed() {
        return storageUsed;
    }

    public void setStorageUsed(Long storageUsed) {
        this.storageUsed = storageUsed;
    }

    public Long getStorageLimit() {
        return storageLimit;
    }

    public void setStorageLimit(Long storageLimit) {
        this.storageLimit = storageLimit;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
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

    public List<ProjectMember> getMembers() {
        return members;
    }

    public void setMembers(List<ProjectMember> members) {
        this.members = members;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public List<ProjectActivity> getActivities() {
        return activities;
    }

    public void setActivities(List<ProjectActivity> activities) {
        this.activities = activities;
    }

    public Set<String> getTags() {
        return tags;
    }

    public void setTags(Set<String> tags) {
        this.tags = tags;
    }
}