package com.nanowrimo.app.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SessionRequest {
    private Long goalId;
    private Integer wordsAdded;
    private Integer newTotalCount; // Se optar por atualizar o total do livro
    private Integer currentChapter; // Se for meta por capítulos
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;

    public SessionRequest() {
    }

    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public Integer getWordsAdded() {
        return wordsAdded;
    }

    public void setWordsAdded(Integer wordsAdded) {
        this.wordsAdded = wordsAdded;
    }

    public Integer getNewTotalCount() {
        return newTotalCount;
    }

    public void setNewTotalCount(Integer newTotalCount) {
        this.newTotalCount = newTotalCount;
    }

    public Integer getCurrentChapter() {
        return currentChapter;
    }

    public void setCurrentChapter(Integer currentChapter) {
        this.currentChapter = currentChapter;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
