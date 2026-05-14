package com.thiserver.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thiserver.entities.Result;

public interface ResultRepository extends JpaRepository<Result,Long> {
    List<Result> findByExamId(Long examId);
    List<Result> findByUserId(Long userId);
}
