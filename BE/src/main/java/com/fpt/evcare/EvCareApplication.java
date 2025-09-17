package com.fpt.evcare;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Slf4j
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class EvCareApplication {

	public static void main(String[] args) {
		try {
			Dotenv dotenv = Dotenv.configure()
					.ignoreIfMissing()
					.load();

			if (dotenv != null) {
				dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
				log.info("✅ Loaded .env variables.");
			}
		} catch (Exception e) {
			log.warn("⚠️ .env file not found or failed to load. Using defaults.");
		}

		SpringApplication.run(EvCareApplication.class, args);
	}

}
