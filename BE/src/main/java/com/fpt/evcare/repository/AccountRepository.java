package com.fpt.evcare.repository;

import com.fpt.evcare.entity.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<AccountEntity, UUID> {

    AccountEntity findByEmail(String email);
}
