package com.thiserver.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "exams")
@Data
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private int duration; // Thời gian làm bài (phút)
    private Long teacherId;
    private boolean active = true;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Questions> questions;
    @ManyToMany(mappedBy = "allowedExams")
    @JsonIgnore
    private List<Classroom> classrooms;
}
