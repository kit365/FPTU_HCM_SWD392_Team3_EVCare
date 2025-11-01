package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "warranty_packages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarrantyPackageEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID warrantyPackageId;

    @Column(name = "warranty_package_name", nullable = false)
    String warrantyPackageName;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "warranty_period_months")
    Integer warrantyPeriodMonths; // Thời gian bảo hành (tháng)

    @Column(name = "start_date")
    LocalDateTime startDate; // Ngày bắt đầu hiệu lực gói bảo hành

    @Column(name = "end_date")
    LocalDateTime endDate; // Ngày kết thúc hiệu lực gói bảo hành

    @Column(name = "search", length = 255)
    String search;

    @OneToMany(mappedBy = "warrantyPackage", fetch = FetchType.LAZY)
    List<WarrantyPackagePartEntity> warrantyPackageParts;
}

