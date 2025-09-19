package com.registremedical.service;

import com.registremedical.dto.LoginRequest;
import com.registremedical.dto.LoginResponse;
import com.registremedical.dto.RegisterRequest;
import com.registremedical.entity.User;
import com.registremedical.enums.UserRole;
import com.registremedical.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            
            User user = userService.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            String token = jwtTokenProvider.generateToken(authentication.getName());
            
            return new LoginResponse(token, user);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la connexion: " + e.getMessage());
        }
    }
    
    public User register(RegisterRequest registerRequest) {
        if (userService.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("L'email est déjà utilisé");
        }
        
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setNom(registerRequest.getNom());
        user.setPrenom(registerRequest.getPrenom());
        user.setTelephone(registerRequest.getTelephone());
        user.setRole(UserRole.valueOf(registerRequest.getRole()));
        
        return userService.save(user);
    }
}
