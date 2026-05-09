package com.thiserver.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubmissionDTO {
    private Long userId;
    private Long examId;
    private List<AnswerDTO> answers;

    @Data
    public static class AnswerDTO {
        private Long questionId;
        private Long selectedOptionId;
    }
}