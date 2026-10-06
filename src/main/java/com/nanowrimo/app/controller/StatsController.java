package com.nanowrimo.app.controller;

import com.nanowrimo.app.dto.StatsResponse;
import com.nanowrimo.app.repository.WritingSessionRepository;
import com.nanowrimo.app.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;
    private final WritingSessionRepository writingSessionRepository;

    public StatsController(StatsService statsService, WritingSessionRepository writingSessionRepository) {
        this.statsService = statsService;
        this.writingSessionRepository = writingSessionRepository;
    }

    @GetMapping("/goal/{goalId}")
    public ResponseEntity<StatsResponse> getGoalStats(@PathVariable Long goalId) {
        return ResponseEntity.ok(statsService.calculateStats(goalId));
    }

    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Long totalWords = writingSessionRepository.getTotalWordsApp();
        return ResponseEntity.ok(Map.of(
                "totalWordsApp", totalWords != null ? totalWords : 0L
        ));
    }
}
