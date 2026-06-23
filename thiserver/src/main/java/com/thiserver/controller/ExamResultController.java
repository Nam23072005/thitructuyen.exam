package com.thiserver.controller;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.ResultRepository;
import com.thiserver.repository.UserRepository;
import com.thiserver.service.exam.ExamService; 
import com.thiserver.service.exam.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-exams")
@CrossOrigin("*")
public class ExamResultController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private ExamService examService; // Tiêm ExamService để dùng hàm đảo đề chuẩn kiến trúc

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamDetail(@PathVariable Long id) {
        return examRepository.findById(id)
                .map(exam -> {
                    // Cắt bớt mảng câu hỏi khi lấy chi tiết cấu hình để giảm tải dữ liệu thừa
                    if (exam.getQuestions() != null) {
                        exam.setQuestions(null);
                    }
                    return ResponseEntity.ok(exam);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // BỔ SUNG: API phục vụ Angular check số lượt làm bài trước khi cho ấn nút "Vào thi"
    @GetMapping("/{examId}/check-attempts")
    public ResponseEntity<?> checkAttempts(@PathVariable Long examId, @RequestParam Long userId) {
        return examRepository.findById(examId).map(exam -> {
            long takenAttempts = resultRepository.countByUser_IdAndExam_Id(userId, examId);
            boolean isAllowed = takenAttempts < exam.getMaxAttempts();
            
            return ResponseEntity.ok(Map.of(
                "allowed", isAllowed,
                "takenAttempts", takenAttempts,
                "maxAttempts", exam.getMaxAttempts()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{examId}/questions")
    public ResponseEntity<?> getExamQuestions(@PathVariable Long examId, @RequestParam Long userId) {
        return examRepository.findById(examId)
                .map(exam -> {
                    // 1. Kiểm tra số lần làm bài của học sinh này trong DB
                    long takenAttempts = resultRepository.countByUser_IdAndExam_Id(userId, examId);
                    if (takenAttempts >= exam.getMaxAttempts()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Bạn đã hết lượt làm bài thi này!"));
                    }

                    // 2. Gọi tầng Service xử lý đảo đề thi 
                    List<Questions> shuffledQuestions = examService.getShuffledQuestionsForStudent(examId);
                    
                    // 3. Nếu đề rỗng (chưa có câu hỏi hoặc bị lỗi mất câu hỏi), báo lỗi trực tiếp
                    if (shuffledQuestions.isEmpty()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Đề thi này hiện tại chưa có câu hỏi nào. Vui lòng liên hệ giáo viên!"));
                    }

                    return ResponseEntity.ok(shuffledQuestions);
                })
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
        List<Exam> exams = examRepository.findAll();
        if (exams != null) {
            exams.forEach(exam -> exam.setQuestions(null));
        }
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/student/{studentId}/available-exams")
    public ResponseEntity<?> getAvailableExamsForStudent(@PathVariable Long studentId) {
        return userRepository.findById(studentId)
                .map(user -> {
                    if (user.getClassroom() != null) {
                        List<Exam> allowedExams = user.getClassroom().getAllowedExams();
                        if (allowedExams != null) {
                            allowedExams.forEach(exam -> exam.setQuestions(null));
                        }
                        return ResponseEntity.ok(allowedExams);
                    }
                    return ResponseEntity.ok(new java.util.ArrayList<>());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}