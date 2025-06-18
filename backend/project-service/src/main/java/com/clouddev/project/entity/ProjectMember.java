package com.clouddev.project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ProjectMember实体类
 * 表示项目成员关系
 */
@Entity
@Table(name = "project_members", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column
    private LocalDateTime joinedAt;

    @Column
    private LocalDateTime leftAt;

    @Column
    private Long invitedBy;

    @Column
    private LocalDateTime invitedAt;

    @Column
    private String inviteMessage;

    @Column
    private LocalDateTime lastActiveAt;

    // 权限设置
    @Column
    private Boolean canRead = true;

    @Column
    private Boolean canWrite = false;

    @Column
    private Boolean canAdmin = false;

    @Column
    private Boolean canMaintain = false;

    // 通知设置
    @Column
    private Boolean emailNotification = true;

    @Column
    private Boolean pushNotification = true;

    @Column
    private Boolean webNotification = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 成员角色枚举
     */
    public enum MemberRole {
        OWNER,      // 所有者
        ADMIN,      // 管理员
        DEVELOPER,  // 开发者
        TESTER,     // 测试人员
        DESIGNER,   // 设计师
        VIEWER      // 观察者
    }

    /**
     * 成员状态枚举
     */
    public enum MemberStatus {
        ACTIVE,     // 活跃
        INACTIVE,   // 非活跃
        PENDING,    // 待加入
        LEFT        // 已离开
    }

    // 业务方法

    /**
     * 检查成员是否活跃
     */
    public boolean isActive() {
        return this.status == MemberStatus.ACTIVE;
    }

    /**
     * 检查是否为项目所有者
     */
    public boolean isOwner() {
        return this.role == MemberRole.OWNER;
    }

    /**
     * 检查是否为管理员或所有者
     */
    public boolean isAdminOrOwner() {
        return this.role == MemberRole.OWNER || this.role == MemberRole.ADMIN;
    }

    /**
     * 检查是否有读权限
     */
    public boolean hasReadPermission() {
        return this.canRead || isAdminOrOwner();
    }

    /**
     * 检查是否有写权限
     */
    public boolean hasWritePermission() {
        return this.canWrite || isAdminOrOwner();
    }

    /**
     * 检查是否有管理权限
     */
    public boolean hasAdminPermission() {
        return this.canAdmin || isOwner();
    }

    /**
     * 检查是否有维护权限
     */
    public boolean hasMaintainPermission() {
        return this.canMaintain || isAdminOrOwner();
    }

    /**
     * 接受邀请
     */
    public void acceptInvite() {
        this.status = MemberStatus.ACTIVE;
        this.joinedAt = LocalDateTime.now();
    }

    /**
     * 拒绝邀请
     */
    public void declineInvite() {
        this.status = MemberStatus.LEFT;
        this.leftAt = LocalDateTime.now();
    }

    /**
     * 离开项目
     */
    public void leave() {
        this.status = MemberStatus.LEFT;
        this.leftAt = LocalDateTime.now();
    }

    /**
     * 更新最后活跃时间
     */
    public void updateLastActive() {
        this.lastActiveAt = LocalDateTime.now();
    }

    /**
     * 设置权限
     */
    public void setPermissions(boolean read, boolean write, boolean admin, boolean maintain) {
        this.canRead = read;
        this.canWrite = write;
        this.canAdmin = admin;
        this.canMaintain = maintain;
    }

    /**
     * 根据角色设置默认权限
     */
    public void setDefaultPermissionsByRole() {
        switch (this.role) {
            case OWNER:
                setPermissions(true, true, true, true);
                break;
            case ADMIN:
                setPermissions(true, true, true, true);
                break;
            case DEVELOPER:
                setPermissions(true, true, false, false);
                break;
            case TESTER:
                setPermissions(true, true, false, false);
                break;
            case DESIGNER:
                setPermissions(true, true, false, false);
                break;
            case VIEWER:
                setPermissions(true, false, false, false);
                break;
        }
    }

    /**
     * 获取角色显示名称
     */
    public String getRoleDisplayName() {
        switch (this.role) {
            case OWNER: return "所有者";
            case ADMIN: return "管理员";
            case DEVELOPER: return "开发者";
            case TESTER: return "测试人员";
            case DESIGNER: return "设计师";
            case VIEWER: return "观察者";
            default: return "未知";
        }
    }

    /**
     * 检查是否可以执行某个操作
     */
    public boolean canPerformAction(String action) {
        switch (action.toLowerCase()) {
            case "read":
                return hasReadPermission();
            case "write":
            case "edit":
            case "create":
                return hasWritePermission();
            case "admin":
            case "manage":
                return hasAdminPermission();
            case "maintain":
            case "deploy":
                return hasMaintainPermission();
            default:
                return false;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
        // 设置角色时自动更新默认权限
        setDefaultPermissionsByRole();
    }

    public MemberStatus getStatus() {
        return status;
    }

    public void setStatus(MemberStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getLeftAt() {
        return leftAt;
    }

    public void setLeftAt(LocalDateTime leftAt) {
        this.leftAt = leftAt;
    }

    public Long getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(Long invitedBy) {
        this.invitedBy = invitedBy;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public String getInviteMessage() {
        return inviteMessage;
    }

    public void setInviteMessage(String inviteMessage) {
        this.inviteMessage = inviteMessage;
    }

    public LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(LocalDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public Boolean getCanRead() {
        return canRead;
    }

    public void setCanRead(Boolean canRead) {
        this.canRead = canRead;
    }

    public Boolean getCanWrite() {
        return canWrite;
    }

    public void setCanWrite(Boolean canWrite) {
        this.canWrite = canWrite;
    }

    public Boolean getCanAdmin() {
        return canAdmin;
    }

    public void setCanAdmin(Boolean canAdmin) {
        this.canAdmin = canAdmin;
    }

    public Boolean getCanMaintain() {
        return canMaintain;
    }

    public void setCanMaintain(Boolean canMaintain) {
        this.canMaintain = canMaintain;
    }

    public Boolean getEmailNotification() {
        return emailNotification;
    }

    public void setEmailNotification(Boolean emailNotification) {
        this.emailNotification = emailNotification;
    }

    public Boolean getPushNotification() {
        return pushNotification;
    }

    public void setPushNotification(Boolean pushNotification) {
        this.pushNotification = pushNotification;
    }

    public Boolean getWebNotification() {
        return webNotification;
    }

    public void setWebNotification(Boolean webNotification) {
        this.webNotification = webNotification;
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