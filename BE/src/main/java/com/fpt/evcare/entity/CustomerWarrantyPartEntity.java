package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity lưu thông tin bảo hành của customer cho từng phụ tùng
 * Khi customer sử dụng phụ tùng có warranty và thanh toán thành công,
 * warranty date sẽ được reset từ ngày thanh toán
 */
@Entity
@Table(name = "customer_warranty_parts", 
       uniqueConstraints = {
           @UniqueConstraint(
               name = "uk_customer_vehicle_part",
               columnNames = {"customer_id", "vehicle_part_id", "customer_email", "customer_phone_number"}
           )
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerWarrantyPartEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID customerWarrantyPartId;

    /**
     * Customer ID nếu là khách hàng đã đăng nhập
     * Null nếu là khách vãng lai
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    UserEntity customer;

    /**
     * Thông tin customer nếu là khách vãng lai (không có customer_id)
     */
    @Column(name = "customer_email")
    String customerEmail;

    @Column(name = "customer_phone_number")
    String customerPhoneNumber;

    @Column(name = "customer_full_name")
    String customerFullName;

    /**
     * Phụ tùng được bảo hành
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_part_id", nullable = false)
    VehiclePartEntity vehiclePart;

    /**
     * Appointment đã sử dụng phụ tùng này và reset warranty
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    AppointmentEntity appointment;

    /**
     * Ngày bắt đầu bảo hành (ngày thanh toán thành công)
     */
    @Column(name = "warranty_start_date", nullable = false)
    LocalDateTime warrantyStartDate;

    /**
     * Ngày kết thúc bảo hành (tính từ warranty_start_date + validity_period)
     */
    @Column(name = "warranty_end_date", nullable = false)
    LocalDateTime warrantyEndDate;

    /**
     * Số lượng phụ tùng được bảo hành trong appointment này
     */
    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "search")
    String search;
}

