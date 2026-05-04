package com.thiserver.service.user;

import com.thiserver.entities.User;
import com.thiserver.enums.UserRole;
import com.thiserver.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

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
