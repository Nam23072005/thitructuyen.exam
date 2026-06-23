package com.thiserver.controller;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.ResultRepository;
import com.thiserver.repository.UserRepository;
import com.thiserver.service.exam.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-exams")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ExamResultController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamDetail(@PathVariable Long id) {
        return examRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{examId}/questions")
    public ResponseEntity<List<Questions>> getExamQuestions(@PathVariable Long examId) {
        return examRepository.findById(examId)
                .map(exam -> ResponseEntity.ok(exam.getQuestions()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/submit")
    public ResponseEntity<Result> submitTest(@RequestBody SubmissionDTO submission) {
        Result finalResult = resultService.submitExam(submission);
        return ResponseEntity.ok(finalResult);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getResultsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(resultRepository.findByUser_Classroom_Id(classId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllExamsForTeacher() {
        return ResponseEntity.ok(examRepository.findAll());
    }

    // --- FIX LỖI 400: Tạo đúng Endpoint /active mà Angular đang gọi ---
    @GetMapping("/active")
    public ResponseEntity<?> getActiveExams() {
        // Lấy toàn bộ danh sách đề thi đang mở trên hệ thống
        return ResponseEntity.ok(examRepository.findAll());
    }

    // --- FIX LỖI CORS & THIẾU ENDPOINT: Lấy lịch sử thi của học sinh theo UserId ---
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getExamHistoryByUserId(@PathVariable Long userId) {
        // ĐÃ SỬA: Đổi findByUserId sang findByUser_Id để khớp chuẩn JPA Repository
        return ResponseEntity.ok(resultRepository.findByUser_Id(userId));
    }

    @GetMapping("/student/{studentId}/available-exams")
    public ResponseEntity<?> getAvailableExamsForStudent(@PathVariable Long studentId) {
        return userRepository.findById(studentId)
                .map(user -> {
                    if (user.getClassroom() != null) {
                        return ResponseEntity.ok(user.getClassroom().getAllowedExams());
                    }
                    return ResponseEntity.ok(new java.util.ArrayList<>());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}