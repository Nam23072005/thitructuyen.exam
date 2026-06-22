package com.thiserver.repository;

import com.thiserver.entities.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom,Long> {
    // Tìm các lớp học do một giáo viên cụ thể quản lý
    List<Classroom> findByTeacherId(Long teacherId);

    // Tìm lớp học theo tên (dùng khi học sinh điền tên lớp như 68MHT2)
    Optional<Classroom> findByName(String name);
}
