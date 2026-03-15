package com.nexora.service;

import com.nexora.dto.UserDTO;
import com.nexora.entity.User;
import com.nexora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return AuthService.toDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return AuthService.toDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(AuthService::toDTO).toList();
    }

    public List<UserDTO> getUsersByType(String type) {
        return userRepository.findByUserType(User.UserType.valueOf(type)).stream().map(AuthService::toDTO).toList();
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        return AuthService.toDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO submitKyc(Long userId, String panNumber, String aadhaarNumber, String addressProof) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPanNumber(panNumber);
        user.setAadhaarNumber(aadhaarNumber);
        user.setAddressProof(addressProof);
        user.setKycStatus(User.KycStatus.PENDING);
        return AuthService.toDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO approveKyc(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycStatus(User.KycStatus.APPROVED);
        user.setKycApprovedDate(LocalDate.now());
        return AuthService.toDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO rejectKyc(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycStatus(User.KycStatus.REJECTED);
        return AuthService.toDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO suspendUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.UserStatus.SUSPENDED);
        return AuthService.toDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO activateUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.UserStatus.ACTIVE);
        return AuthService.toDTO(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public long countUsers() { return userRepository.count(); }
    public long countByType(String type) { return userRepository.countByUserType(User.UserType.valueOf(type)); }
    public long countPendingKyc() { return userRepository.countByKycStatus(User.KycStatus.PENDING); }

    public List<Map<String, Object>> getUserGrowth(int months) {
        List<User> allUsers = userRepository.findAll();
        
        Map<YearMonth, Long> countsByMonth = allUsers.stream()
            .collect(Collectors.groupingBy(u -> YearMonth.from(u.getCreatedAt()), Collectors.counting()));
            
        List<Map<String, Object>> result = new ArrayList<>();
        YearMonth startMonth = YearMonth.now().minusMonths(months - 1);
        
        long cumulative = allUsers.stream()
            .filter(u -> YearMonth.from(u.getCreatedAt()).isBefore(startMonth))
            .count();
            
        for (int i = 0; i < months; i++) {
            YearMonth ym = startMonth.plusMonths(i);
            cumulative += countsByMonth.getOrDefault(ym, 0L);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", ym.getMonth().name().substring(0, 3));
            monthData.put("users", cumulative);
            result.add(monthData);
        }
        
        return result;
    }
}
