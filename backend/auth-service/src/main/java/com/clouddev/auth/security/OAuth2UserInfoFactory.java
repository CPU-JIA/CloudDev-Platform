package com.clouddev.auth.security;

import com.clouddev.auth.security.oauth2.GoogleOAuth2UserInfo;
import com.clouddev.auth.security.oauth2.GithubOAuth2UserInfo;
import com.clouddev.auth.security.oauth2.GitlabOAuth2UserInfo;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import java.util.Map;

/**
 * OAuth2用户信息工厂类
 */
public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("github")) {
            return new GithubOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("gitlab")) {
            return new GitlabOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationException("不支持的OAuth2提供商: " + registrationId);
        }
    }
}