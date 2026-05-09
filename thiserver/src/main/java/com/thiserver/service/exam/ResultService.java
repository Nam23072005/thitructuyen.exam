// Trong ExamService.java (hoặc tạo mới ResultService.java)
package com.thiserver.service.exam;
import com.thiserver.dto.SubmissionDTO;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Result;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.QuestionRepository;
import com.thiserver.repository.ResultRepository;
import com.thiserver.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class ResultService {
    @Autowired private QuestionRepository questionRepository;
    @Autowired private ResultRepository resultRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ExamRepository examRepository;

    public Result submitExam(SubmissionDTO submission) {
        double correctCount = 0;
        List<Questions> questions = examRepository.findById(submission.getExamId())
                                                  .get().getQuestions();

        for (SubmissionDTO.AnswerDTO ans : submission.getAnswers()) {
            // Tìm câu hỏi trong DB
            Questions q = questionRepository.findById(ans.getQuestionId()).orElse(null);
            if (q != null) {
                // Kiểm tra xem Option được chọn có isCorrect == true không
                boolean isCorrect = q.getOptions().stream()
                    .anyMatch(opt -> opt.getId().equals(ans.getSelectedOptionId()) && opt.isCorrect());
                
                if (isCorrect) correctCount++;
            }
        }

        double finalScore = (correctCount / questions.size()) * 10; // Thang điểm 10

        Result result = new Result();
        result.setUser(userRepository.findById(submission.getUserId()).get());
        result.setExam(examRepository.findById(submission.getExamId()).get());
        result.setScore(finalScore);
        result.setSubmitTime(LocalDateTime.now());

        return resultRepository.save(result);
    }
}