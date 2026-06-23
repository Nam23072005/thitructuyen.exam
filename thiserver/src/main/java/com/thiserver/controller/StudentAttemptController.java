package com.thiserver.controller;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user-exams") // ĐÃ SỬA: Đổi từ student-attempts sang user-exams cho khớp với Angular đang gọi
@CrossOrigin(origins = "*", allowedHeaders = "*") // ĐÃ FIX CORS triệt để
public class StudentAttemptController {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private ExamRepository examRepository;

    @GetMapping("/{id}/check-attempts")
    public ResponseEntity<?> checkAttempts(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Exam exam = examRepository.findById(id).orElse(null);
            int maxAttempts = (exam != null) ? exam.getMaxAttempts() : 1; 

            // ĐÃ TỐI ƯU: Dùng hàm count có sẵn trong DB, không dùng findAll() gây chậm hệ thống
            long takenAttempts = resultRepository.countByUser_IdAndExam_Id(userId, id);

            // So sánh điều kiện cho phép làm bài
            boolean allowed = takenAttempts < maxAttempts;

            System.out.println("[Check] Học sinh: " + userId + " | Đề: " + id + " | Đã làm: " + takenAttempts + "/" + maxAttempts + " -> Cho phép: " + allowed);

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