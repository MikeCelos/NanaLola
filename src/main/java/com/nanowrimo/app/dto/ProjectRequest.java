package com.nanowrimo.app.dto;

public class ProjectRequest {
    private String title;
    private String coverUrl;
    private String genre;
    private String series;
    private String synopsis;
    private String goalUnit;
    private Integer targetCount;

    public ProjectRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getSeries() {
        return series;
    }

    public void setSeries(String series) {
        this.series = series;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public String getGoalUnit() {
        return goalUnit;
    }

    public void setGoalUnit(String goalUnit) {
        this.goalUnit = goalUnit;
    }

    public Integer getTargetCount() {
        return targetCount;
    }

    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
    }
}
