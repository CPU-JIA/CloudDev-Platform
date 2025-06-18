package com.clouddev.auth.repository;

import com.clouddev.auth.entity.AuthProvider;
import com.clouddev.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 用户数据访问层
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);

    /**
     * 根据用户名或邮箱查找用户
     */
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    /**
     * 根据认证提供商和提供商ID查找用户
     */
    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 查找启用的用户
     */
    @Query("SELECT u FROM User u WHERE u.enabled = true")
    Page<User> findEnabledUsers(Pageable pageable);

    /**
     * 根据角色查找用户
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    /**
     * 查找需要邮箱验证的用户
     */
    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.enabled = true")
    List<User> findUnverifiedUsers();

    /**
     * 查找被锁定的用户
     */
    @Query("SELECT u FROM User u WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil > :now")
    List<User> findLockedUsers(@Param("now") LocalDateTime now);

    /**
     * 查找最近登录的用户
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt >= :since ORDER BY u.lastLoginAt DESC")
    List<User> findRecentlyLoggedInUsers(@Param("since") LocalDateTime since);

    /**
     * 统计活跃用户数
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLoginAt >= :since AND u.enabled = true")
    long countActiveUsers(@Param("since") LocalDateTime since);

    /**
     * 重置失败登录次数
     */
    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.lockedUntil = null WHERE u.id = :userId")
    void resetFailedLoginAttempts(@Param("userId") UUID userId);

    /**
     * 增加失败登录次数
     */
    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :userId")
    void incrementFailedLoginAttempts(@Param("userId") UUID userId);

    /**
     * 锁定用户账户
     */
    @Modifying
    @Query("UPDATE User u SET u.lockedUntil = :lockedUntil WHERE u.id = :userId")
    void lockUser(@Param("userId") UUID userId, @Param("lockedUntil") LocalDateTime lockedUntil);

    /**
     * 更新用户最后登录信息
     */
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime, u.lastLoginIp = :ip, u.lastLoginUserAgent = :userAgent WHERE u.id = :userId")
    void updateLastLoginInfo(@Param("userId") UUID userId, 
                           @Param("loginTime") LocalDateTime loginTime,
                           @Param("ip") String ip, 
                           @Param("userAgent") String userAgent);

    /**
     * 验证用户邮箱
     */
    @Modifying
    @Query("UPDATE User u SET u.emailVerified = true WHERE u.id = :userId")
    void verifyUserEmail(@Param("userId") UUID userId);

    /**
     * 更新用户密码
     */
    @Modifying
    @Query("UPDATE User u SET u.password = :password WHERE u.id = :userId")
    void updatePassword(@Param("userId") UUID userId, @Param("password") String password);

    /**
     * 查找即将过期的账户（用于清理）
     */
    @Query("SELECT u FROM User u WHERE u.enabled = false AND u.createdAt < :expiredBefore")
    List<User> findExpiredAccounts(@Param("expiredBefore") LocalDateTime expiredBefore);

    /**
     * 搜索用户（按用户名、邮箱、姓名）
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    /**
     * 按认证提供商统计用户数
     */
    @Query("SELECT u.provider, COUNT(u) FROM User u GROUP BY u.provider")
    List<Object[]> countUsersByProvider();

    /**
     * 查找活跃用户（最近30天有登录）
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt >= :thirtyDaysAgo AND u.enabled = true")
    Page<User> findActiveUsers(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo, Pageable pageable);
}