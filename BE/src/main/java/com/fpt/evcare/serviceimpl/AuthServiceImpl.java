package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.constants.AccountConstants;
import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.entity.AccountEntity;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.AccountRepository;
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
    AccountRepository accountRepository;
    PasswordEncoder passwordEncoder;
    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        AccountEntity account = accountRepository.findByEmail(loginRequest.getEmail());
        if(account == null) {
            if(log.isErrorEnabled()) {
                log.error(AccountConstants.ERR_ACCOUNT_NOT_FOUND);
            }
            throw new ResourceNotFoundException(AccountConstants.ERR_ACCOUNT_NOT_FOUND);
        }
        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(),
                account.getPassword());

        if(!authenticated) {
            if(log.isErrorEnabled()){
                log.error(AuthConstants.ERR_INVALID_PASSWORD);
            }
            throw new InvalidCredentialsException(AuthConstants.ERR_INVALID_PASSWORD);
        }
        else  {
            log.info(AuthConstants.LOG_ACCOUNT_LOGIN_SUCCESS, loginRequest.getEmail());
            LoginResponse response = new LoginResponse();
            response.setToken("demo-token");
            response.setAuthenticated(true);
            return response;
        }
    }
}
