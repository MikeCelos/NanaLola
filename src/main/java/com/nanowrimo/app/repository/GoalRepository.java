package com.nanowrimo.app.repository;

import com.nanowrimo.app.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Goal> findAllByOrderByCreatedAtDesc();
}
