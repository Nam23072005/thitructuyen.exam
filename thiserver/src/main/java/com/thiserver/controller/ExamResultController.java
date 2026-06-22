package com.thiserver.controller;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Options;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.ResultRepository;
import com.thiserver.repository.UserRepository;
import com.thiserver.service.exam.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-exams")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ExamResultController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/{id}/toggle-shuffle")
    public ResponseEntity<Exam> toggleShuffle(@PathVariable Long id) {
        return examRepository.findById(id).map(exam -> {
            exam.setShuffled(!exam.isShuffled());
            Exam updatedExam = examRepository.save(exam);
            return ResponseEntity.ok(updatedExam);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamDetail(@PathVariable Long id) {
        return examRepository.findById(id)
                .map(exam -> {
                    if (exam.getQuestions() != null) {
                        exam.setQuestions(null);
                    }
                    return ResponseEntity.ok(exam);
                })
                .orElse(ResponseEntity.notFound().build());
    }

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
                    // 1. Kiểm tra số lần làm bài của học sinh
                    long takenAttempts = resultRepository.countByUser_IdAndExam_Id(userId, examId);
                    if (takenAttempts >= exam.getMaxAttempts()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Bạn đã hết lượt làm bài thi này!"));
                    }

                    List<Questions> originalQuestions = exam.getQuestions();

                    if (originalQuestions == null || originalQuestions.isEmpty()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Đề thi này hiện tại chưa có câu hỏi nào. Vui lòng liên hệ giáo viên!"));
                    }

                    List<Questions> shuffledQuestions = new ArrayList<>();
                    for (Questions q : originalQuestions) {
                        Questions newQ = new Questions();
                        newQ.setId(q.getId());
                        newQ.setContent(q.getContent());
                        
                        if (q.getOptions() != null) {
                            List<Options> shuffledOptions = new ArrayList<>();
                            for (Options o : q.getOptions()) {
                                Options newO = new Options();
                                newO.setId(o.getId());
                                newO.setOptionText(o.getOptionText());
                                newO.setCorrect(o.isCorrect());
                                shuffledOptions.add(newO);
                            }
                            Collections.shuffle(shuffledOptions);
                            newQ.setOptions(shuffledOptions);
                        }
                        shuffledQuestions.add(newQ);
                    }

                    if (!shuffledQuestions.isEmpty()) {
                        Collections.shuffle(shuffledQuestions);
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