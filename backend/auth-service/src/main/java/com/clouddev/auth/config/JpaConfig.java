package com.clouddev.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA配置类
 */
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.clouddev.auth.repository")
public class JpaConfig {
}