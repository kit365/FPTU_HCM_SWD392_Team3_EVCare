package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.payment_method.CreationPaymentMethodRequest;
import com.fpt.evcare.dto.request.payment_method.UpdationPaymentMethodRequest;
import com.fpt.evcare.dto.response.PaymentMethodResponse;
import com.fpt.evcare.entity.PaymentMethodEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentMethodMapper {

    @Mapping(target = "paymentMethodId", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lastUsedAt", ignore = true)
    @Mapping(target = "search", ignore = true)
    PaymentMethodEntity toEntity(CreationPaymentMethodRequest creationPaymentMethodRequest);

    @Mapping(target = "user", ignore = true)
    PaymentMethodResponse toResponse(PaymentMethodEntity paymentMethodEntity);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lastUsedAt", ignore = true)
    @Mapping(target = "search", ignore = true)
    void toUpdate(@MappingTarget PaymentMethodEntity paymentMethodEntity, UpdationPaymentMethodRequest updationPaymentMethodRequest);
}
