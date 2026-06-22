package com.thiserver.service.exam;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.QuestionRepository;
import com.thiserver.repository.ResultRepository;

import jakarta.transaction.Transactional;

@Service
public class ExamServiceImpl implements ExamService {
    @Autowired private ExamRepository examRepo;
    @Autowired private QuestionRepository questionRepo;
    @Autowired private ResultRepository resultRepo;

    @Override
    public Exam createOrUpdateExam(Exam exam) {
        return examRepo.save(exam);
    }

    @Override
    public List<Exam> getExamsByTeacher(Long teacherId) {
        return examRepo.findByTeacherId(teacherId);
    }

    @Override
    public void deleteExam(Long id) {
        examRepo.deleteById(id);
    }

    @Override
    @Transactional
    public Questions addQuestion(Long examId, Questions question) {
        Exam exam = examRepo.findById(examId).orElseThrow();
        question.setExam(exam);
        if (question.getOptions() != null) {
            question.getOptions().forEach(opt -> opt.setQuestion(question));
        }
        return questionRepo.save(question);
    }

    @Override
    public Map<String, Object> getStatistics(Long examId) {
        List<Result> results = resultRepo.findByExamId(examId);
        Map<String, Object> stats = new HashMap<>();

        double avg = results.stream().mapToDouble(Result::getScore).average().orElse(0.0);
        long total = results.size();
        long passed = results.stream().filter(r -> r.getScore() >= 5.0).count();

        stats.put("avgScore", Math.round(avg * 100.0) / 100.0);
        stats.put("totalStudents", total);
        stats.put("passRate", total > 0 ? (passed * 100 / total) : 0);
        return stats;
    }

    @Override
    public Exam toggleExamStatus(Long id) {
        Optional<Exam> optionalExam = examRepo.findById(id);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            exam.setActive(!exam.isActive());
            return examRepo.save(exam);
        }
        return null;
    }

    @Override
    public Exam toggleShuffleStatus(Long id) {
        Optional<Exam> optionalExam = examRepo.findById(id);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            // Đổi trạng thái đảo đề động dựa trên thuộc tính mới
            exam.setShuffled(exam.getShuffled() == null ? true : !exam.getShuffled());
            return examRepo.save(exam);
        }
        return null;
    }

    @Override
    @Transactional
    public Exam getExamForStudent(Long examId) {
        Optional<Exam> optionalExam = examRepo.findById(examId);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            
            // Tự động kiểm tra trạng thái đảo đề động
            if (exam.getShuffled() != null && exam.getShuffled()) {
                if (exam.getQuestions() != null && !exam.getQuestions().isEmpty()) {
                    Collections.shuffle(exam.getQuestions());
                    for (Questions question : exam.getQuestions()) {
                        if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                            Collections.shuffle(question.getOptions());
                        }
                    }
                }
            }
            return exam;
        }
        return null;
    }

    @Override
    public Exam shuffleExam(Long examId) {
        return getExamForStudent(examId);
    }
}