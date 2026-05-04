package com.thiserver.service.exam;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.QuestionRepository;
import com.thiserver.repository.ResultRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExamServiceImpl implements ExamService{
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
        // Gán ngược câu hỏi cho từng đáp án để JPA hiểu mối quan hệ
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
}
