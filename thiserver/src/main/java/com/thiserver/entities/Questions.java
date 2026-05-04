package com.thiserver.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Questions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnore // Tránh vòng lặp vô tận khi trả về JSON
    private Exam exam;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<Options> options;
}
