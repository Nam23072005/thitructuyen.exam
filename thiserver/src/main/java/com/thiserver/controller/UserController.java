package com.thiserver.controller;

import com.thiserver.entities.User;
import com.thiserver.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/sign-up")
    public ResponseEntity<?> signupUser(@RequestBody User user){
        if(userService.hasUserWithEmail(user.getEmail())){
            return new ResponseEntity<>("Người dùng đã tồn tại", HttpStatus.NOT_ACCEPTABLE);
        }
        User createUser = userService.createUser(user);
        if (createUser == null){
            return new ResponseEntity<>("Người dùng chưa được tạo",HttpStatus.NOT_ACCEPTABLE);
        }
        return new ResponseEntity<>(createUser,HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User dbUser = userService.login(user);

        if (dbUser == null) {
            return new ResponseEntity<>("Sai điều kiện", HttpStatus.NOT_ACCEPTABLE);
        }

        return new ResponseEntity<>(dbUser, HttpStatus.OK);
    }
}
