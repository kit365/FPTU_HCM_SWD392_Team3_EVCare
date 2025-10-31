package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.PaymentMethodConstants;
import com.fpt.evcare.dto.request.payment_method.CreationPaymentMethodRequest;
import com.fpt.evcare.dto.request.payment_method.UpdationPaymentMethodRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.PaymentMethodResponse;
import com.fpt.evcare.entity.PaymentMethodEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.MethodTypeEnum;
import com.fpt.evcare.enums.PaymentMethodStatusEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.PaymentMethodMapper;
import com.fpt.evcare.repository.PaymentMethodRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.PaymentMethodService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
    public class PaymentMethodServiceImpl implements PaymentMethodService {

    PaymentMethodRepository paymentMethodRepository;
    PaymentMethodMapper paymentMethodMapper;
    UserRepository userRepository;

    @Override
    @Transactional
    public PaymentMethodResponse getPaymentMethodById(UUID id) {
        log.info(PaymentMethodConstants.LOG_INFO_SHOWING_PAYMENT_METHOD, id);
        PaymentMethodEntity paymentMethodEntity = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(id);
        if (paymentMethodEntity == null) {
            log.warn(PaymentMethodConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, id);
            throw new ResourceNotFoundException(PaymentMethodConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
        }
        
        PaymentMethodResponse response = paymentMethodMapper.toResponse(paymentMethodEntity);
        
        // Map user
        if (paymentMethodEntity.getUser() != null) {
            UserEntity user = paymentMethodEntity.getUser();
            com.fpt.evcare.dto.response.UserResponse userResponse = new com.fpt.evcare.dto.response.UserResponse();
            userResponse.setUserId(user.getUserId());
            userResponse.setFullName(user.getFullName());
            userResponse.setEmail(user.getEmail());
            response.setUser(userResponse);
        }
        
        log.info(PaymentMethodConstants.LOG_SUCCESS_SHOWING_PAYMENT_METHOD, id);
        return response;
    }

    @Override
    @Transactional
    public PageResponse<PaymentMethodResponse> searchPaymentMethod(Pageable pageable) {
        log.info(PaymentMethodConstants.LOG_INFO_SHOWING_PAYMENT_METHOD_LIST);
        Page<PaymentMethodEntity> paymentMethodEntityPage = paymentMethodRepository.findByIsDeletedFalse(pageable);
        
        return buildPageResponse(paymentMethodEntityPage);
    }

    @Override
    @Transactional
    public PageResponse<PaymentMethodResponse> getPaymentMethodsByUserId(UUID userId, Pageable pageable) {
        log.info(PaymentMethodConstants.LOG_INFO_SHOWING_USER_PAYMENT_METHODS, userId);
        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
        if (user == null) {
            log.warn(PaymentMethodConstants.LOG_ERR_USER_NOT_FOUND, userId);
            throw new ResourceNotFoundException(PaymentMethodConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        
        Page<PaymentMethodEntity> paymentMethodEntityPage = paymentMethodRepository.findByUserAndIsDeletedFalse(user, pageable);
        
        return buildPageResponse(paymentMethodEntityPage);
    }

    @Override
    @Transactional
    public PaymentMethodResponse addPaymentMethod(CreationPaymentMethodRequest request) {
        log.info(PaymentMethodConstants.LOG_INFO_CREATING_PAYMENT_METHOD);
        // Validate user
        UserEntity user = null;
        if (request.getUserId() != null) {
            user = userRepository.findByUserIdAndIsDeletedFalse(request.getUserId());
            if (user == null) {
                log.warn(PaymentMethodConstants.LOG_ERR_USER_NOT_FOUND, request.getUserId());
                throw new ResourceNotFoundException(PaymentMethodConstants.MESSAGE_ERR_USER_NOT_FOUND);
            }
        }
        
        // If setting as default, unset other default methods for this user
        if (request.getIsDefault() != null && request.getIsDefault() && user != null) {
            paymentMethodRepository.findByUserAndIsDefaultTrueAndIsDeletedFalse(user)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        paymentMethodRepository.save(existingDefault);
                    });
        }
        
        PaymentMethodEntity paymentMethodEntity = paymentMethodMapper.toEntity(request);
        paymentMethodEntity.setUser(user);
        
        // Set enums
        if (request.getMethodType() != null) {
            paymentMethodEntity.setMethodType(MethodTypeEnum.valueOf(request.getMethodType().toUpperCase()));
        }
        if (request.getStatus() != null) {
            paymentMethodEntity.setStatus(PaymentMethodStatusEnum.valueOf(request.getStatus().toUpperCase()));
        }
        
        // Build search field
        String search = buildSearchField(paymentMethodEntity);
        paymentMethodEntity.setSearch(search);
        
        PaymentMethodEntity savedPaymentMethod = paymentMethodRepository.save(paymentMethodEntity);
        
        PaymentMethodResponse response = paymentMethodMapper.toResponse(savedPaymentMethod);
        if (savedPaymentMethod.getUser() != null) {
            UserEntity savedUser = savedPaymentMethod.getUser();
            com.fpt.evcare.dto.response.UserResponse userResponse = new com.fpt.evcare.dto.response.UserResponse();
            userResponse.setUserId(savedUser.getUserId());
            userResponse.setFullName(savedUser.getFullName());
            userResponse.setEmail(savedUser.getEmail());
            response.setUser(userResponse);
        }
        
        log.info(PaymentMethodConstants.LOG_SUCCESS_CREATING_PAYMENT_METHOD, savedPaymentMethod.getPaymentMethodId());
        return response;
    }

    @Override
    @Transactional
    public boolean updatePaymentMethod(UUID id, UpdationPaymentMethodRequest request) {
        log.info(PaymentMethodConstants.LOG_INFO_UPDATING_PAYMENT_METHOD, id);
        PaymentMethodEntity paymentMethodEntity = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(id);
        if (paymentMethodEntity == null) {
            log.warn(PaymentMethodConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, id);
            throw new ResourceNotFoundException(PaymentMethodConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
        }
        
        // If setting as default, unset other default methods for this user
        if (request.getIsDefault() != null && request.getIsDefault() && paymentMethodEntity.getUser() != null) {
            paymentMethodRepository.findByUserAndIsDefaultTrueAndIsDeletedFalse(paymentMethodEntity.getUser())
                    .ifPresent(existingDefault -> {
                        if (!existingDefault.getPaymentMethodId().equals(id)) {
                            existingDefault.setIsDefault(false);
                            paymentMethodRepository.save(existingDefault);
                        }
                    });
        }
        
        // Update enums if provided
        if (request.getMethodType() != null) {
            paymentMethodEntity.setMethodType(MethodTypeEnum.valueOf(request.getMethodType().toUpperCase()));
        }
        if (request.getStatus() != null) {
            paymentMethodEntity.setStatus(PaymentMethodStatusEnum.valueOf(request.getStatus().toUpperCase()));
        }
        
        paymentMethodMapper.toUpdate(paymentMethodEntity, request);
        
        // Rebuild search field
        String search = buildSearchField(paymentMethodEntity);
        paymentMethodEntity.setSearch(search);
        
        paymentMethodRepository.save(paymentMethodEntity);
        log.info(PaymentMethodConstants.LOG_SUCCESS_UPDATING_PAYMENT_METHOD, id);
        return true;
    }

    @Override
    @Transactional
    public boolean deletePaymentMethod(UUID id) {
        log.info(PaymentMethodConstants.LOG_INFO_DELETING_PAYMENT_METHOD, id);
        PaymentMethodEntity paymentMethodEntity = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedFalse(id);
        if (paymentMethodEntity == null) {
            log.warn(PaymentMethodConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, id);
            throw new ResourceNotFoundException(PaymentMethodConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
        }
        paymentMethodEntity.setIsDeleted(true);
        paymentMethodRepository.save(paymentMethodEntity);
        log.info(PaymentMethodConstants.LOG_SUCCESS_DELETING_PAYMENT_METHOD, id);
        return true;
    }

    @Override
    @Transactional
    public boolean restorePaymentMethod(UUID id) {
        log.info(PaymentMethodConstants.LOG_INFO_RESTORING_PAYMENT_METHOD, id);
        PaymentMethodEntity paymentMethodEntity = paymentMethodRepository.findByPaymentMethodIdAndIsDeletedTrue(id);
        if (paymentMethodEntity == null) {
            log.warn(PaymentMethodConstants.LOG_ERR_PAYMENT_METHOD_NOT_FOUND, id);
            throw new ResourceNotFoundException(PaymentMethodConstants.MESSAGE_ERR_PAYMENT_METHOD_NOT_FOUND);
        }
        paymentMethodEntity.setIsDeleted(false);
        paymentMethodRepository.save(paymentMethodEntity);
        log.info(PaymentMethodConstants.LOG_SUCCESS_RESTORING_PAYMENT_METHOD, id);
        return true;
    }
    
    private String buildSearchField(PaymentMethodEntity paymentMethod) {
        StringBuilder search = new StringBuilder();
        if (paymentMethod.getPaymentMethodId() != null) {
            search.append(paymentMethod.getPaymentMethodId().toString().toLowerCase()).append(" ");
        }
        if (paymentMethod.getMethodType() != null) {
            search.append(paymentMethod.getMethodType().toString().toLowerCase()).append(" ");
        }
        if (paymentMethod.getProvider() != null) {
            search.append(paymentMethod.getProvider().toLowerCase()).append(" ");
        }
        if (paymentMethod.getAccountNumber() != null) {
            search.append(paymentMethod.getAccountNumber().toLowerCase()).append(" ");
        }
        if (paymentMethod.getNote() != null) {
            search.append(paymentMethod.getNote().toLowerCase()).append(" ");
        }
        return search.toString().trim();
    }
    
    private PageResponse<PaymentMethodResponse> buildPageResponse(Page<PaymentMethodEntity> paymentMethodEntityPage) {
        java.util.List<PaymentMethodResponse> paymentMethodResponses = paymentMethodEntityPage.map(paymentMethod -> {
            PaymentMethodResponse response = paymentMethodMapper.toResponse(paymentMethod);
            if (paymentMethod.getUser() != null) {
                UserEntity user = paymentMethod.getUser();
                com.fpt.evcare.dto.response.UserResponse userResponse = new com.fpt.evcare.dto.response.UserResponse();
                userResponse.setUserId(user.getUserId());
                userResponse.setFullName(user.getFullName());
                userResponse.setEmail(user.getEmail());
                response.setUser(userResponse);
            }
            return response;
        }).getContent();
        
        return PageResponse.<PaymentMethodResponse>builder()
                .data(paymentMethodResponses)
                .page(paymentMethodEntityPage.getNumber())
                .totalElements(paymentMethodEntityPage.getTotalElements())
                .totalPages(paymentMethodEntityPage.getTotalPages())
                .build();
    }
}
