package com.nexora.service;

import com.nexora.dto.AuditLogDTO;
import com.nexora.entity.AuditLog;
import com.nexora.entity.User;
import com.nexora.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(User user, String action, String entityType, Long entityId, String oldValue, String newValue, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogDTO> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).toList();
    }

    private AuditLogDTO toDTO(AuditLog log) {
        return AuditLogDTO.builder()
                .id(log.getId())
                .userFullName(log.getUser() != null ? log.getUser().getFullName() : "System")
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createdAt(log.getCreatedAt().toString())
                .build();
    }
}
