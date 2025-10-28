package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.invoice.CreationInvoiceRequest;
import com.fpt.evcare.dto.request.invoice.UpdationInvoiceRequest;
import com.fpt.evcare.dto.response.InvoiceResponse;
import com.fpt.evcare.entity.InvoiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

    @Mapping(target = "invoiceId", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "invoiceDate", ignore = true)
    @Mapping(target = "search", ignore = true)
    InvoiceEntity toEntity(CreationInvoiceRequest creationInvoiceRequest);

    @Mapping(source = "appointment.appointmentId", target = "appointmentId")
    @Mapping(source = "appointment.customerFullName", target = "customerName")
    @Mapping(source = "appointment.customerEmail", target = "customerEmail")
    @Mapping(source = "appointment.customerPhoneNumber", target = "customerPhone")
    @Mapping(source = "paymentMethod.paymentMethodId", target = "paymentMethodId")
    @Mapping(target = "paymentMethodName", expression = "java(invoiceEntity.getPaymentMethod() != null && invoiceEntity.getPaymentMethod().getMethodType() != null ? invoiceEntity.getPaymentMethod().getMethodType().name() : null)")
    InvoiceResponse toResponse(InvoiceEntity invoiceEntity);

    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "search", ignore = true)
    void toUpdate(@MappingTarget InvoiceEntity invoiceEntity, UpdationInvoiceRequest updationInvoiceRequest);
}
