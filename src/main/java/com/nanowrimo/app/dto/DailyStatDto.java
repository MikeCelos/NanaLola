package com.nanowrimo.app.dto;

import java.time.LocalDate;

public class DailyStatDto {
    private LocalDate date;
    private String label;
    private int dayNumber;
    private int wordsLogged;
    private int cumulativeLogged;
    private int expectedCumulative;
    private int dailyTarget;
    private boolean recordDay;

    public DailyStatDto() {
    }

    public DailyStatDto(LocalDate date, String label, int dayNumber, int wordsLogged, int cumulativeLogged, int expectedCumulative, int dailyTarget, boolean recordDay) {
        this.date = date;
        this.label = label;
        this.dayNumber = dayNumber;
        this.wordsLogged = wordsLogged;
        this.cumulativeLogged = cumulativeLogged;
        this.expectedCumulative = expectedCumulative;
        this.dailyTarget = dailyTarget;
        this.recordDay = recordDay;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    public int getWordsLogged() {
        return wordsLogged;
    }

    public void setWordsLogged(int wordsLogged) {
        this.wordsLogged = wordsLogged;
    }

    public int getCumulativeLogged() {
        return cumulativeLogged;
    }

    public void setCumulativeLogged(int cumulativeLogged) {
        this.cumulativeLogged = cumulativeLogged;
    }

    public int getExpectedCumulative() {
        return expectedCumulative;
    }

    public void setExpectedCumulative(int expectedCumulative) {
        this.expectedCumulative = expectedCumulative;
    }

    public int getDailyTarget() {
        return dailyTarget;
    }

    public void setDailyTarget(int dailyTarget) {
        this.dailyTarget = dailyTarget;
    }

    public boolean isRecordDay() {
        return recordDay;
    }

    public void setRecordDay(boolean recordDay) {
        this.recordDay = recordDay;
    }
}
