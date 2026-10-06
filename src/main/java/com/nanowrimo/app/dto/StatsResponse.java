package com.nanowrimo.app.dto;

import com.nanowrimo.app.model.Badge;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class StatsResponse {
    private Long projectId;
    private String projectTitle;
    private String projectCoverUrl;
    private String projectGenre;
    private String projectSeries;

    private Long goalId;
    private String goalTitle;
    private String goalType;
    private String targetUnit = "WORDS";
    private int targetCount = 50000;
    private int currentUnitProgress = 0;
    private boolean archived = false;
    private int targetWords;
    private int currentWords;
    private int remainingWords;
    private double progressPercentage;
    private long totalWordsApp;

    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private int daysElapsed;
    private int daysRemaining;

    private int originalDailyGoal;
    private int remainingDailyGoal;
    private int currentDailyAverage;

    private int bestDayWords;
    private LocalDate bestDayDate;
    private boolean isNewRecord;

    private LocalDate estimatedCompletionDate;
    private int streakDays;

    private String moodStatus;
    private String moodEmoji;
    private String moodMessage;
    private String motivationalQuote;

    private boolean completed;
    private List<DailyStatDto> dailyStats = new ArrayList<>();
    private List<Badge> badges = new ArrayList<>();

    public StatsResponse() {
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public String getProjectCoverUrl() {
        return projectCoverUrl;
    }

    public void setProjectCoverUrl(String projectCoverUrl) {
        this.projectCoverUrl = projectCoverUrl;
    }

    public String getProjectGenre() {
        return projectGenre;
    }

    public void setGenre(String projectGenre) {
        this.projectGenre = projectGenre;
    }

    public String getProjectSeries() {
        return projectSeries;
    }

    public void setProjectSeries(String projectSeries) {
        this.projectSeries = projectSeries;
    }

    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public String getGoalTitle() {
        return goalTitle;
    }

    public void setGoalTitle(String goalTitle) {
        this.goalTitle = goalTitle;
    }

    public String getGoalType() {
        return goalType;
    }

    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }

    public int getTargetWords() {
        return targetWords;
    }

    public void setTargetWords(int targetWords) {
        this.targetWords = targetWords;
    }

    public int getCurrentWords() {
        return currentWords;
    }

    public void setCurrentWords(int currentWords) {
        this.currentWords = currentWords;
    }

    public int getRemainingWords() {
        return remainingWords;
    }

    public void setRemainingWords(int remainingWords) {
        this.remainingWords = remainingWords;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public long getTotalWordsApp() {
        return totalWordsApp;
    }

    public void setTotalWordsApp(long totalWordsApp) {
        this.totalWordsApp = totalWordsApp;
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

    public int getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(int totalDays) {
        this.totalDays = totalDays;
    }

    public int getDaysElapsed() {
        return daysElapsed;
    }

    public void setDaysElapsed(int daysElapsed) {
        this.daysElapsed = daysElapsed;
    }

    public int getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(int daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public int getOriginalDailyGoal() {
        return originalDailyGoal;
    }

    public void setOriginalDailyGoal(int originalDailyGoal) {
        this.originalDailyGoal = originalDailyGoal;
    }

    public int getRemainingDailyGoal() {
        return remainingDailyGoal;
    }

    public void setRemainingDailyGoal(int remainingDailyGoal) {
        this.remainingDailyGoal = remainingDailyGoal;
    }

    public int getCurrentDailyAverage() {
        return currentDailyAverage;
    }

    public void setCurrentDailyAverage(int currentDailyAverage) {
        this.currentDailyAverage = currentDailyAverage;
    }

    public int getBestDayWords() {
        return bestDayWords;
    }

    public void setBestDayWords(int bestDayWords) {
        this.bestDayWords = bestDayWords;
    }

    public LocalDate getBestDayDate() {
        return bestDayDate;
    }

    public void setBestDayDate(LocalDate bestDayDate) {
        this.bestDayDate = bestDayDate;
    }

    public boolean isNewRecord() {
        return isNewRecord;
    }

    public void setNewRecord(boolean newRecord) {
        isNewRecord = newRecord;
    }

    public LocalDate getEstimatedCompletionDate() {
        return estimatedCompletionDate;
    }

    public void setEstimatedCompletionDate(LocalDate estimatedCompletionDate) {
        this.estimatedCompletionDate = estimatedCompletionDate;
    }

    public int getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(int streakDays) {
        this.streakDays = streakDays;
    }

    public String getMoodStatus() {
        return moodStatus;
    }

    public void setMoodStatus(String moodStatus) {
        this.moodStatus = moodStatus;
    }

    public String getMoodEmoji() {
        return moodEmoji;
    }

    public void setMoodEmoji(String moodEmoji) {
        this.moodEmoji = moodEmoji;
    }

    public String getMoodMessage() {
        return moodMessage;
    }

    public void setMoodMessage(String moodMessage) {
        this.moodMessage = moodMessage;
    }

    public String getMotivationalQuote() {
        return motivationalQuote;
    }

    public void setMotivationalQuote(String motivationalQuote) {
        this.motivationalQuote = motivationalQuote;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public List<DailyStatDto> getDailyStats() {
        return dailyStats;
    }

    public void setDailyStats(List<DailyStatDto> dailyStats) {
        this.dailyStats = dailyStats;
    }

    public List<Badge> getBadges() {
        return badges;
    }

    public void setBadges(List<Badge> badges) {
        this.badges = badges;
    }

    public String getTargetUnit() {
        return targetUnit;
    }

    public void setTargetUnit(String targetUnit) {
        this.targetUnit = targetUnit;
    }

    public int getTargetCount() {
        return targetCount;
    }

    public void setTargetCount(int targetCount) {
        this.targetCount = targetCount;
    }

    public int getCurrentUnitProgress() {
        return currentUnitProgress;
    }

    public void setCurrentUnitProgress(int currentUnitProgress) {
        this.currentUnitProgress = currentUnitProgress;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }
}
