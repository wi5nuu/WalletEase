package com.payflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * PayFlow Application - Main entry point.
 * 
 * A digital payment and e-wallet platform for the fintech industry.
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class PayflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayflowApplication.class, args);
    }
}
