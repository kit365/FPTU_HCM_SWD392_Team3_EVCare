package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AccountConstants;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.entity.AccountEntity;
import com.fpt.evcare.exception.DisabledException;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.service.AccountService;
import com.fpt.evcare.service.AuthService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    PasswordEncoder passwordEncoder;
    AccountService accountService;
    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        AccountEntity account = accountService.findByEmail(loginRequest.getEmail());

        validateAccount(account);

        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(),
                account.getPassword());

        if (!authenticated) {
            if (log.isErrorEnabled()) {
                log.error(AuthConstants.ERR_INVALID_PASSWORD);
            }
            throw new InvalidCredentialsException(AuthConstants.ERR_INVALID_PASSWORD);
        }


        log.info(AuthConstants.SUCCESS_ACCOUNT_LOGIN, loginRequest.getEmail());
        LoginResponse response = new LoginResponse();
        response.setToken("demo-token");
        response.setAuthenticated(true);
        return response;

    }

    private void validateAccount(AccountEntity account) {
        if (Boolean.TRUE.equals(account.getIsDeleted())) {
            log.error(AccountConstants.ERR_ACCOUNT_DELETED);
            throw new DisabledException(AccountConstants.ERR_ACCOUNT_DELETED);
        }
        // sau này thêm: locked, expired... cũng nhét ở đây
    }
}
