package com.clouddev.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户登录历史实体类
 */
@Entity
@Table(name = "user_login_history", indexes = {
    @Index(name = "idx_login_user_id", columnList = "user_id"),
    @Index(name = "idx_login_time", columnList = "loginTime"),
    @Index(name = "idx_login_success", columnList = "success"),
    @Index(name = "idx_login_ip", columnList = "ipAddress")
})
@EntityListeners(AuditingEntityListener.class)
public class UserLoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 45, message = "IP地址长度不能超过45个字符")
    @Column(length = 45)
    private String ipAddress;

    @Size(max = 500, message = "用户代理长度不能超过500个字符")
    @Column(length = 500)
    private String userAgent;

    @Size(max = 100, message = "位置信息长度不能超过100个字符")
    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserSession.DeviceType deviceType = UserSession.DeviceType.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(nullable = false)
    private Boolean success;

    @Size(max = 200, message = "失败原因长度不能超过200个字符")
    @Column(length = 200)
    private String failureReason;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime loginTime;

    // 构造函数
    public UserLoginHistory() {}

    public UserLoginHistory(User user, String ipAddress, String userAgent, Boolean success) {
        this.user = user;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.success = success;
    }

    public UserLoginHistory(User user, String ipAddress, String userAgent, 
                           Boolean success, String failureReason) {
        this.user = user;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.success = success;
        this.failureReason = failureReason;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public UserSession.DeviceType getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(UserSession.DeviceType deviceType) {
        this.deviceType = deviceType;
    }

    public AuthProvider getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserLoginHistory)) return false;
        UserLoginHistory that = (UserLoginHistory) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "UserLoginHistory{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", ipAddress='" + ipAddress + '\'' +
                ", authProvider=" + authProvider +
                ", success=" + success +
                ", loginTime=" + loginTime +
                '}';
    }
}