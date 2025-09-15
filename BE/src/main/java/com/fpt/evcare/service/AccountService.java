package com.fpt.evcare.service;
import com.fpt.evcare.entity.AccountEntity;
import org.springframework.stereotype.Service;

@Service
public interface AccountService {
    AccountEntity findByEmail(String email);

}
