package com.thiserver.service.exam;

import java.util.List;
import java.util.Map;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;

public interface ExamService {
    Exam createOrUpdateExam(Exam exam);
    List<Exam> getExamsByTeacher(Long teacherId);
    void deleteExam(Long id);
    Questions addQuestion(Long examId, Questions question);
    Map<String, Object> getStatistics(Long examId);
    Exam toggleExamStatus(Long id);
    
    // dao de
    Exam shuffleExam(Long examId);
}