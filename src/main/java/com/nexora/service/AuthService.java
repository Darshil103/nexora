package com.nexora.service;

import com.nexora.dto.*;
import com.nexora.entity.User;
import com.nexora.entity.Wallet;
import com.nexora.repository.UserRepository;
import com.nexora.repository.WalletRepository;
import com.nexora.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User.UserType userType;
        try {
            userType = User.UserType.valueOf(request.getUserType());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid user type. Must be INVESTOR or STARTUP_FOUNDER");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .userType(userType)
                .build();

        user = userRepository.save(user);

        // Create wallet for investors
        if (userType == User.UserType.INVESTOR) {
            Wallet wallet = Wallet.builder().user(user).build();
            walletRepository.save(wallet);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getUserType().name(), user.getId());
        return AuthResponse.builder().token(token).user(toDTO(user)).build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getStatus() == User.UserStatus.SUSPENDED) {
            throw new RuntimeException("Account is suspended. Contact support.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getUserType().name(), user.getId());
        return AuthResponse.builder().token(token).user(toDTO(user)).build();
    }

    public static UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .userType(user.getUserType().name())
                .status(user.getStatus().name())
                .kycStatus(user.getKycStatus().name())
                .panNumber(user.getPanNumber())
                .aadhaarNumber(user.getAadhaarNumber())
                .kycApprovedDate(user.getKycApprovedDate())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
