package com.clouddev.auth.repository;

import com.clouddev.auth.entity.UserSession;
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
 * 用户会话数据访问层
 */
@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    /**
     * 根据会话令牌查找会话
     */
    Optional<UserSession> findBySessionToken(String sessionToken);

    /**
     * 根据刷新令牌查找会话
     */
    Optional<UserSession> findByRefreshToken(String refreshToken);

    /**
     * 查找用户的所有活跃会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.active = true")
    List<UserSession> findActiveSessionsByUserId(@Param("userId") UUID userId);

    /**
     * 查找用户的所有会话（包括非活跃的）
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId ORDER BY s.lastAccessedAt DESC")
    Page<UserSession> findSessionsByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 查找已过期的会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.expiresAt < :now OR s.refreshExpiresAt < :now")
    List<UserSession> findExpiredSessions(@Param("now") LocalDateTime now);

    /**
     * 查找需要清理的非活跃会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.active = false OR s.lastAccessedAt < :cutoffTime")
    List<UserSession> findInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * 统计用户的活跃会话数量
     */
    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user.id = :userId AND s.active = true")
    long countActiveSessionsByUserId(@Param("userId") UUID userId);

    /**
     * 使所有用户会话失效
     */
    @Modifying
    @Query("UPDATE UserSession s SET s.active = false WHERE s.user.id = :userId")
    void invalidateAllUserSessions(@Param("userId") UUID userId);

    /**
     * 使特定会话失效
     */
    @Modifying
    @Query("UPDATE UserSession s SET s.active = false WHERE s.id = :sessionId")
    void invalidateSession(@Param("sessionId") UUID sessionId);

    /**
     * 更新会话最后访问时间
     */
    @Modifying
    @Query("UPDATE UserSession s SET s.lastAccessedAt = :lastAccessedAt WHERE s.sessionToken = :sessionToken")
    void updateLastAccessedTime(@Param("sessionToken") String sessionToken, 
                               @Param("lastAccessedAt") LocalDateTime lastAccessedAt);

    /**
     * 删除过期的会话
     */
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now OR s.refreshExpiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);

    /**
     * 删除非活跃的会话
     */
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.active = false")
    void deleteInactiveSessions();

    /**
     * 查找用户在指定时间后的会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.createdAt >= :since")
    List<UserSession> findUserSessionsSince(@Param("userId") UUID userId, @Param("since") LocalDateTime since);

    /**
     * 根据IP地址查找会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.ipAddress = :ipAddress AND s.active = true")
    List<UserSession> findActiveSessionsByIpAddress(@Param("ipAddress") String ipAddress);

    /**
     * 根据设备类型统计会话
     */
    @Query("SELECT s.deviceType, COUNT(s) FROM UserSession s WHERE s.active = true GROUP BY s.deviceType")
    List<Object[]> countActiveSessionsByDeviceType();

    /**
     * 查找最近活跃的会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.lastAccessedAt >= :since AND s.active = true ORDER BY s.lastAccessedAt DESC")
    List<UserSession> findRecentlyActiveSessions(@Param("since") LocalDateTime since);

    /**
     * 统计总的活跃会话数
     */
    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.active = true")
    long countActiveSessions();

    /**
     * 查找长时间未访问的活跃会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.lastAccessedAt < :cutoffTime AND s.active = true")
    List<UserSession> findStaleActiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * 查找用户的最新会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId ORDER BY s.lastAccessedAt DESC")
    Optional<UserSession> findLatestSessionByUserId(@Param("userId") UUID userId);

    /**
     * 按位置统计活跃会话
     */
    @Query("SELECT s.location, COUNT(s) FROM UserSession s WHERE s.active = true AND s.location IS NOT NULL GROUP BY s.location")
    List<Object[]> countActiveSessionsByLocation();

    /**
     * 查找用户的当前会话（最近访问的活跃会话）
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.active = true ORDER BY s.lastAccessedAt DESC")
    Optional<UserSession> findCurrentUserSession(@Param("userId") UUID userId);
}