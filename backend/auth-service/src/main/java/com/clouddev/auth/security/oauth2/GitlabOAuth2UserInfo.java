package com.clouddev.auth.security.oauth2;

import com.clouddev.auth.security.OAuth2UserInfo;

import java.util.Map;

/**
 * GitLab OAuth2用户信息
 */
public class GitlabOAuth2UserInfo extends OAuth2UserInfo {

    public GitlabOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return ((Integer) attributes.get("id")).toString();
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }

    @Override
    public String getFirstName() {
        String name = getName();
        if (name != null && name.contains(" ")) {
            return name.split(" ")[0];
        }
        return name;
    }

    @Override
    public String getLastName() {
        String name = getName();
        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ");
            if (parts.length > 1) {
                return String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));
            }
        }
        return null;
    }
}