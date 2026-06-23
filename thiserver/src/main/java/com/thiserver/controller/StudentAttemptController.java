package com.thiserver.controller;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository; // 1. BỔ SUNG IMPORT NÀY
import com.thiserver.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student-attempts")
@CrossOrigin("*")
public class StudentAttemptController {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private ExamRepository examRepository; // 2. INJECT THÊM EXAM REPOSITORY

    @GetMapping("/{id}/check-attempts")
    public ResponseEntity<?> checkAttempts(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Exam exam = examRepository.findById(id).orElse(null);
            
  
            int maxAttempts = (exam != null) ? exam.getMaxAttempts() : 1; 

            // 4. Lọc số lần học sinh đã làm bài thực tế
            List<Result> allResults = resultRepository.findAll();
            long takenAttempts = allResults.stream()
                    .filter(r -> r.getUser() != null && r.getUser().getId().equals(userId))
                    .filter(r -> r.getExam() != null && r.getExam().getId().equals(id))
                    .count();

            // 5. So sánh điều kiện cho phép làm bài
            boolean allowed = takenAttempts < maxAttempts;

            System.out.println("[Độc lập] Học sinh: " + userId + " | Đề: " + id + " | Đã làm: " + takenAttempts + "/" + maxAttempts + " -> Cho phép: " + allowed);

            return ResponseEntity.ok(Map.of(
                "allowed", allowed,
                "takenAttempts", takenAttempts,
                "maxAttempts", maxAttempts
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi kiểm tra số lượt thi: " + e.getMessage());
        }
    }
}