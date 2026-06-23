package com.thiserver.service.exam;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.thiserver.entities.Exam;
import com.thiserver.entities.Questions;
import com.thiserver.entities.Options;
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
    public Exam createOrUpdateExam(Exam examDto) {
        if (examDto.getId() != null) {
            return examRepo.findById(examDto.getId()).map(existingExam -> {
                existingExam.setTitle(examDto.getTitle());
                existingExam.setDescription(examDto.getDescription());
                existingExam.setDuration(examDto.getDuration());
                existingExam.setMaxAttempts(examDto.getMaxAttempts());
                if (examDto.getTeacherId() != null) {
                    existingExam.setTeacherId(examDto.getTeacherId());
                }
                return examRepo.save(existingExam);
            }).orElseThrow(() -> new RuntimeException("Không tìm thấy đề thi với ID: " + examDto.getId()));
        }
        return examRepo.save(examDto);
    }

    // BỔ SUNG HÀM LOGIC ĐẢO ĐỀ CHUẨN Ở TẦNG SERVICE
    @Override
    public List<Questions> getShuffledQuestionsForStudent(Long examId) {
        Exam exam = examRepo.findById(examId).orElse(null);
        if (exam == null || exam.getQuestions() == null) {
            return new ArrayList<>();
        }

        List<Questions> originalQuestions = exam.getQuestions();
        List<Questions> shuffledQuestions = new ArrayList<>();

        // Thực hiện sao chép sâu (Deep Copy) để tránh làm xáo trộn dữ liệu gốc trong DB
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
                // Trộn đáp án nếu cấu hình đề cho phép (hoặc mặc định trộn)
                Collections.shuffle(shuffledOptions);
                newQ.setOptions(shuffledOptions);
            }
            shuffledQuestions.add(newQ);
        }

        // Trộn thứ tự các câu hỏi
        if (!shuffledQuestions.isEmpty()) {
            Collections.shuffle(shuffledQuestions);
        }

        return shuffledQuestions;
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
    public Exam shuffleExam(Long examId) {
        Optional<Exam> optionalExam = examRepo.findById(examId);
        if (optionalExam.isPresent()) {
            Exam exam = optionalExam.get();
            if (exam.getQuestions() != null && !exam.getQuestions().isEmpty()) {
                Collections.shuffle(exam.getQuestions());
                for (Questions question : exam.getQuestions()) {
                    if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                        Collections.shuffle(question.getOptions());
                    }
                }
            }
            return exam; 
        }
        return null;
    }
}