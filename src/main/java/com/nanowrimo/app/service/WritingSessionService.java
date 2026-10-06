package com.nanowrimo.app.service;

import com.nanowrimo.app.dto.SessionRequest;
import com.nanowrimo.app.model.Goal;
import com.nanowrimo.app.model.WritingSession;
import com.nanowrimo.app.repository.GoalRepository;
import com.nanowrimo.app.repository.WritingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class WritingSessionService {

    private final WritingSessionRepository writingSessionRepository;
    private final GoalRepository goalRepository;

    public WritingSessionService(WritingSessionRepository writingSessionRepository,
                                 GoalRepository goalRepository) {
        this.writingSessionRepository = writingSessionRepository;
        this.goalRepository = goalRepository;
    }

    public List<WritingSession> getSessionsForGoal(Long goalId) {
        return writingSessionRepository.findByGoalIdOrderBySessionDateDescCreatedAtDesc(goalId);
    }

    @Transactional
    public WritingSession addSession(SessionRequest request) {
        Goal goal = goalRepository.findById(request.getGoalId())
                .orElseThrow(() -> new IllegalArgumentException("Goal not found with id: " + request.getGoalId()));

        int wordsToAdd = 0;
        if (request.getNewTotalCount() != null) {
            Long currentTotal = writingSessionRepository.getTotalWordsByGoalId(goal.getId());
            long current = currentTotal != null ? currentTotal : 0L;
            wordsToAdd = (int) (request.getNewTotalCount() - current);
        } else if (request.getWordsAdded() != null) {
            wordsToAdd = request.getWordsAdded();
        }

        // Se for uma meta por capítulos e tiver atualizado o capítulo
        if (request.getCurrentChapter() != null && request.getCurrentChapter() > 0) {
            goal.setCurrentUnitProgress(request.getCurrentChapter());
            goalRepository.save(goal);
        }

        LocalDate sessionDate = request.getSessionDate() != null ? request.getSessionDate() : LocalDate.now();
        LocalTime startTime = request.getStartTime() != null ? request.getStartTime() : LocalTime.now();

        WritingSession session = new WritingSession(
                goal,
                wordsToAdd,
                request.getCurrentChapter(),
                sessionDate,
                startTime,
                request.getEndTime(),
                request.getNotes()
        );

        return writingSessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        writingSessionRepository.deleteById(sessionId);
    }
}
