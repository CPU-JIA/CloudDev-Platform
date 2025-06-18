package com.clouddev.auth.repository;

import com.clouddev.auth.entity.Permission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 权限数据访问层
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    /**
     * 根据权限名查找权限
     */
    Optional<Permission> findByName(String name);

    /**
     * 根据资源和动作查找权限
     */
    Optional<Permission> findByResourceAndAction(String resource, String action);

    /**
     * 检查权限名是否存在
     */
    boolean existsByName(String name);

    /**
     * 检查资源和动作组合是否存在
     */
    boolean existsByResourceAndAction(String resource, String action);

    /**
     * 查找启用的权限
     */
    @Query("SELECT p FROM Permission p WHERE p.enabled = true")
    List<Permission> findEnabledPermissions();

    /**
     * 根据权限类型查找权限
     */
    @Query("SELECT p FROM Permission p WHERE p.type = :type")
    List<Permission> findByType(@Param("type") Permission.PermissionType type);

    /**
     * 根据资源查找权限
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = :resource")
    List<Permission> findByResource(@Param("resource") String resource);

    /**
     * 根据动作查找权限
     */
    @Query("SELECT p FROM Permission p WHERE p.action = :action")
    List<Permission> findByAction(@Param("action") String action);

    /**
     * 根据用户ID查找权限
     */
    @Query("SELECT DISTINCT p FROM Permission p JOIN p.roles r JOIN r.users u WHERE u.id = :userId")
    List<Permission> findByUserId(@Param("userId") UUID userId);

    /**
     * 根据角色ID查找权限
     */
    @Query("SELECT p FROM Permission p JOIN p.roles r WHERE r.id = :roleId")
    List<Permission> findByRoleId(@Param("roleId") UUID roleId);

    /**
     * 查找系统权限
     */
    @Query("SELECT p FROM Permission p WHERE p.type = 'SYSTEM'")
    List<Permission> findSystemPermissions();

    /**
     * 查找内置权限
     */
    @Query("SELECT p FROM Permission p WHERE p.type = 'BUILT_IN'")
    List<Permission> findBuiltInPermissions();

    /**
     * 查找自定义权限
     */
    @Query("SELECT p FROM Permission p WHERE p.type = 'CUSTOM'")
    List<Permission> findCustomPermissions();

    /**
     * 搜索权限（按名称、描述、资源、动作）
     */
    @Query("SELECT p FROM Permission p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.resource) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.action) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Permission> searchPermissions(@Param("search") String search, Pageable pageable);

    /**
     * 统计每个权限被多少角色使用
     */
    @Query("SELECT p.name, COUNT(r) FROM Permission p LEFT JOIN p.roles r GROUP BY p.id, p.name")
    List<Object[]> countRolesByPermission();

    /**
     * 查找没有被任何角色使用的权限
     */
    @Query("SELECT p FROM Permission p WHERE p.roles IS EMPTY")
    List<Permission> findUnusedPermissions();

    /**
     * 查找可删除的权限（非系统权限且非内置权限）
     */
    @Query("SELECT p FROM Permission p WHERE p.type = 'CUSTOM'")
    List<Permission> findDeletablePermissions();

    /**
     * 按资源分组统计权限数量
     */
    @Query("SELECT p.resource, COUNT(p) FROM Permission p GROUP BY p.resource")
    List<Object[]> countPermissionsByResource();

    /**
     * 按动作分组统计权限数量
     */
    @Query("SELECT p.action, COUNT(p) FROM Permission p GROUP BY p.action")
    List<Object[]> countPermissionsByAction();

    /**
     * 查找特定用户的特定资源权限
     */
    @Query("SELECT DISTINCT p FROM Permission p " +
           "JOIN p.roles r " +
           "JOIN r.users u " +
           "WHERE u.id = :userId AND p.resource = :resource")
    List<Permission> findUserPermissionsForResource(@Param("userId") UUID userId, @Param("resource") String resource);

    /**
     * 检查用户是否有特定权限
     */
    @Query("SELECT COUNT(p) > 0 FROM Permission p " +
           "JOIN p.roles r " +
           "JOIN r.users u " +
           "WHERE u.id = :userId AND p.resource = :resource AND p.action = :action")
    boolean hasUserPermission(@Param("userId") UUID userId, 
                             @Param("resource") String resource, 
                             @Param("action") String action);

    /**
     * 获取所有资源列表
     */
    @Query("SELECT DISTINCT p.resource FROM Permission p ORDER BY p.resource")
    List<String> findAllResources();

    /**
     * 获取所有动作列表
     */
    @Query("SELECT DISTINCT p.action FROM Permission p ORDER BY p.action")
    List<String> findAllActions();
}