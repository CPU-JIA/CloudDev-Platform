package com.clouddev.ide;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * IDE服务启动类
 */
@SpringBootApplication
@EnableFeignClients
@EnableMongoRepositories
@EnableAsync
public class IdeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IdeServiceApplication.class, args);
    }
}