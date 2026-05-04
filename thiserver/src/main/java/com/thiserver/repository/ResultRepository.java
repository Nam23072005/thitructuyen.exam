package com.thiserver.repository;

import com.thiserver.entities.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result,Long> {
    List<Result> findByExamId(Long examId);
}
