package com.nanowrimo.app.repository;

import com.nanowrimo.app.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOrderByCreatedAtDesc();

    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Project> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    long countByUserId(Long userId);

    @Query("SELECT DISTINCT p.series FROM Project p WHERE p.user.id = :userId AND p.series IS NOT NULL AND p.series <> ''")
    List<String> findDistinctSeriesByUserId(@Param("userId") Long userId);
}
