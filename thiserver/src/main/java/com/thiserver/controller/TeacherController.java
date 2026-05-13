package com.thiserver.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.service.exam.ExamService;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "*")
public class TeacherController {
    
    @Autowired 
    private ExamService examService;

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

    @GetMapping("/exams/{id}/shuffle")
    public ResponseEntity<Exam> shuffleExam(@PathVariable Long id) {
        Exam shuffledExam = examService.shuffleExam(id);
        if (shuffledExam != null) {
            return ResponseEntity.ok(shuffledExam);
        }
        return ResponseEntity.notFound().build();
    }
}