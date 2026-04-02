package com.irms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IrmsApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(IrmsApplication.class, args);
    }
}
