package com.nanowrimo.app.controller;

import com.nanowrimo.app.model.Badge;
import com.nanowrimo.app.service.BadgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "*")
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @GetMapping("/goal/{goalId}")
    public ResponseEntity<List<Badge>> getBadgesByGoal(@PathVariable Long goalId) {
        return ResponseEntity.ok(badgeService.getBadgesForGoal(goalId));
    }
}
