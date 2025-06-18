package com.clouddev.auth.entity;

/**
 * 认证提供商枚举
 */
public enum AuthProvider {
    LOCAL,      // 本地认证
    GOOGLE,     // Google OAuth2
    GITHUB,     // GitHub OAuth2
    GITLAB      // GitLab OAuth2
}