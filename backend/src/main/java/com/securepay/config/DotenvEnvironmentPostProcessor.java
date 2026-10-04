package com.securepay.config;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File[] candidates = new File[] {
                new File(".env"),
                new File("../.env"),
                new File(System.getProperty("user.dir", "."), ".env"),
                new File(System.getProperty("user.dir", "."), "../.env")
        };

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                Map<String, Object> props = new HashMap<>();
                try (BufferedReader reader = new BufferedReader(new FileReader(candidate))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eq = line.indexOf('=');
                        if (eq > 0) {
                            String key = line.substring(0, eq).trim();
                            String val = line.substring(eq + 1).trim();
                            if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            } else if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (!environment.containsProperty(key)) {
                                props.put(key, val);
                                if (System.getProperty(key) == null) {
                                    System.setProperty(key, val);
                                }
                            }
                        }
                    }
                    if (!props.isEmpty()) {
                        environment.getPropertySources().addLast(new MapPropertySource("dotenvProperties", props));
                    }
                    break;
                } catch (IOException ignored) {
                }
            }
        }
    }
}
