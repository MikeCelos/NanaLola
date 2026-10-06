package com.nanowrimo.app.service;

import com.nanowrimo.app.dto.DailyStatDto;
import com.nanowrimo.app.dto.StatsResponse;
import com.nanowrimo.app.model.Goal;
import com.nanowrimo.app.model.WritingSession;
import com.nanowrimo.app.repository.GoalRepository;
import com.nanowrimo.app.repository.WritingSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class StatsService {

    private final GoalRepository goalRepository;
    private final WritingSessionRepository writingSessionRepository;
    private final BadgeService badgeService;

    private static final List<String> MOTIVATIONAL_QUOTES = List.of(
            "\"Escrever é que nem cavar um poço: a água é turva no início, depois clareia.\" — Gabriel García Márquez",
            "\"Não podes editar uma página em branco.\" — Jodi Picoult",
            "\"A primeira versão de qualquer coisa é sempre um rascunho de coragem.\" — Ernest Hemingway",
            "\"Escreve bêbado, edita sóbrio.\" — Peter De Vries",
            "\"Uma palavra após outra é poder.\" — Margaret Atwood",
            "\"O café transforma imaginação em prosa.\" — Provérbio de Escritor",
            "\"Cada frase escrita hoje aproxima o teu livro do mundo.\" — Vibe Cozy"
    );

    public StatsService(GoalRepository goalRepository,
                        WritingSessionRepository writingSessionRepository,
                        BadgeService badgeService) {
        this.goalRepository = goalRepository;
        this.writingSessionRepository = writingSessionRepository;
        this.badgeService = badgeService;
    }

    public StatsResponse calculateStats(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Meta não encontrada com id: " + goalId));

        List<WritingSession> sessions = writingSessionRepository.findByGoalIdOrderBySessionDateAscCreatedAtAsc(goalId);
        Long totalAppWords = writingSessionRepository.getTotalWordsApp();

        StatsResponse res = new StatsResponse();
        res.setProjectId(goal.getProject().getId());
        res.setProjectTitle(goal.getProject().getTitle());
        res.setProjectCoverUrl(goal.getProject().getCoverUrl());
        res.setGenre(goal.getProject().getGenre());
        res.setProjectSeries(goal.getProject().getSeries());

        res.setGoalId(goal.getId());
        res.setGoalTitle(goal.getTitle());
        res.setGoalType(goal.getType().name());
        res.setTargetWords(goal.getTargetWords());
        res.setTotalWordsApp(totalAppWords != null ? totalAppWords : 0);

        LocalDate startDate = goal.getStartDate();
        LocalDate endDate = goal.getEndDate();
        LocalDate today = LocalDate.now();

        res.setStartDate(startDate);
        res.setEndDate(endDate);

        long totalDaysLong = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        int totalDays = (int) Math.max(1, totalDaysLong);
        res.setTotalDays(totalDays);

        int originalDailyGoal = (int) Math.ceil((double) goal.getTargetWords() / totalDays);
        res.setOriginalDailyGoal(originalDailyGoal);

        // Agrupar palavras por data
        Map<LocalDate, Integer> dailyWordMap = new LinkedHashMap<>();
        int currentWords = 0;
        int bestDayWords = 0;
        LocalDate bestDayDate = null;

        for (WritingSession s : sessions) {
            LocalDate d = s.getSessionDate();
            int words = s.getWordsAdded() != null ? s.getWordsAdded() : 0;
            currentWords += words;
            dailyWordMap.put(d, dailyWordMap.getOrDefault(d, 0) + words);
        }

        // Determinar o melhor dia
        for (Map.Entry<LocalDate, Integer> entry : dailyWordMap.entrySet()) {
            if (entry.getValue() > bestDayWords) {
                bestDayWords = entry.getValue();
                bestDayDate = entry.getKey();
            }
        }

        res.setCurrentWords(currentWords);
        int remainingWords = Math.max(0, goal.getTargetWords() - currentWords);
        res.setRemainingWords(remainingWords);

        double progress = goal.getTargetWords() > 0 ? ((double) currentWords / goal.getTargetWords()) * 100.0 : 0.0;
        res.setProgressPercentage(Math.round(progress * 10.0) / 10.0);
        res.setCompleted(currentWords >= goal.getTargetWords());

        // Dias passados e restantes
        long daysElapsed = 1;
        if (today.isBefore(startDate)) {
            daysElapsed = 0;
        } else if (today.isAfter(endDate)) {
            daysElapsed = totalDays;
        } else {
            daysElapsed = ChronoUnit.DAYS.between(startDate, today) + 1;
        }
        res.setDaysElapsed((int) daysElapsed);

        long daysRemaining = 0;
        if (today.isBefore(startDate)) {
            daysRemaining = totalDays;
        } else if (today.isAfter(endDate)) {
            daysRemaining = 0;
        } else {
            daysRemaining = ChronoUnit.DAYS.between(today, endDate);
        }
        res.setDaysRemaining((int) daysRemaining);

        // Média diária restante
        int remainingDailyGoal = 0;
        if (remainingWords > 0) {
            long daysToCount = Math.max(1, daysRemaining);
            remainingDailyGoal = (int) Math.ceil((double) remainingWords / daysToCount);
        }
        res.setRemainingDailyGoal(remainingDailyGoal);

        // Média diária atingida
        int currentDailyAverage = 0;
        long activeDays = Math.max(1, daysElapsed);
        if (currentWords > 0) {
            currentDailyAverage = (int) Math.round((double) currentWords / activeDays);
        }
        res.setCurrentDailyAverage(currentDailyAverage);

        // Estimativa de data de fim
        if (remainingWords <= 0) {
            res.setEstimatedCompletionDate(today);
        } else if (currentDailyAverage > 0) {
            long daysNeeded = (long) Math.ceil((double) remainingWords / currentDailyAverage);
            res.setEstimatedCompletionDate(today.plusDays(daysNeeded));
        } else {
            res.setEstimatedCompletionDate(null);
        }

        res.setBestDayWords(bestDayWords);
        res.setBestDayDate(bestDayDate);

        // Verificar se hoje foi um novo recorde
        Integer todayWords = dailyWordMap.get(today);
        boolean isNewRecord = (todayWords != null && todayWords > 0 && todayWords.equals(bestDayWords) && dailyWordMap.size() > 1);
        res.setNewRecord(isNewRecord);

        // Cálculo de Streak (dias seguidos de escrita)
        int streak = 0;
        LocalDate checkDate = today;
        if (!dailyWordMap.containsKey(today) && dailyWordMap.containsKey(today.minusDays(1))) {
            checkDate = today.minusDays(1);
        }
        while (dailyWordMap.containsKey(checkDate) && dailyWordMap.get(checkDate) > 0) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }
        res.setStreakDays(streak);

        // Gerar estatísticas diárias para o gráfico (da startDate à endDate)
        List<DailyStatDto> dailyStats = new ArrayList<>();
        int runningCumulative = 0;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM");

        LocalDate cur = startDate;
        int dayIndex = 1;
        while (!cur.isAfter(endDate)) {
            int dayWords = dailyWordMap.getOrDefault(cur, 0);
            if (!cur.isAfter(today) || dayWords > 0) {
                runningCumulative += dayWords;
            }

            int expectedCumulative = Math.min(goal.getTargetWords(), (int) Math.round(originalDailyGoal * dayIndex));
            boolean isRecord = (dayWords > 0 && dayWords == bestDayWords);

            DailyStatDto stat = new DailyStatDto(
                    cur,
                    cur.format(fmt),
                    dayIndex,
                    cur.isAfter(today) && dayWords == 0 ? 0 : dayWords,
                    cur.isAfter(today) && dayWords == 0 ? 0 : runningCumulative,
                    expectedCumulative,
                    originalDailyGoal,
                    isRecord
            );
            dailyStats.add(stat);

            cur = cur.plusDays(1);
            dayIndex++;
        }
        res.setDailyStats(dailyStats);

        // Avaliar humor e mensagem motivacional
        int expectedToday = Math.min(goal.getTargetWords(), (int) Math.round(originalDailyGoal * Math.max(1, daysElapsed)));
        if (currentWords >= expectedToday) {
            res.setMoodStatus("HAPPY");
            res.setMoodEmoji("😊✨");
            res.setMoodMessage("Ritmo incrível! Estás acima da meta diária esperada. O teu livro está a voar!");
        } else if (currentWords >= expectedToday * 0.75) {
            res.setMoodStatus("NORMAL");
            res.setMoodEmoji("☕📖");
            res.setMoodMessage("Bom progresso! Pega numa chávena de café e escreve mais algumas linhas.");
        } else {
            res.setMoodStatus("ENCOURAGING");
            res.setMoodEmoji("🌱☕");
            res.setMoodMessage("Não desanimes! Cada palavra conta e ainda há tempo de recuperar. Respira fundo e continua.");
        }

        // Quote aleatória
        int quoteIdx = Math.abs((int) (goal.getId() + daysElapsed)) % MOTIVATIONAL_QUOTES.size();
        res.setMotivationalQuote(MOTIVATIONAL_QUOTES.get(quoteIdx));

        // Verificar badges
        badgeService.checkAndUnlockBadges(goal, currentWords, dailyWordMap, streak);
        res.setBadges(badgeService.getBadgesForGoal(goalId));

        return res;
    }
}
