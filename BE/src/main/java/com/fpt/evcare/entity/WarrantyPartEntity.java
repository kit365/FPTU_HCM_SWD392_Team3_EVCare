package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.ValidityPeriodUnitEnum;
import com.fpt.evcare.enums.WarrantyDiscountTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "warranty_parts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyPartEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID warrantyPartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_part_id", nullable = false)
    VehiclePartEntity vehiclePart;

    @Column(name = "discount_type", nullable = false)
    @Enumerated(EnumType.STRING)
    WarrantyDiscountTypeEnum discountType;

    @Column(name = "discount_value", precision = 5, scale = 2)
    BigDecimal discountValue; // Phần trăm giảm giá (0-100) nếu discountType = PERCENTAGE, null nếu discountType = FREE

    @Column(name = "validity_period", nullable = false)
    Integer validityPeriod; // Số (2, 3, ...)

    @Column(name = "validity_period_unit", nullable = false)
    @Enumerated(EnumType.STRING)
    ValidityPeriodUnitEnum validityPeriodUnit; // DAY, MONTH, YEAR

    @Column(name = "search", length = 255)
    String search;

    @Version // Giúp kiểm soát version để tránh conflict khi update đồng thời
    Long version;
}
