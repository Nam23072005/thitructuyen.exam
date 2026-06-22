package com.thiserver.controller;

import com.thiserver.entities.Classroom;
import com.thiserver.entities.Exam;
import com.thiserver.entities.User;
import com.thiserver.repository.ClassroomRepository;
import com.thiserver.repository.ExamRepository;
import com.thiserver.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired private ExamRepository examRepository;

    // 1. Giáo viên tạo lớp học mới
    @PostMapping("/create")
    public ResponseEntity<?> createClassroom(@RequestBody Classroom classroom, @RequestParam Long teacherId) {
        if (classroomRepository.findByName(classroom.getName()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên lớp học này đã tồn tại!");
        }
        return userRepository.findById(teacherId).map(teacher -> {
            classroom.setTeacher(teacher);
            Classroom savedClass = classroomRepository.save(classroom);
            return ResponseEntity.ok(savedClass);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 2. Lấy danh sách lớp học của một giáo viên
    @GetMapping("/teacher/{teacherId}")
    public List<Classroom> getClassroomsByTeacher(@PathVariable Long teacherId) {
        return classroomRepository.findByTeacherId(teacherId);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllClassrooms() {
        return ResponseEntity.ok(classroomRepository.findAll());
    }

    // 3. Xem danh sách học sinh thuộc một lớp cụ thể
    @GetMapping("/{classId}/students")
    public ResponseEntity<?> getStudentsInClass(@PathVariable Long classId) {
        return classroomRepository.findById(classId).map(classroom -> {
            List<User> students = userRepository.findByClassroomId(classId);
            return ResponseEntity.ok(students);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{classId}/assign-exam/{examId}")
    @Transactional
    public ResponseEntity<?> assignExamToClass(@PathVariable Long classId, @PathVariable Long examId) {
        Classroom classroom = classroomRepository.findById(classId).orElse(null);
        Exam exam = examRepository.findById(examId).orElse(null);

        if (classroom == null || exam == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy lớp học hoặc đề thi!");
        }

        if (classroom.getAllowedExams() == null) {
            classroom.setAllowedExams(new java.util.ArrayList<>());
        }

        // Kiểm tra trùng lặp và thêm đề thi
        if (!classroom.getAllowedExams().contains(exam)) {
            classroom.getAllowedExams().add(exam);
            classroomRepository.save(classroom);
        }

        return ResponseEntity.ok("Giao đề thi thành công!");

    }

    // Lấy thông tin chi tiết của 1 lớp học bằng ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getClassroomById(@PathVariable Long id) {
        return classroomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // 1. API lấy danh sách đề thi ĐÃ GIAO cho lớp học này
    @GetMapping("/{classId}/exams")
    public ResponseEntity<?> getAssignedExams(@PathVariable Long classId) {
        Classroom classroom = classroomRepository.findById(classId).orElse(null);
        if (classroom == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy lớp học!");
        }
        // Trả về danh sách đề thi trong allowedExams
        return ResponseEntity.ok(classroom.getAllowedExams());
    }

    // 2. API Xóa đề thi đã chọn khỏi lớp học
    @DeleteMapping("/{classId}/remove-exam/{examId}")
    @Transactional // Ép lưu xuống DB luôn
    public ResponseEntity<?> removeExamFromClass(@PathVariable Long classId, @PathVariable Long examId) {
        Classroom classroom = classroomRepository.findById(classId).orElse(null);
        Exam exam = examRepository.findById(examId).orElse(null);

        if (classroom == null || exam == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy lớp học hoặc đề thi!");
        }

        // Nếu danh sách có chứa đề này thì tiến hành xóa
        if (classroom.getAllowedExams() != null && classroom.getAllowedExams().contains(exam)) {
            classroom.getAllowedExams().remove(exam);
            classroomRepository.save(classroom);
            return ResponseEntity.ok("Xóa đề thi khỏi lớp thành công!");
        }

        return ResponseEntity.badRequest().body("Đề thi này chưa được giao cho lớp!");
    }
}
