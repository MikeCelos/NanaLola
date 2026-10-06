package com.nanowrimo.app.repository;

import com.nanowrimo.app.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findAllByOrderByCreatedAtDesc();

    List<Goal> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Goal> findByProjectIdAndArchivedOrderByCreatedAtDesc(Long projectId, boolean archived);

    Optional<Goal> findFirstByProjectIdAndArchivedFalseOrderByCreatedAtDesc(Long projectId);

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.project.user.id = :userId AND g.archived = true")
    long countArchivedGoalsByUserId(@Param("userId") Long userId);
}
