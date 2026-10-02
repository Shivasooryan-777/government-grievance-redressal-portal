package com.college.grievanceportal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for asynchronous task execution in the application.
 * Enables Spring's @Async processing so non-critical background jobs,
 * such as SMTP notification dispatching, execute on separate threads
 * and never block or fail database transactions.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Configures a dedicated ThreadPoolTaskExecutor for background email notifications.
     * Setting a bounded queue and pool prevents unbounded thread creation while ensuring
     * notification requests are executed promptly in the background.
     *
     * @return the configured Executor bean
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("async-mail-");
        executor.initialize();
        return executor;
    }
}
