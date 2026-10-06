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
            unlockIfNotExists(goalId, "FIRST_SESSION", "Primeiras Linhas", "Escreveste a tua primeira sessão de escrita!", "✍️", newBadges);
        }

        // 2. 5,000 words
        if (currentTotalWords >= 5000) {
            unlockIfNotExists(goalId, "WORDS_5K", "5.000 Palavras", "Alcançaste a marca das primeiras 5.000 palavras!", "📜", newBadges);
        }

        // 3. 10,000 words
        if (currentTotalWords >= 10000) {
            unlockIfNotExists(goalId, "WORDS_10K", "10.000 Palavras", "Um marco importante! 10.000 palavras no teu projeto.", "📖", newBadges);
        }

        // 4. 25,000 words
        if (currentTotalWords >= 25000) {
            unlockIfNotExists(goalId, "WORDS_25K", "A Meio do Caminho", "25.000 palavras! A tua história está a ganhar corpo.", "🕯️", newBadges);
        }

        // 5. 50,000 words
        if (currentTotalWords >= 50000) {
            unlockIfNotExists(goalId, "WORDS_50K", "Lenda do NaNoWriMo", "50.000 palavras atingidas! Uma proeza literária épica.", "🏆", newBadges);
        }

        // 6. Target Goal Met
        if (currentTotalWords >= goal.getTargetWords()) {
            unlockIfNotExists(goalId, "GOAL_COMPLETED", "Meta Conquistada!", "Atingiste a meta final de palavras estabelecida!", "🎉", newBadges);
        }

        // 7. 5,000 words in a single day
        boolean had5kDay = dailyTotals.values().stream().anyMatch(w -> w >= 5000);
        if (had5kDay) {
            unlockIfNotExists(goalId, "DAY_5K", "Maratona Inspirada", "Escreveste mais de 5.000 palavras num único dia!", "⚡", newBadges);
        }

        // 8. Streak 3 days
        if (streakDays >= 3) {
            unlockIfNotExists(goalId, "STREAK_3", "Ritmo Imparável", "Escreveste durante 3 dias consecutivos!", "🔥", newBadges);
        }

        // 9. Streak 7 days
        if (streakDays >= 7) {
            unlockIfNotExists(goalId, "STREAK_7", "Hábito de Mestre", "Uma semana inteira sem falhar um único dia!", "👑", newBadges);
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
