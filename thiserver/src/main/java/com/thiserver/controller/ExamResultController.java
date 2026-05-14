package com.thiserver.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.ResultRepository;
import com.thiserver.service.exam.ResultService;

@RestController
@RequestMapping("/api/user-exams")
@CrossOrigin("*")
public class ExamResultController {
    
    @Autowired ResultRepository resultRepository;

    @Autowired 
    private ResultService resultService;

    @Autowired 
    private ExamRepository examRepository;

    @GetMapping("/active")
    public ResponseEntity<List<Exam>> getActiveExams() {
        List<Exam> activeExams = examRepository.findAll()
                .stream()
                .filter(Exam::isActive)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activeExams);
    }
    
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Result>> getHistory(@PathVariable Long userId) {
       List<Result> results = resultRepository.findByUserId(userId);
       return ResponseEntity.ok(results);
    }

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
}