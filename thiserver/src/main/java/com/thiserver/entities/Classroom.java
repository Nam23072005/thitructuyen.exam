package com.thiserver.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên lớp, ví dụ: "68MHT2"
    @Column(unique = true)
    private String name;

    // Giáo viên quản lý lớp này
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonIgnore
    private User teacher;

    // Danh sách học sinh trong lớp
    @OneToMany(mappedBy = "classroom")
    @JsonIgnore
    private List<User> students;

    // Danh sách các đề thi mà lớp này ĐƯỢC PHÉP thi
    @ManyToMany
    @JoinTable(
            name = "class_exam",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "exam_id")
    )
    @JsonIgnore
    private List<Exam> allowedExams;
}
