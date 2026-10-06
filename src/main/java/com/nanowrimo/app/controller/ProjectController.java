package com.nanowrimo.app.controller;

import com.nanowrimo.app.dto.LibraryProjectDto;
import com.nanowrimo.app.dto.ProjectRequest;
import com.nanowrimo.app.model.Goal;
import com.nanowrimo.app.model.Project;
import com.nanowrimo.app.model.User;
import com.nanowrimo.app.repository.GoalRepository;
import com.nanowrimo.app.repository.ProjectRepository;
import com.nanowrimo.app.repository.WritingSessionRepository;
import com.nanowrimo.app.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final GoalRepository goalRepository;
    private final WritingSessionRepository writingSessionRepository;
    private final AuthService authService;

    public ProjectController(ProjectRepository projectRepository,
                             GoalRepository goalRepository,
                             WritingSessionRepository writingSessionRepository,
                             AuthService authService) {
        this.projectRepository = projectRepository;
        this.goalRepository = goalRepository;
        this.writingSessionRepository = writingSessionRepository;
        this.authService = authService;
    }

    @GetMapping
    public List<Project> getAllProjects(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = authService.getUserByToken(token);
        if (user != null) {
            return projectRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return projectRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/active")
    public List<LibraryProjectDto> getActiveProjects(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = authService.getUserByToken(token);
        List<Project> projects = user != null 
                ? projectRepository.findByUserIdOrderByCreatedAtDesc(user.getId()) 
                : projectRepository.findAllByOrderByCreatedAtDesc();

        List<LibraryProjectDto> list = new ArrayList<>();
        for (Project p : projects) {
            Goal activeGoal = goalRepository.findFirstByProjectIdAndArchivedFalseOrderByCreatedAtDesc(p.getId()).orElse(null);
            Long totalWords = writingSessionRepository.getTotalWordsByGoalId(activeGoal != null ? activeGoal.getId() : -1L);
            long words = totalWords != null ? totalWords : 0L;

            double progress = 0.0;
            if (activeGoal != null) {
                if (activeGoal.getTargetUnit() == com.nanowrimo.app.model.GoalUnit.CHAPTERS) {
                    int target = activeGoal.getTargetCount() > 0 ? activeGoal.getTargetCount() : 1;
                    int cur = activeGoal.getCurrentUnitProgress() != null ? activeGoal.getCurrentUnitProgress() : 0;
                    progress = Math.min(100.0, Math.round(((double) cur / target) * 1000.0) / 10.0);
                } else {
                    int target = activeGoal.getTargetWords() > 0 ? activeGoal.getTargetWords() : 1;
                    progress = Math.min(100.0, Math.round(((double) words / target) * 1000.0) / 10.0);
                }
            }

            list.add(new LibraryProjectDto(p, activeGoal, List.of(), words, progress));
        }
        return list;
    }

    @GetMapping("/library")
    public List<LibraryProjectDto> getLibrary(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = authService.getUserByToken(token);
        List<Project> projects = user != null
                ? projectRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                : projectRepository.findAllByOrderByCreatedAtDesc();

        List<LibraryProjectDto> library = new ArrayList<>();
        for (Project p : projects) {
            Goal activeGoal = goalRepository.findFirstByProjectIdAndArchivedFalseOrderByCreatedAtDesc(p.getId()).orElse(null);
            List<Goal> archivedGoals = goalRepository.findByProjectIdAndArchivedOrderByCreatedAtDesc(p.getId(), true);
            Long totalWords = writingSessionRepository.getTotalWordsByGoalId(activeGoal != null ? activeGoal.getId() : -1L);
            long words = totalWords != null ? totalWords : 0L;

            double progress = 0.0;
            if (activeGoal != null) {
                if (activeGoal.getTargetUnit() == com.nanowrimo.app.model.GoalUnit.CHAPTERS) {
                    int target = activeGoal.getTargetCount() > 0 ? activeGoal.getTargetCount() : 1;
                    int cur = activeGoal.getCurrentUnitProgress() != null ? activeGoal.getCurrentUnitProgress() : 0;
                    progress = Math.min(100.0, Math.round(((double) cur / target) * 1000.0) / 10.0);
                } else {
                    int target = activeGoal.getTargetWords() > 0 ? activeGoal.getTargetWords() : 1;
                    progress = Math.min(100.0, Math.round(((double) words / target) * 1000.0) / 10.0);
                }
            }

            library.add(new LibraryProjectDto(p, activeGoal, archivedGoals, words, progress));
        }
        return library;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Project createProject(@RequestHeader(value = "Authorization", required = false) String token,
                                 @RequestBody ProjectRequest request) {
        User user = authService.getUserByToken(token);
        Project project = new Project(
                user,
                request.getTitle(),
                request.getCoverUrl(),
                request.getGenre(),
                request.getSeries(),
                request.getSynopsis()
        );
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody ProjectRequest request) {
        return projectRepository.findById(id)
                .map(p -> {
                    p.setTitle(request.getTitle());
                    p.setCoverUrl(request.getCoverUrl());
                    p.setGenre(request.getGenre());
                    p.setSeries(request.getSeries());
                    p.setSynopsis(request.getSynopsis());
                    return ResponseEntity.ok(projectRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
