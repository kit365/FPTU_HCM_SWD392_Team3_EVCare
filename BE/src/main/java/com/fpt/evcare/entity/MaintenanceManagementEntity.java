package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.MaintenanceManagementStatusEnum;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "maintenance_managements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MaintenanceManagementEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID maintenanceManagementId;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    AppointmentEntity appointment;

    @ManyToOne
    @JoinColumn(name = "service_type_id")
    ServiceTypeEntity serviceType;

    @Column(name = "start_time")
    LocalDateTime startTime;

    @Column(name = "end_time")
    LocalDateTime endTime;

    @Column(name = "total_cost")
    BigDecimal totalCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    MaintenanceManagementStatusEnum status;

    @Column(name = "notes")
    String notes;

    @Column(name = "search")
    String search;

    @OneToMany(mappedBy = "maintenanceManagement", fetch = FetchType.LAZY)
    List<MaintenanceRecordEntity> maintenanceRecords = new ArrayList<>();
}
