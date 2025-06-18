package com.clouddev.auth.security;

import com.clouddev.auth.entity.User;
import com.clouddev.auth.exception.UserNotFoundException;
import com.clouddev.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

/**
 * 自定义用户详情服务
 * 实现UserDetailsService接口，用于Spring Security从数据库加载用户信息
 */
@Service
public class CustomUserDetailsService extends DefaultOAuth2UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * 根据用户名加载用户详情
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + usernameOrEmail));

        return UserPrincipal.create(user);
    }

    /**
     * 根据用户ID加载用户详情
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("用户不存在: " + id));

        return UserPrincipal.create(user);
    }

    /**
     * OAuth2用户加载
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException("OAuth2认证失败: " + ex.getMessage());
        }
    }

    /**
     * 处理OAuth2用户信息
     */
    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                oAuth2UserRequest.getClientRegistration().getRegistrationId(), 
                oAuth2User.getAttributes()
        );

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationException("OAuth2提供商未返回邮箱信息");
        }

        User user = userRepository.findByEmail(oAuth2UserInfo.getEmail()).orElse(null);

        if (user != null) {
            // 用户已存在，更新信息
            if (!user.getProvider().equals(AuthProviderType.valueOf(
                    oAuth2UserRequest.getClientRegistration().getRegistrationId().toUpperCase()))) {
                throw new OAuth2AuthenticationException(
                        "该邮箱已使用 " + user.getProvider() + " 注册，请使用相同的登录方式");
            }
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            // 创建新用户
            user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    /**
     * 注册新的OAuth2用户
     */
    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();

        user.setProvider(AuthProviderType.valueOf(
                oAuth2UserRequest.getClientRegistration().getRegistrationId().toUpperCase()));
        user.setProviderId(oAuth2UserInfo.getId());
        user.setUsername(generateUniqueUsername(oAuth2UserInfo));
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setFirstName(oAuth2UserInfo.getFirstName());
        user.setLastName(oAuth2UserInfo.getLastName());
        user.setAvatar(oAuth2UserInfo.getImageUrl());
        user.setEnabled(true);
        user.setEmailVerified(true); // OAuth2用户邮箱默认已验证

        return userRepository.save(user);
    }

    /**
     * 更新现有用户信息
     */
    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        existingUser.setFirstName(oAuth2UserInfo.getFirstName());
        existingUser.setLastName(oAuth2UserInfo.getLastName());
        existingUser.setAvatar(oAuth2UserInfo.getImageUrl());

        return userRepository.save(existingUser);
    }

    /**
     * 生成唯一的用户名
     */
    private String generateUniqueUsername(OAuth2UserInfo userInfo) {
        String baseUsername = userInfo.getName() != null ? 
                userInfo.getName().toLowerCase().replaceAll("\\s+", "") :
                userInfo.getEmail().split("@")[0];

        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}