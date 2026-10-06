package com.nanowrimo.app.controller;

import com.nanowrimo.app.dto.GoalRequest;
import com.nanowrimo.app.model.Goal;
import com.nanowrimo.app.model.Project;
import com.nanowrimo.app.repository.GoalRepository;
import com.nanowrimo.app.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalRepository goalRepository;
    private final ProjectRepository projectRepository;

    public GoalController(GoalRepository goalRepository, ProjectRepository projectRepository) {
        this.goalRepository = goalRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<Goal> getAllGoals() {
        return goalRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/project/{projectId}")
    public List<Goal> getGoalsByProject(@PathVariable Long projectId) {
        return goalRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Long id) {
        return goalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody GoalRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com id: " + request.getProjectId()));

        Goal goal = new Goal(
                project,
                request.getTitle(),
                request.getType(),
                request.getTargetUnit(),
                request.getTargetCount(),
                request.getStartDate(),
                request.getEndDate()
        );
        return ResponseEntity.ok(goalRepository.save(goal));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Goal> archiveGoal(@PathVariable Long id) {
        return goalRepository.findById(id)
                .map(g -> {
                    g.setArchived(true);
                    return ResponseEntity.ok(goalRepository.save(g));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        if (goalRepository.existsById(id)) {
            goalRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
