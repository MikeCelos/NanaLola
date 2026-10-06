package com.nanowrimo.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "writing_sessions")
public class WritingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "goal_id", nullable = false)
    @JsonIgnoreProperties({"project", "hibernateLazyInitializer", "handler"})
    private Goal goal;

    @Column(nullable = false)
    private Integer wordsAdded = 0;

    @Column(nullable = false)
    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public WritingSession() {
    }

    public WritingSession(Goal goal, Integer wordsAdded, LocalDate sessionDate, LocalTime startTime, LocalTime endTime, String notes) {
        this.goal = goal;
        this.wordsAdded = wordsAdded != null ? wordsAdded : 0;
        this.sessionDate = sessionDate != null ? sessionDate : LocalDate.now();
        this.startTime = startTime != null ? startTime : LocalTime.now();
        this.endTime = endTime;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Goal getGoal() {
        return goal;
    }

    public void setGoal(Goal goal) {
        this.goal = goal;
    }

    public Integer getWordsAdded() {
        return wordsAdded;
    }

    public void setWordsAdded(Integer wordsAdded) {
        this.wordsAdded = wordsAdded;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
