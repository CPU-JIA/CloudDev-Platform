package com.clouddev.ide.repository;

import com.clouddev.ide.entity.CollaborationSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 协作会话数据访问层
 */
@Repository
public interface CollaborationSessionRepository extends MongoRepository<CollaborationSession, String> {

    /**
     * 根据工作空间ID查找协作会话
     */
    List<CollaborationSession> findByWorkspaceId(String workspaceId);

    /**
     * 根据文件ID查找协作会话
     */
    Optional<CollaborationSession> findByFileId(String fileId);

    /**
     * 根据工作空间ID和文件ID查找协作会话
     */
    Optional<CollaborationSession> findByWorkspaceIdAndFileId(String workspaceId, String fileId);

    /**
     * 查找活跃的协作会话
     */
    List<CollaborationSession> findByStatus(CollaborationSession.SessionStatus status);

    /**
     * 查找用户参与的协作会话
     */
    @Query("{'participants.?0': {'$exists': true}}")
    List<CollaborationSession> findByParticipantsContaining(String userId);

    /**
     * 查找工作空间中活跃的协作会话
     */
    @Query("{'workspaceId': ?0, 'status': 'ACTIVE'}")
    List<CollaborationSession> findActiveSessionsByWorkspaceId(String workspaceId);

    /**
     * 查找长时间未活跃的会话
     */
    @Query("{'lastActivityAt': {'$lt': ?0}, 'status': 'ACTIVE'}")
    List<CollaborationSession> findInactiveSessions(LocalDateTime cutoffTime);

    /**
     * 查找指定时间后有活动的会话
     */
    @Query("{'lastActivityAt': {'$gte': ?0}}")
    List<CollaborationSession> findSessionsActiveAfter(LocalDateTime since);

    /**
     * 统计工作空间的活跃协作会话数
     */
    @Query(value = "{'workspaceId': ?0, 'status': 'ACTIVE'}", count = true)
    long countActiveSessionsByWorkspaceId(String workspaceId);

    /**
     * 统计用户参与的协作会话数
     */
    @Query(value = "{'participants.?0': {'$exists': true}}", count = true)
    long countSessionsByParticipant(String userId);

    /**
     * 删除工作空间的所有协作会话
     */
    void deleteByWorkspaceId(String workspaceId);

    /**
     * 删除指定状态的会话
     */
    void deleteByStatus(CollaborationSession.SessionStatus status);

    /**
     * 查找单人会话（只有一个参与者）
     */
    @Query("{'$expr': {'$eq': [{'$size': {'$objectToArray': '$participants'}}, 1]}}")
    List<CollaborationSession> findSingleParticipantSessions();

    /**
     * 查找多人协作会话
     */
    @Query("{'$expr': {'$gt': [{'$size': {'$objectToArray': '$participants'}}, 1]}}")
    List<CollaborationSession> findMultiParticipantSessions();

    /**
     * 查找有大量操作的会话
     */
    @Query("{'$expr': {'$gt': [{'$size': '$operations'}, ?0]}}")
    List<CollaborationSession> findSessionsWithManyOperations(int operationThreshold);

    /**
     * 根据创建时间范围查找会话
     */
    @Query("{'createdAt': {'$gte': ?0, '$lte': ?1}}")
    List<CollaborationSession> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}