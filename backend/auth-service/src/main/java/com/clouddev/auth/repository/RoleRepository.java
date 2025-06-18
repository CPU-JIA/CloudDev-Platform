package com.clouddev.auth.repository;

import com.clouddev.auth.entity.Role;
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
 * 角色数据访问层
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    /**
     * 根据角色名查找角色
     */
    Optional<Role> findByName(String name);

    /**
     * 检查角色名是否存在
     */
    boolean existsByName(String name);

    /**
     * 查找启用的角色
     */
    @Query("SELECT r FROM Role r WHERE r.enabled = true")
    List<Role> findEnabledRoles();

    /**
     * 根据角色类型查找角色
     */
    @Query("SELECT r FROM Role r WHERE r.type = :type")
    List<Role> findByType(@Param("type") Role.RoleType type);

    /**
     * 查找系统角色
     */
    @Query("SELECT r FROM Role r WHERE r.type = 'SYSTEM'")
    List<Role> findSystemRoles();

    /**
     * 查找内置角色
     */
    @Query("SELECT r FROM Role r WHERE r.type = 'BUILT_IN'")
    List<Role> findBuiltInRoles();

    /**
     * 查找自定义角色
     */
    @Query("SELECT r FROM Role r WHERE r.type = 'CUSTOM'")
    List<Role> findCustomRoles();

    /**
     * 根据用户ID查找角色
     */
    @Query("SELECT r FROM Role r JOIN r.users u WHERE u.id = :userId")
    List<Role> findByUserId(@Param("userId") UUID userId);

    /**
     * 查找具有特定权限的角色
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.name = :permissionName")
    List<Role> findByPermissionName(@Param("permissionName") String permissionName);

    /**
     * 搜索角色（按名称、描述）
     */
    @Query("SELECT r FROM Role r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Role> searchRoles(@Param("search") String search, Pageable pageable);

    /**
     * 统计每个角色的用户数量
     */
    @Query("SELECT r.name, COUNT(u) FROM Role r LEFT JOIN r.users u GROUP BY r.id, r.name")
    List<Object[]> countUsersByRole();

    /**
     * 查找没有用户的角色
     */
    @Query("SELECT r FROM Role r WHERE r.users IS EMPTY")
    List<Role> findRolesWithoutUsers();

    /**
     * 查找角色的权限数量
     */
    @Query("SELECT COUNT(p) FROM Role r JOIN r.permissions p WHERE r.id = :roleId")
    long countPermissionsByRoleId(@Param("roleId") UUID roleId);

    /**
     * 查找可删除的角色（非系统角色且非内置角色）
     */
    @Query("SELECT r FROM Role r WHERE r.type = 'CUSTOM'")
    List<Role> findDeletableRoles();

    /**
     * 根据权限ID查找角色
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.id = :permissionId")
    List<Role> findByPermissionId(@Param("permissionId") UUID permissionId);
}