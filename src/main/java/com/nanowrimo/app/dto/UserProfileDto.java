package com.nanowrimo.app.dto;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String bio;

    private long totalWordsAllProjects;
    private int bestDayWordsRecord;
    private int totalProjectsCount;
    private int completedGoalsCount;

    public UserProfileDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public long getTotalWordsAllProjects() {
        return totalWordsAllProjects;
    }

    public void setTotalWordsAllProjects(long totalWordsAllProjects) {
        this.totalWordsAllProjects = totalWordsAllProjects;
    }

    public int getBestDayWordsRecord() {
        return bestDayWordsRecord;
    }

    public void setBestDayWordsRecord(int bestDayWordsRecord) {
        this.bestDayWordsRecord = bestDayWordsRecord;
    }

    public int getTotalProjectsCount() {
        return totalProjectsCount;
    }

    public void setTotalProjectsCount(int totalProjectsCount) {
        this.totalProjectsCount = totalProjectsCount;
    }

    public int getCompletedGoalsCount() {
        return completedGoalsCount;
    }

    public void setCompletedGoalsCount(int completedGoalsCount) {
        this.completedGoalsCount = completedGoalsCount;
    }
}
