package com.nanowrimo.app.service;

import com.nanowrimo.app.model.Badge;
import com.nanowrimo.app.model.Goal;
import com.nanowrimo.app.repository.BadgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public BadgeService(BadgeRepository badgeRepository) {
        this.badgeRepository = badgeRepository;
    }

    public List<Badge> getBadgesForGoal(Long goalId) {
        return badgeRepository.findByGoalIdOrderByUnlockedAtAsc(goalId);
    }

    @Transactional
    public List<Badge> checkAndUnlockBadges(Goal goal, int currentTotalWords, Map<LocalDate, Integer> dailyTotals, int streakDays) {
        List<Badge> newBadges = new ArrayList<>();
        Long goalId = goal.getId();

        // 1. First session
        if (currentTotalWords > 0) {
            unlockIfNotExists(goalId, "FIRST_SESSION", "First Lines", "You wrote your very first writing session!", "✍️", newBadges);
        }

        // 2. 5,000 words
        if (currentTotalWords >= 5000) {
            unlockIfNotExists(goalId, "WORDS_5K", "5,000 Words", "You reached the 5,000 words milestone!", "📜", newBadges);
        }

        // 3. 10,000 words
        if (currentTotalWords >= 10000) {
            unlockIfNotExists(goalId, "WORDS_10K", "10,000 Words", "A solid chapter! 10,000 words on your manuscript.", "📖", newBadges);
        }

        // 4. 25,000 words
        if (currentTotalWords >= 25000) {
            unlockIfNotExists(goalId, "WORDS_25K", "Halfway There", "25,000 words! Your story is taking wonderful shape.", "🕯️", newBadges);
        }

        // 5. 50,000 words
        if (currentTotalWords >= 50000) {
            unlockIfNotExists(goalId, "WORDS_50K", "NaNoWriMo Legend", "50,000 words reached! An epic literary triumph.", "🏆", newBadges);
        }

        // 6. Target Goal Met
        if (currentTotalWords >= goal.getTargetWords()) {
            unlockIfNotExists(goalId, "GOAL_COMPLETED", "Goal Conquered!", "You reached your target word count!", "🎉", newBadges);
        }

        // 7. 5,000 words in a single day
        boolean had5kDay = dailyTotals.values().stream().anyMatch(w -> w >= 5000);
        if (had5kDay) {
            unlockIfNotExists(goalId, "DAY_5K", "Inspired Marathon", "You wrote more than 5,000 words in a single day!", "⚡", newBadges);
        }

        // 8. Streak 3 days
        if (streakDays >= 3) {
            unlockIfNotExists(goalId, "STREAK_3", "Unstoppable Flow", "You wrote for 3 consecutive days!", "🔥", newBadges);
        }

        // 9. Streak 7 days
        if (streakDays >= 7) {
            unlockIfNotExists(goalId, "STREAK_7", "Master Habit", "A full week of dedicated daily writing!", "👑", newBadges);
        }

        return newBadges;
    }

    private void unlockIfNotExists(Long goalId, String code, String title, String description, String icon, List<Badge> list) {
        if (!badgeRepository.existsByGoalIdAndCode(goalId, code)) {
            Badge badge = new Badge(goalId, code, title, description, icon);
            badgeRepository.save(badge);
            list.add(badge);
        }
    }
}
