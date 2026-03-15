package com.nexora.repository;

import com.nexora.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
    List<Transaction> findByWalletIdAndTransactionTypeOrderByCreatedAtDesc(Long walletId, Transaction.TransactionType type);
}
