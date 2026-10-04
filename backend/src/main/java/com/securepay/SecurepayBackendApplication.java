package com.securepay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecurepayBackendApplication {

	public static void main(String[] args) {
		loadDotEnv();
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
		System.setProperty("user.timezone", "UTC");
		SpringApplication.run(SecurepayBackendApplication.class, args);
	}

	public static void loadDotEnv() {
		java.io.File[] candidates = new java.io.File[] {
				new java.io.File(".env"),
				new java.io.File("../.env"),
				new java.io.File(System.getProperty("user.dir", "."), ".env"),
				new java.io.File(System.getProperty("user.dir", "."), "../.env")
		};

		for (java.io.File candidate : candidates) {
			if (candidate.exists() && candidate.isFile()) {
				try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(candidate))) {
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
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, val);
							}
						}
					}
					break;
				} catch (java.io.IOException ignored) {
				}
			}
		}
	}
}
