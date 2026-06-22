package com.thiserver.service.user;

import com.thiserver.entities.Classroom;
import com.thiserver.entities.User;
import com.thiserver.enums.UserRole;
import com.thiserver.repository.ClassroomRepository;
import com.thiserver.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @PostConstruct
    private void createAdminUser(){
        User optionalUser = userRepository.findByRole(UserRole.ADMIN);
        if (optionalUser == null){
            User user= new User();
            user.setName("admin");
            user.setPassword("admin");
            user.setEmail("admin@gmail.com");
            user.setRole(UserRole.ADMIN);

            userRepository.save(user);
        }
    }
    public Boolean hasUserWithEmail(String email){
        return userRepository.findFirstByEmail(email) != null;
    }
    public User createUser(User user) {
        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }


        // Xử lý logic tự động xếp lớp cho Học sinh
        if (user.getRole() == UserRole.USER && user.getClassroomName() != null && !user.getClassroomName().trim().isEmpty()) {

            // Chuẩn hóa tên lớp (Viết hoa hết, ví dụ: 68mht2 -> 68MHT2)
            String className = user.getClassroomName().trim().toUpperCase();

            // Tìm xem lớp này đã tồn tại trong DB chưa
            Classroom classroom = classroomRepository.findByName(className)
                    .orElseGet(() -> {

                        // Nếu database chưa có lớp này -> Tự động tạo mới
                        Classroom newClass = new Classroom();
                        newClass.setName(className);
                        return classroomRepository.save(newClass);
                    });

            // Gắn lớp học vừa tìm/tạo được vào cho học sinh này
            user.setClassroom(classroom);
        }

        return userRepository.save(user);
    }

    public User login(User user){
        Optional<User> optionalUser = userRepository.findByEmail(user.getEmail());
        if (optionalUser.isPresent() && user.getPassword().equals(optionalUser.get().getPassword())){
            return optionalUser.get();
        }
        return null;
    }
}
