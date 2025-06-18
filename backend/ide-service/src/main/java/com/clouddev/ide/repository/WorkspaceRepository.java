package com.clouddev.ide.repository;

import com.clouddev.ide.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 工作空间数据访问层
 */
@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace, String> {

    /**
     * 根据项目ID查找工作空间
     */
    List<Workspace> findByProjectId(String projectId);

    /**
     * 根据用户ID查找工作空间
     */
    List<Workspace> findByUserId(String userId);

    /**
     * 根据用户ID和项目ID查找工作空间
     */
    Optional<Workspace> findByUserIdAndProjectId(String userId, String projectId);

    /**
     * 查找用户参与的所有工作空间（包括协作的）
     */
    @Query("{'$or': [{'userId': ?0}, {'collaborators': ?0}]}")
    List<Workspace> findByUserIdOrCollaboratorsContaining(String userId);

    /**
     * 分页查找用户的工作空间
     */
    Page<Workspace> findByUserId(String userId, Pageable pageable);

    /**
     * 根据状态查找工作空间
     */
    List<Workspace> findByStatus(Workspace.WorkspaceStatus status);

    /**
     * 查找运行中的工作空间
     */
    @Query("{'status': 'RUNNING'}")
    List<Workspace> findRunningWorkspaces();

    /**
     * 查找需要清理的工作空间（长时间未访问）
     */
    @Query("{'lastAccessedAt': {'$lt': ?0}, 'status': {'$ne': 'RUNNING'}}")
    List<Workspace> findInactiveWorkspaces(LocalDateTime cutoffTime);

    /**
     * 根据容器ID查找工作空间
     */
    Optional<Workspace> findByContainerId(String containerId);

    /**
     * 根据语言查找工作空间
     */
    List<Workspace> findByLanguage(String language);

    /**
     * 根据框架查找工作空间
     */
    List<Workspace> findByFramework(String framework);

    /**
     * 查找最近访问的工作空间
     */
    @Query("{'userId': ?0}")
    List<Workspace> findByUserIdOrderByLastAccessedAtDesc(String userId);

    /**
     * 搜索工作空间（按名称）
     */
    @Query("{'userId': ?0, 'name': {'$regex': ?1, '$options': 'i'}}")
    List<Workspace> findByUserIdAndNameContainingIgnoreCase(String userId, String name);

    /**
     * 统计用户的工作空间数量
     */
    long countByUserId(String userId);

    /**
     * 统计项目的工作空间数量
     */
    long countByProjectId(String projectId);

    /**
     * 查找指定时间后创建的工作空间
     */
    @Query("{'createdAt': {'$gte': ?0}}")
    List<Workspace> findCreatedAfter(LocalDateTime since);

    /**
     * 查找指定时间后访问的工作空间
     */
    @Query("{'lastAccessedAt': {'$gte': ?0}}")
    List<Workspace> findAccessedAfter(LocalDateTime since);

    /**
     * 按语言统计工作空间数量
     */
    @Query(value = "{}", fields = "{'language': 1}")
    List<Workspace> findAllLanguages();

    /**
     * 查找共享工作空间
     */
    @Query("{'collaborators': {'$exists': true, '$not': {'$size': 0}}}")
    List<Workspace> findSharedWorkspaces();

    /**
     * 查找用户在指定项目中的工作空间
     */
    @Query("{'userId': ?0, 'projectId': {'$in': ?1}}")
    List<Workspace> findByUserIdAndProjectIdIn(String userId, List<String> projectIds);

    /**
     * 删除用户的所有工作空间
     */
    void deleteByUserId(String userId);

    /**
     * 删除项目的所有工作空间
     */
    void deleteByProjectId(String projectId);
}