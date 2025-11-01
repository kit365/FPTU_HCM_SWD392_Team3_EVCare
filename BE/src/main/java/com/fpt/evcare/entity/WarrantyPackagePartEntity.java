package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "warranty_package_parts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyPackagePartEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID warrantyPackagePartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warranty_package_id", nullable = false)
    WarrantyPackageEntity warrantyPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    VehicleEntity vehicle; // Xe được áp dụng bảo hành

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_part_inventory_id", nullable = false)
    VehiclePartEntity vehiclePart; // Phụ tùng được bảo hành

    @Column(name = "installed_date")
    LocalDateTime installedDate; // Ngày lắp đặt phụ tùng

    @Column(name = "warranty_expiry_date")
    LocalDateTime warrantyExpiryDate; // Ngày hết hạn bảo hành cho phụ tùng này

    @Column(name = "notes", length = 500)
    String notes;

    @Column(name = "search", length = 255)
    String search;
}

