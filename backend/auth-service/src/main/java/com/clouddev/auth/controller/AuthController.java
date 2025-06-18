package com.clouddev.auth.controller;

import com.clouddev.auth.dto.request.LoginRequest;
import com.clouddev.auth.dto.request.RegisterRequest;
import com.clouddev.auth.dto.request.UpdateProfileRequest;
import com.clouddev.auth.dto.response.AuthResponse;
import com.clouddev.auth.dto.response.UserResponse;
import com.clouddev.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 认证控制器
 * 处理用户认证、注册、登录等操作
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "认证管理", description = "用户认证、注册、登录等API")
@Validated
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "注册新用户账户")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "注册成功"),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "409", description = "用户名或邮箱已存在")
    })
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request) {
        
        logger.info("User registration request: {}", request.getUsername());

        // 验证密码确认
        if (!request.isPasswordMatching()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "两次输入的密码不一致");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        UserResponse userResponse = userService.registerUser(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "注册成功，请查收邮箱验证邮件");
        response.put("user", userResponse);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户账户登录")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "登录成功"),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "401", description = "用户名或密码错误"),
        @ApiResponse(responseCode = "423", description = "账户已被锁定")
    })
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        
        logger.info("User login request: {}", request.getUsername());
        
        AuthResponse authResponse = userService.authenticateUser(request, httpRequest);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * 刷新访问令牌
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新的访问令牌")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "刷新成功"),
        @ApiResponse(responseCode = "401", description = "刷新令牌无效或已过期")
    })
    public ResponseEntity<AuthResponse> refreshToken(
            @RequestBody Map<String, String> request) {
        
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        AuthResponse authResponse = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户账户登出")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestBody(required = false) Map<String, String> request) {
        
        String refreshToken = null;
        if (request != null) {
            refreshToken = request.get("refreshToken");
        }

        userService.logout(refreshToken);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "已安全退出");

        return ResponseEntity.ok(response);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    @Operation(summary = "获取当前用户", description = "获取当前登录用户的详细信息")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "获取成功")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UserResponse userResponse = userService.getCurrentUser();
        return ResponseEntity.ok(userResponse);
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/profile")
    @Operation(summary = "更新用户资料", description = "更新当前用户的个人资料信息")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "400", description = "请求参数无效"),
        @ApiResponse(responseCode = "401", description = "未授权访问")
    })
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        
        UserResponse userResponse = userService.updateProfile(request);
        return ResponseEntity.ok(userResponse);
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    @Operation(summary = "修改密码", description = "修改当前用户的登录密码")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "修改成功"),
        @ApiResponse(responseCode = "400", description = "旧密码不正确"),
        @ApiResponse(responseCode = "401", description = "未授权访问")
    })
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> request) {
        
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || newPassword == null || 
            oldPassword.trim().isEmpty() || newPassword.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "旧密码和新密码不能为空");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        userService.changePassword(oldPassword, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "密码修改成功，请重新登录");

        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户权限列表
     */
    @GetMapping("/permissions")
    @Operation(summary = "获取用户权限", description = "获取当前用户的权限列表")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getUserPermissions() {
        UserResponse currentUser = userService.getCurrentUser();
        List<String> permissions = userService.getUserPermissions(currentUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("permissions", permissions);

        return ResponseEntity.ok(response);
    }

    /**
     * 检查权限
     */
    @GetMapping("/permissions/check")
    @Operation(summary = "检查权限", description = "检查当前用户是否具有特定权限")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> checkPermission(
            @Parameter(description = "权限名称", example = "project:read")
            @RequestParam String permission) {
        
        UserResponse currentUser = userService.getCurrentUser();
        
        // 解析权限格式：resource:action
        String[] parts = permission.split(":");
        if (parts.length != 2) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("hasPermission", false);
            errorResponse.put("message", "权限格式不正确，应为 resource:action");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        boolean hasPermission = userService.hasPermission(currentUser.getId(), parts[0], parts[1]);

        Map<String, Object> response = new HashMap<>();
        response.put("hasPermission", hasPermission);

        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户角色列表
     */
    @GetMapping("/roles")
    @Operation(summary = "获取用户角色", description = "获取当前用户的角色列表")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getUserRoles() {
        UserResponse currentUser = userService.getCurrentUser();

        Map<String, Object> response = new HashMap<>();
        response.put("roles", currentUser.getRoles());

        return ResponseEntity.ok(response);
    }

    // 管理员API

    /**
     * 获取所有用户（管理员）
     */
    @GetMapping("/users")
    @Operation(summary = "获取用户列表", description = "分页获取用户列表（管理员权限）")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<UserResponse> users = userService.getUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * 搜索用户（管理员）
     */
    @GetMapping("/users/search")
    @Operation(summary = "搜索用户", description = "根据关键词搜索用户（管理员权限）")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @Parameter(description = "搜索关键词") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<UserResponse> users = userService.searchUsers(q, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * 获取指定用户信息（管理员）
     */
    @GetMapping("/users/{userId}")
    @Operation(summary = "获取用户详情", description = "获取指定用户的详细信息（管理员权限）")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "用户ID") @PathVariable UUID userId) {
        
        UserResponse user = UserResponse.from(userService.getUserById(userId));
        return ResponseEntity.ok(user);
    }

    /**
     * 健康检查
     */
    @GetMapping("/health")
    @Operation(summary = "健康检查", description = "检查认证服务状态")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "auth-service");
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }
}