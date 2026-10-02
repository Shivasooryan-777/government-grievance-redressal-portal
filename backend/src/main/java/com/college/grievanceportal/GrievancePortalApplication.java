package com.college.grievanceportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Main entry point for the Government Grievance Redressal Portal backend.
 */
@SpringBootApplication
public class GrievancePortalApplication {

    /**
     * Starts the Spring Boot application.
     * Pre-loads environment variables from local .env if present.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(GrievancePortalApplication.class, args);
    }

    /**
     * Reads key-value pairs from a local .env file (if present) and registers them
     * as system properties ONLY if not already provided by the runtime environment.
     *
     * In cloud production environments (Render, Railway, Docker), environment variables
     * are injected directly by the platform into System.getenv() and no .env file exists.
     * This method safely skips loading if no .env file is found, and never overrides
     * any existing platform-level environment variable or JVM system property.
     */
    private static void loadEnvFile() {
        Path[] possiblePaths = {
            Paths.get(".env"),
            Paths.get("backend", ".env"),
            Paths.get("..", "backend", ".env")
        };
        for (Path path : possiblePaths) {
            if (Files.exists(path)) {
                try (var lines = Files.lines(path)) {
                    lines.map(String::trim)
                         .filter(line -> !line.isEmpty() && !line.startsWith("#") && line.contains("="))
                         .forEach(line -> {
                             int idx = line.indexOf('=');
                             String key = line.substring(0, idx).trim();
                             String value = line.substring(idx + 1).trim();
                             if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                 (value.startsWith("'") && value.endsWith("'"))) {
                                 value = value.substring(1, value.length() - 1);
                             }
                             // Crucial guard: Platform/OS env vars always take precedence
                             if (!key.isEmpty() && System.getProperty(key) == null && System.getenv(key) == null) {
                                 System.setProperty(key, value);
                             }
                         });
                    break;
                } catch (Exception ignored) {
                    // Silently ignore I/O errors so startup is never halted
                }
            }
        }
    }
}