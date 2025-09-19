package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.constants.AccountConstants;
import com.fpt.evcare.entity.AccountEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.AccountRepository;
import com.fpt.evcare.service.AccountService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountServiceImpl implements AccountService {

    AccountRepository accountRepository;

    @Override
    public AccountEntity findByEmail(String email) {
        AccountEntity account = accountRepository.findByEmail(email);
        if (account == null) {
            if (log.isErrorEnabled()) {
                log.error(AccountConstants.MESSAGE_ERR_ACCOUNT_NOT_FOUND);
            }
            throw new ResourceNotFoundException(AccountConstants.MESSAGE_ERR_ACCOUNT_NOT_FOUND);
        }
        return account;
    }
}
