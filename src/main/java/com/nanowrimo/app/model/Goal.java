package com.nanowrimo.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalType type = GoalType.WRITING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalUnit targetUnit = GoalUnit.WORDS;

    private Integer targetWords = 50000;

    @Column(nullable = false)
    private Integer targetCount = 50000;

    private Integer currentUnitProgress = 0; // Ex: se for capítulos, indica em que capítulo vai

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private boolean archived = false; // Metas antigas vs ativas

    private LocalDateTime createdAt = LocalDateTime.now();

    public Goal() {
    }

    public Goal(Project project, String title, GoalType type, GoalUnit targetUnit, Integer targetCount, LocalDate startDate, LocalDate endDate) {
        this.project = project;
        this.title = title;
        this.type = type != null ? type : GoalType.WRITING;
        this.targetUnit = targetUnit != null ? targetUnit : GoalUnit.WORDS;
        this.targetCount = targetCount != null ? targetCount : 50000;
        this.targetWords = this.targetUnit == GoalUnit.WORDS ? this.targetCount : null;
        this.currentUnitProgress = 0;
        this.startDate = startDate;
        this.endDate = endDate;
        this.archived = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public GoalType getType() {
        return type;
    }

    public void setType(GoalType type) {
        this.type = type;
    }

    public GoalUnit getTargetUnit() {
        return targetUnit;
    }

    public void setTargetUnit(GoalUnit targetUnit) {
        this.targetUnit = targetUnit;
    }

    public Integer getTargetWords() {
        return targetWords;
    }

    public void setTargetWords(Integer targetWords) {
        this.targetWords = targetWords;
    }

    public Integer getTargetCount() {
        return targetCount;
    }

    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
    }

    public Integer getCurrentUnitProgress() {
        return currentUnitProgress;
    }

    public void setCurrentUnitProgress(Integer currentUnitProgress) {
        this.currentUnitProgress = currentUnitProgress;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
