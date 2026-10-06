package com.nanowrimo.app.repository;

import com.nanowrimo.app.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByGoalIdOrderByUnlockedAtAsc(Long goalId);
    Optional<Badge> findByGoalIdAndCode(Long goalId, String code);
    boolean existsByGoalIdAndCode(Long goalId, String code);
}
