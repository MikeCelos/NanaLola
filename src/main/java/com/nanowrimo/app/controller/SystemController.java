package com.nanowrimo.app.controller;

import com.nanowrimo.app.config.DatabaseConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SystemController {

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        boolean persistent = DatabaseConfig.isPersistentDatabaseActive();
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "database", DatabaseConfig.getActiveDatabaseType(),
                "persistent", persistent,
                "host", DatabaseConfig.getActiveDatabaseHost(),
                "message", persistent
                        ? "Connected to cloud PostgreSQL. All users and writing data persist permanently."
                        : "Running on local H2 (ephemeral on cloud). Configure DATABASE_URL in Render to persist forever."
        ));
    }
}
