package com.clouddev.auth.service;

import com.clouddev.auth.dto.request.LoginRequest;
import com.clouddev.auth.dto.request.RegisterRequest;
import com.clouddev.auth.dto.request.UpdateProfileRequest;
import com.clouddev.auth.dto.response.AuthResponse;
import com.clouddev.auth.dto.response.UserResponse;
import com.clouddev.auth.entity.AuthProvider;
import com.clouddev.auth.entity.User;
import com.clouddev.auth.entity.UserLoginHistory;
import com.clouddev.auth.entity.UserSession;
import com.clouddev.auth.exception.EmailAlreadyExistsException;
import com.clouddev.auth.exception.UserNotFoundException;
import com.clouddev.auth.exception.UsernameAlreadyExistsException;
import com.clouddev.auth.repository.RoleRepository;
import com.clouddev.auth.repository.UserRepository;
import com.clouddev.auth.repository.UserSessionRepository;
import com.clouddev.auth.security.JwtTokenProvider;
import com.clouddev.auth.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 用户服务类
 */
@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${app.security.rate-limiting.login-attempts:5}")
    private int maxLoginAttempts;

    @Value("${app.security.rate-limiting.lockout-duration:900000}")
    private long lockoutDuration; // 15 minutes in milliseconds

    /**
     * 用户注册
     */
    public UserResponse registerUser(RegisterRequest request) {
        logger.info("Registering new user: {}", request.getUsername());

        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("用户名已存在: " + request.getUsername());
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("邮箱已存在: " + request.getEmail());
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(false);
        user.setProvider(AuthProvider.LOCAL);

        // 分配默认角色
        roleRepository.findByName("USER").ifPresent(user::addRole);

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getUsername());

        // TODO: 发送邮箱验证邮件

        return UserResponse.from(savedUser);
    }

    /**
     * 用户登录
     */
    public AuthResponse authenticateUser(LoginRequest request, HttpServletRequest httpRequest) {
        logger.info("Authenticating user: {}", request.getUsername());

        // 查找用户
        User user = userRepository.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("用户不存在: " + request.getUsername()));

        // 检查账户是否被锁定
        if (!user.isAccountNonLocked()) {
            logger.warn("Login attempt for locked account: {}", user.getUsername());
            throw new BadCredentialsException("账户已被锁定，请稍后再试");
        }

        try {
            // 执行认证
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // 认证成功，重置失败次数
            if (user.getFailedLoginAttempts() > 0) {
                user.resetFailedLoginAttempts();
                userRepository.save(user);
            }

            // 更新最后登录信息
            updateLastLoginInfo(user, httpRequest);

            // 记录登录历史
            recordLoginHistory(user, httpRequest, true, null);

            // 生成JWT令牌
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String accessToken = tokenProvider.generateAccessToken(userPrincipal);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);

            // 创建用户会话
            createUserSession(user, accessToken, refreshToken, httpRequest);

            logger.info("User authenticated successfully: {}", user.getUsername());

            return new AuthResponse(
                    accessToken,
                    refreshToken,
                    "Bearer",
                    tokenProvider.getJwtExpiration(),
                    UserResponse.from(user)
            );

        } catch (BadCredentialsException e) {
            // 认证失败，增加失败次数
            handleFailedLogin(user, httpRequest);
            throw e;
        }
    }

    /**
     * 刷新访问令牌
     */
    public AuthResponse refreshToken(String refreshToken) {
        logger.info("Refreshing access token");

        // 验证刷新令牌
        if (!tokenProvider.validateToken(refreshToken) || !tokenProvider.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("无效的刷新令牌");
        }

        // 查找会话
        UserSession session = userSessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new BadCredentialsException("会话不存在或已过期"));

        if (!session.getActive() || session.isRefreshExpired()) {
            throw new BadCredentialsException("会话已失效");
        }

        // 获取用户信息
        User user = session.getUser();
        UserPrincipal userPrincipal = UserPrincipal.create(user);

        // 生成新的访问令牌
        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);

        // 更新会话
        session.setSessionToken(newAccessToken);
        session.updateLastAccessed();
        userSessionRepository.save(session);

        logger.info("Access token refreshed for user: {}", user.getUsername());

        return new AuthResponse(
                newAccessToken,
                refreshToken,
                "Bearer",
                tokenProvider.getJwtExpiration(),
                UserResponse.from(user)
        );
    }

    /**
     * 用户登出
     */
    public void logout(String refreshToken) {
        if (StringUtils.hasText(refreshToken)) {
            userSessionRepository.findByRefreshToken(refreshToken)
                    .ifPresent(session -> {
                        session.invalidate();
                        userSessionRepository.save(session);
                        logger.info("User logged out: {}", session.getUser().getUsername());
                    });
        }
    }

    /**
     * 获取当前用户信息
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UserPrincipal userPrincipal = getCurrentUserPrincipal();
        User user = getUserById(userPrincipal.getId());
        return UserResponse.from(user);
    }

    /**
     * 更新用户资料
     */
    public UserResponse updateProfile(UpdateProfileRequest request) {
        UserPrincipal userPrincipal = getCurrentUserPrincipal();
        User user = getUserById(userPrincipal.getId());

        // 更新用户信息
        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (StringUtils.hasText(request.getAvatar())) {
            user.setAvatar(request.getAvatar());
        }
        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone());
        }

        User savedUser = userRepository.save(user);
        logger.info("User profile updated: {}", savedUser.getUsername());

        return UserResponse.from(savedUser);
    }

    /**
     * 修改密码
     */
    public void changePassword(String oldPassword, String newPassword) {
        UserPrincipal userPrincipal = getCurrentUserPrincipal();
        User user = getUserById(userPrincipal.getId());

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("旧密码不正确");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 使所有会话失效（强制重新登录）
        userSessionRepository.invalidateAllUserSessions(user.getId());

        logger.info("Password changed for user: {}", user.getUsername());
    }

    /**
     * 根据ID获取用户
     */
    @Transactional(readOnly = true)
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在: " + userId));
    }

    /**
     * 根据用户名获取用户
     */
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("用户不存在: " + username));
    }

    /**
     * 根据邮箱获取用户
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("用户不存在: " + email));
    }

    /**
     * 分页查询用户
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::from);
    }

    /**
     * 搜索用户
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String search, Pageable pageable) {
        return userRepository.searchUsers(search, pageable)
                .map(UserResponse::from);
    }

    /**
     * 获取用户权限列表
     */
    @Transactional(readOnly = true)
    public List<String> getUserPermissions(UUID userId) {
        User user = getUserById(userId);
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        return userPrincipal.getPermissions();
    }

    /**
     * 检查用户是否有特定权限
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(UUID userId, String resource, String action) {
        // 可以实现更复杂的权限检查逻辑
        List<String> permissions = getUserPermissions(userId);
        String permission = resource + ":" + action;
        return permissions.contains(permission);
    }

    /**
     * 获取当前用户主体
     */
    private UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        throw new RuntimeException("未找到当前用户信息");
    }

    /**
     * 处理登录失败
     */
    private void handleFailedLogin(User user, HttpServletRequest request) {
        user.incrementFailedLoginAttempts();

        String failureReason = "密码错误";
        if (user.getFailedLoginAttempts() >= maxLoginAttempts) {
            long lockoutMinutes = lockoutDuration / 60000;
            user.lockAccount((int) lockoutMinutes);
            failureReason = "登录失败次数过多，账户已被锁定";
            logger.warn("Account locked due to too many failed attempts: {}", user.getUsername());
        }

        userRepository.save(user);
        recordLoginHistory(user, request, false, failureReason);
    }

    /**
     * 更新最后登录信息
     */
    private void updateLastLoginInfo(User user, HttpServletRequest request) {
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(getClientIpAddress(request));
        user.setLastLoginUserAgent(request.getHeader("User-Agent"));
        userRepository.save(user);
    }

    /**
     * 记录登录历史
     */
    private void recordLoginHistory(User user, HttpServletRequest request, boolean success, String failureReason) {
        UserLoginHistory loginHistory = new UserLoginHistory(
                user,
                getClientIpAddress(request),
                request.getHeader("User-Agent"),
                success,
                failureReason
        );
        user.getLoginHistory().add(loginHistory);
    }

    /**
     * 创建用户会话
     */
    private void createUserSession(User user, String accessToken, String refreshToken, HttpServletRequest request) {
        // 检查会话数量限制
        long activeSessionCount = userSessionRepository.countActiveSessionsByUserId(user.getId());
        if (activeSessionCount >= 5) { // 最多5个活跃会话
            // 删除最老的会话
            List<UserSession> sessions = userSessionRepository.findActiveSessionsByUserId(user.getId());
            sessions.stream()
                    .min((s1, s2) -> s1.getCreatedAt().compareTo(s2.getCreatedAt()))
                    .ifPresent(oldestSession -> {
                        oldestSession.invalidate();
                        userSessionRepository.save(oldestSession);
                    });
        }

        LocalDateTime now = LocalDateTime.now();
        UserSession session = new UserSession(
                user,
                accessToken,
                refreshToken,
                now.plusSeconds(tokenProvider.getJwtExpiration() / 1000),
                now.plusSeconds(tokenProvider.getRefreshTokenExpiration() / 1000)
        );

        session.setIpAddress(getClientIpAddress(request));
        session.setUserAgent(request.getHeader("User-Agent"));
        // TODO: 设置设备类型和位置信息

        userSessionRepository.save(session);
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIP)) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }
}