package com.thiserver.controller;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.repository.ExamRepository;
import com.thiserver.service.exam.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "*")

public class TeacherController {
    @Autowired private ExamService examService;
    @Autowired private ExamRepository examRepository;

    @PostMapping("/exams")
    public Exam save(@RequestBody Exam exam) {
        return examService.createOrUpdateExam(exam);
    }

    @GetMapping("/exams/my/{teacherId}")
    public List<Exam> getMyExams(@PathVariable Long teacherId) {
        return examService.getExamsByTeacher(teacherId);
    }

    @PostMapping("/exams/{examId}/questions")
    public Questions addQ(@PathVariable Long examId, @RequestBody Questions q) {
        return examService.addQuestion(examId, q);
    }

    @PutMapping("/exam/{id}/toggle-status")
    public ResponseEntity<?> toggleExamStatus(@PathVariable Long id) {
        Exam updatedExam = examService.toggleExamStatus(id);
        if (updatedExam != null) {
            return ResponseEntity.ok(updatedExam);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/exams/{id}/stats")
    public Map<String, Object> getStats(@PathVariable Long id) {
        return examService.getStatistics(id);
    }

    @DeleteMapping("/exams/{id}")
    public void delete(@PathVariable Long id) {
        examService.deleteExam(id);
    }
}
