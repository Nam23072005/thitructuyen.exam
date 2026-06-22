package com.thiserver.controller;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.ResultRepository;
import com.thiserver.repository.UserRepository; // 1. BỔ SUNG IMPORT NÀY
import com.thiserver.service.exam.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-exams")
@CrossOrigin("*")
public class ExamResultController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    // 2. BỔ SUNG REPOSITORY CỦA USER
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
        // Tìm toàn bộ điểm thi của các học sinh thuộc ID lớp học này
        return ResponseEntity.ok(resultRepository.findByUser_Classroom_Id(classId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllExamsForTeacher() {
        return ResponseEntity.ok(examRepository.findAll());
    }

    // 3. BỔ SUNG API NÀY CHO TRANG DASHBOARD CỦA HỌC SINH
    @GetMapping("/student/{studentId}/available-exams")
    public ResponseEntity<?> getAvailableExamsForStudent(@PathVariable Long studentId) {
        return userRepository.findById(studentId)
                .map(user -> {
                    // Kiểm tra xem học sinh này đã thuộc lớp nào chưa
                    if (user.getClassroom() != null) {
                        // Trả về danh sách đề thi đã được giáo viên giao cho lớp đó
                        return ResponseEntity.ok(user.getClassroom().getAllowedExams());
                    }
                    // Nếu chưa có lớp, trả về mảng rỗng
                    return ResponseEntity.ok(new java.util.ArrayList<>());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}