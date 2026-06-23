package com.thiserver.repository;

import com.thiserver.entities.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByExamId(Long examId);
    List<Result> findByUser_Classroom_Id(Long classId);

    // Đếm số lần học sinh nộp bài dựa theo userId và examId
    long countByUser_IdAndExam_Id(Long userId, Long examId);
}