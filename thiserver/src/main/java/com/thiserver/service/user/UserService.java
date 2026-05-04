package com.thiserver.service.user;

import com.thiserver.entities.User;

public interface UserService {
    User createUser(User user);
    Boolean hasUserWithEmail(String email);
    User login(User user);
}
