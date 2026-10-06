package com.nanowrimo.app.dto;

import com.nanowrimo.app.model.Goal;
import com.nanowrimo.app.model.Project;
import java.util.ArrayList;
import java.util.List;

public class LibraryProjectDto {
    private Project project;
    private Goal activeGoal;
    private List<Goal> archivedGoals = new ArrayList<>();
    private long totalWords;
    private double progressPercentage;

    public LibraryProjectDto() {
    }

    public LibraryProjectDto(Project project, Goal activeGoal, List<Goal> archivedGoals, long totalWords, double progressPercentage) {
        this.project = project;
        this.activeGoal = activeGoal;
        this.archivedGoals = archivedGoals != null ? archivedGoals : new ArrayList<>();
        this.totalWords = totalWords;
        this.progressPercentage = progressPercentage;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Goal getActiveGoal() {
        return activeGoal;
    }

    public void setActiveGoal(Goal activeGoal) {
        this.activeGoal = activeGoal;
    }

    public List<Goal> getArchivedGoals() {
        return archivedGoals;
    }

    public void setArchivedGoals(List<Goal> archivedGoals) {
        this.archivedGoals = archivedGoals;
    }

    public long getTotalWords() {
        return totalWords;
    }

    public void setTotalWords(long totalWords) {
        this.totalWords = totalWords;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
