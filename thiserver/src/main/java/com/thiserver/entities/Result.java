package com.thiserver.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "result")
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double score; // Điểm số (ví dụ: 8.5)

    private LocalDateTime submitTime; // Thời điểm nộp bài

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // Học sinh nào làm?

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam; // Làm đề thi nào?

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Hàm này sẽ tự động chạy để lấy giờ hiện tại của máy tính ngay trước khi lưu vào Database
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
