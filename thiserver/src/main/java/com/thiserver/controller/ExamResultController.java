package com.thiserver.controller;

import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
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