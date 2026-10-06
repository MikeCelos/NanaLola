package com.nanowrimo.app.controller;

import com.nanowrimo.app.dto.SessionRequest;
import com.nanowrimo.app.model.WritingSession;
import com.nanowrimo.app.service.WritingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final WritingSessionService sessionService;

    public SessionController(WritingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/goal/{goalId}")
    public List<WritingSession> getSessionsByGoal(@PathVariable Long goalId) {
        return sessionService.getSessionsForGoal(goalId);
    }

    @PostMapping
    public ResponseEntity<WritingSession> addSession(@RequestBody SessionRequest request) {
        WritingSession session = sessionService.addSession(request);
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
