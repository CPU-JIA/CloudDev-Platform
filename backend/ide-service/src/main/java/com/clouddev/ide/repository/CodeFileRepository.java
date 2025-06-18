package com.clouddev.ide.repository;

import com.clouddev.ide.entity.CodeFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 代码文件数据访问层
 */
@Repository
public interface CodeFileRepository extends MongoRepository<CodeFile, String> {

    /**
     * 根据工作空间ID查找所有文件
     */
    List<CodeFile> findByWorkspaceId(String workspaceId);

    /**
     * 根据工作空间ID分页查找文件
     */
    Page<CodeFile> findByWorkspaceId(String workspaceId, Pageable pageable);

    /**
     * 根据工作空间ID和路径查找文件
     */
    Optional<CodeFile> findByWorkspaceIdAndPath(String workspaceId, String path);

    /**
     * 根据工作空间ID和文件名查找文件
     */
    List<CodeFile> findByWorkspaceIdAndName(String workspaceId, String name);

    /**
     * 根据语言查找文件
     */
    List<CodeFile> findByWorkspaceIdAndLanguage(String workspaceId, String language);

    /**
     * 搜索文件内容
     */
    @Query("{'workspaceId': ?0, 'content': {'$regex': ?1, '$options': 'i'}}")
    List<CodeFile> searchFileContent(String workspaceId, String searchText);

    /**
     * 搜索文件名
     */
    @Query("{'workspaceId': ?0, 'name': {'$regex': ?1, '$options': 'i'}}")
    List<CodeFile> searchFileName(String workspaceId, String fileName);

    /**
     * 根据路径前缀查找文件（目录下的文件）
     */
    @Query("{'workspaceId': ?0, 'path': {'$regex': '^?1'}}")
    List<CodeFile> findByWorkspaceIdAndPathStartingWith(String workspaceId, String pathPrefix);

    /**
     * 查找最近修改的文件
     */
    @Query("{'workspaceId': ?0}")
    List<CodeFile> findByWorkspaceIdOrderByUpdatedAtDesc(String workspaceId);

    /**
     * 查找二进制文件
     */
    List<CodeFile> findByWorkspaceIdAndIsBinaryTrue(String workspaceId);

    /**
     * 查找只读文件
     */
    List<CodeFile> findByWorkspaceIdAndIsReadonlyTrue(String workspaceId);

    /**
     * 根据文件大小范围查找
     */
    @Query("{'workspaceId': ?0, 'size': {'$gte': ?1, '$lte': ?2}}")
    List<CodeFile> findByWorkspaceIdAndSizeBetween(String workspaceId, long minSize, long maxSize);

    /**
     * 查找指定时间后修改的文件
     */
    @Query("{'workspaceId': ?0, 'updatedAt': {'$gte': ?1}}")
    List<CodeFile> findByWorkspaceIdAndUpdatedAtAfter(String workspaceId, LocalDateTime since);

    /**
     * 查找特定用户最后修改的文件
     */
    List<CodeFile> findByWorkspaceIdAndLastModifiedBy(String workspaceId, String userId);

    /**
     * 查找有协作者的文件
     */
    @Query("{'workspaceId': ?0, 'collaborators': {'$exists': true, '$not': {'$size': 0}}}")
    List<CodeFile> findCollaborativeFiles(String workspaceId);

    /**
     * 查找用户正在协作的文件
     */
    @Query("{'workspaceId': ?0, 'collaborators': ?1}")
    List<CodeFile> findByWorkspaceIdAndCollaboratorsContaining(String workspaceId, String userId);

    /**
     * 按语言统计文件数量
     */
    @Query(value = "{'workspaceId': ?0}", fields = "{'language': 1}")
    List<CodeFile> findLanguagesByWorkspaceId(String workspaceId);

    /**
     * 统计工作空间中的文件数量
     */
    long countByWorkspaceId(String workspaceId);

    /**
     * 统计指定语言的文件数量
     */
    long countByWorkspaceIdAndLanguage(String workspaceId, String language);

    /**
     * 计算工作空间的总文件大小
     */
    @Query(value = "{'workspaceId': ?0}", fields = "{'size': 1}")
    List<CodeFile> findSizesByWorkspaceId(String workspaceId);

    /**
     * 查找空文件
     */
    @Query("{'workspaceId': ?0, '$or': [{'content': null}, {'content': ''}, {'size': 0}]}")
    List<CodeFile> findEmptyFiles(String workspaceId);

    /**
     * 查找大文件
     */
    @Query("{'workspaceId': ?0, 'size': {'$gt': ?1}}")
    List<CodeFile> findLargeFiles(String workspaceId, long sizeThreshold);

    /**
     * 根据MIME类型查找文件
     */
    List<CodeFile> findByWorkspaceIdAndMimeType(String workspaceId, String mimeType);

    /**
     * 查找特定版本的文件
     */
    @Query("{'workspaceId': ?0, 'version': {'$gte': ?1}}")
    List<CodeFile> findByWorkspaceIdAndVersionGreaterThanEqual(String workspaceId, long version);

    /**
     * 删除工作空间的所有文件
     */
    void deleteByWorkspaceId(String workspaceId);

    /**
     * 根据路径前缀删除文件（删除目录）
     */
    @Query(value = "{'workspaceId': ?0, 'path': {'$regex': '^?1'}}", delete = true)
    void deleteByWorkspaceIdAndPathStartingWith(String workspaceId, String pathPrefix);
}