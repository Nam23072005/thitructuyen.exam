package com.thiserver.entities;

import com.thiserver.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;

    private UserRole role;
    @ManyToOne
    @JoinColumn(name = "class_id")
    private Classroom classroom;
    @Transient
    private String classroomName;
}
