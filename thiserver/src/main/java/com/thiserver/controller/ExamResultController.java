package com.thiserver.controller;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.service.exam.ExamService;
import com.thiserver.service.exam.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-exams")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ExamResultController {

    @Autowired 
    private ResultService resultService;

    @Autowired 
    private ExamService examService; 
    
    @Autowired
    private ExamRepository examRepo;
    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        List<Exam> exams = examRepo.findAll();
        if (exams != null) {
            exams.forEach(exam -> exam.setQuestions(null));
        }
        
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamDetail(@PathVariable Long id) {
        Exam exam = examService.getExamForStudent(id);
        if (exam != null) {
            return ResponseEntity.ok(exam);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{examId}/questions")
    public ResponseEntity<List<Questions>> getExamQuestions(@PathVariable Long examId) {
        Exam exam = examService.getExamForStudent(examId);
        if (exam != null) {
            return ResponseEntity.ok(exam.getQuestions());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/toggle-shuffle")
    public ResponseEntity<Exam> toggleShuffle(@PathVariable Long id) {
        Exam updatedExam = examService.toggleShuffleStatus(id);
        if (updatedExam != null) {
            return ResponseEntity.ok(updatedExam);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/submit")
    public ResponseEntity<Result> submitTest(@RequestBody SubmissionDTO submission) {
        Result finalResult = resultService.submitExam(submission);
        return ResponseEntity.ok(finalResult);
    }
}