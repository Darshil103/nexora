package com.nexora.service;

import com.nexora.dto.TransactionDTO;
import com.nexora.dto.WalletDTO;
import com.nexora.entity.Transaction;
import com.nexora.entity.Wallet;
import com.nexora.repository.TransactionRepository;
import com.nexora.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;

    public WalletDTO getWallet(Long userId) {
        Wallet w = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return WalletDTO.builder()
                .id(w.getId()).balance(w.getBalance())
                .reservedBalance(w.getReservedBalance()).currency(w.getCurrency())
                .build();
    }

    @Transactional
    public WalletDTO deposit(Long userId, BigDecimal amount, String referenceId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Amount must be positive");
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        BigDecimal before = w.getBalance();
        w.setBalance(before.add(amount));
        walletRepository.save(w);

        Transaction t = Transaction.builder()
                .wallet(w).transactionType(Transaction.TransactionType.DEPOSIT)
                .amount(amount).balanceBefore(before).balanceAfter(w.getBalance())
                .description("Deposit via UPI").referenceId(referenceId != null ? referenceId : UUID.randomUUID().toString())
                .status(Transaction.TransactionStatus.COMPLETED).build();
        transactionRepository.save(t);

        return WalletDTO.builder().id(w.getId()).balance(w.getBalance())
                .reservedBalance(w.getReservedBalance()).currency(w.getCurrency()).build();
    }

    @Transactional
    public WalletDTO withdraw(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Amount must be positive");
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        BigDecimal available = w.getBalance().subtract(w.getReservedBalance());
        if (amount.compareTo(available) > 0) throw new RuntimeException("Insufficient available balance");

        BigDecimal before = w.getBalance();
        w.setBalance(before.subtract(amount));
        walletRepository.save(w);

        Transaction t = Transaction.builder()
                .wallet(w).transactionType(Transaction.TransactionType.WITHDRAWAL)
                .amount(amount).balanceBefore(before).balanceAfter(w.getBalance())
                .description("Withdrawal to bank").referenceId(UUID.randomUUID().toString())
                .status(Transaction.TransactionStatus.COMPLETED).build();
        transactionRepository.save(t);

        return WalletDTO.builder().id(w.getId()).balance(w.getBalance())
                .reservedBalance(w.getReservedBalance()).currency(w.getCurrency()).build();
    }

    @Transactional
    public void reserveBalance(Long userId, BigDecimal amount) {
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        BigDecimal available = w.getBalance().subtract(w.getReservedBalance());
        if (amount.compareTo(available) > 0) throw new RuntimeException("Insufficient balance");
        w.setReservedBalance(w.getReservedBalance().add(amount));
        walletRepository.save(w);
    }

    @Transactional
    public void releaseReserve(Long userId, BigDecimal amount) {
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        w.setReservedBalance(w.getReservedBalance().subtract(amount));
        if (w.getReservedBalance().compareTo(BigDecimal.ZERO) < 0) w.setReservedBalance(BigDecimal.ZERO);
        walletRepository.save(w);
    }

    @Transactional
    public void debitForTrade(Long userId, BigDecimal amount, BigDecimal reservedAmount, String desc) {
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        BigDecimal before = w.getBalance();
        
        if (before.compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance for trade execution. Required: " + amount + ", Available: " + before);
        }

        w.setBalance(before.subtract(amount));
        w.setReservedBalance(w.getReservedBalance().subtract(reservedAmount));
        if (w.getReservedBalance().compareTo(BigDecimal.ZERO) < 0) w.setReservedBalance(BigDecimal.ZERO);
        walletRepository.save(w);

        transactionRepository.save(Transaction.builder()
                .wallet(w).transactionType(Transaction.TransactionType.TRADE_BUY)
                .amount(amount).balanceBefore(before).balanceAfter(w.getBalance())
                .description(desc).status(Transaction.TransactionStatus.COMPLETED).build());
    }

    @Transactional
    public void creditForTrade(Long userId, BigDecimal amount, String desc) {
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        BigDecimal before = w.getBalance();
        w.setBalance(before.add(amount));
        walletRepository.save(w);

        transactionRepository.save(Transaction.builder()
                .wallet(w).transactionType(Transaction.TransactionType.TRADE_SELL)
                .amount(amount).balanceBefore(before).balanceAfter(w.getBalance())
                .description(desc).status(Transaction.TransactionStatus.COMPLETED).build());
    }

    public List<TransactionDTO> getTransactions(Long userId) {
        Wallet w = walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Wallet not found"));
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(w.getId()).stream()
                .map(t -> TransactionDTO.builder()
                        .id(t.getId()).transactionType(t.getTransactionType().name())
                        .amount(t.getAmount()).balanceBefore(t.getBalanceBefore()).balanceAfter(t.getBalanceAfter())
                        .description(t.getDescription()).status(t.getStatus().name())
                        .referenceId(t.getReferenceId()).createdAt(t.getCreatedAt().toString()).build())
                .toList();
    }
}
