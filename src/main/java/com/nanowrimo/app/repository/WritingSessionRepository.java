package com.nanowrimo.app.repository;

import com.nanowrimo.app.model.WritingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WritingSessionRepository extends JpaRepository<WritingSession, Long> {

    List<WritingSession> findByGoalIdOrderBySessionDateAscCreatedAtAsc(Long goalId);

    List<WritingSession> findByGoalIdOrderBySessionDateDescCreatedAtDesc(Long goalId);

    List<WritingSession> findByGoalIdAndSessionDate(Long goalId, LocalDate sessionDate);

    @Query("SELECT COALESCE(SUM(s.wordsAdded), 0) FROM WritingSession s")
    Long getTotalWordsApp();

    @Query("SELECT COALESCE(SUM(s.wordsAdded), 0) FROM WritingSession s WHERE s.goal.id = :goalId")
    Long getTotalWordsByGoalId(@Param("goalId") Long goalId);

    @Query("SELECT COALESCE(SUM(s.wordsAdded), 0) FROM WritingSession s WHERE s.goal.project.user.id = :userId")
    Long getTotalWordsByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM WritingSession s WHERE s.goal.project.user.id = :userId")
    List<WritingSession> findAllByUserId(@Param("userId") Long userId);
}
