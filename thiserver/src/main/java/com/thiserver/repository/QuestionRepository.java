package com.thiserver.repository;

import com.thiserver.entities.Questions;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Questions,Long> {
}
