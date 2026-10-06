package com.nanowrimo.app.dto;

import com.nanowrimo.app.model.GoalType;
import com.nanowrimo.app.model.GoalUnit;
import java.time.LocalDate;

public class GoalRequest {
    private Long projectId;
    private String title;
    private GoalType type = GoalType.WRITING;
    private GoalUnit targetUnit = GoalUnit.WORDS;
    private Integer targetCount = 50000;
    private LocalDate startDate;
    private LocalDate endDate;

    public GoalRequest() {
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
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

    public Integer getTargetCount() {
        return targetCount;
    }

    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
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
}
