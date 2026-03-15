package com.nexora.service;

import com.nexora.dto.SupportTicketDTO;
import com.nexora.entity.SupportTicket;
import com.nexora.entity.User;
import com.nexora.repository.SupportTicketRepository;
import com.nexora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public SupportTicketDTO createTicket(Long userId, String category, String subject, String description, String priority) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        SupportTicket ticket = SupportTicket.builder()
                .user(user).category(category).subject(subject).description(description)
                .priority(SupportTicket.Priority.valueOf(priority != null ? priority : "MEDIUM"))
                .build();
        return toDTO(ticketRepository.save(ticket));
    }

    public List<SupportTicketDTO> getMyTickets(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDTO).toList();
    }

    public List<SupportTicketDTO> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDTO).toList();
    }

    @Transactional
    public SupportTicketDTO updateStatus(Long ticketId, String status) {
        SupportTicket t = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        t.setStatus(SupportTicket.TicketStatus.valueOf(status));
        return toDTO(ticketRepository.save(t));
    }

    @Transactional
    public SupportTicketDTO assignTicket(Long ticketId, Long adminId) {
        SupportTicket t = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin not found"));
        t.setAssignedTo(admin);
        t.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
        return toDTO(ticketRepository.save(t));
    }

    private SupportTicketDTO toDTO(SupportTicket t) {
        return SupportTicketDTO.builder()
                .id(t.getId()).userId(t.getUser().getId()).userName(t.getUser().getFullName())
                .category(t.getCategory()).subject(t.getSubject()).description(t.getDescription())
                .status(t.getStatus().name()).priority(t.getPriority().name())
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null)
                .createdAt(t.getCreatedAt().toString()).updatedAt(t.getUpdatedAt().toString())
                .build();
    }
}
