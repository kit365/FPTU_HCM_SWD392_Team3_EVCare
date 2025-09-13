package com.fpt.evcare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {
        corsRegistry.addMapping("/**")
         .allowedOrigins("*")
                .allowedMethods("*")
            .allowedHeaders("*")
                .exposedHeaders("Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers")
//                .allowCredentials(true) //neu can cokkies thi can cu the dia chi ben FE(vd: localhost:3000) khong duoc la *
                .maxAge(3600);
    }

}
