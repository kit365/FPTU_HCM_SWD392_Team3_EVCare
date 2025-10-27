package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
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
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID appointmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    UserEntity customer;

    @Column(name = "customer_full_name")
    String customerFullName;

    @Column(name = "customer_phone_number")
    String customerPhoneNumber;

    @Column(name = "customer_email")
    String customerEmail;

    @ManyToMany
    @JoinTable(
            name = "appointment_technicians",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name ="technician_id")
    )
    List<UserEntity> technicianEntities = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    UserEntity assignee;
    
    @Column(name = "service_mode")
    @Enumerated(EnumType.STRING)
    ServiceModeEnum serviceMode;

    @ManyToOne()
    @JoinColumn(name = "vehicle_type_id")
    VehicleTypeEntity vehicleTypeEntity;

    String vehicleNumberPlate;

    String vehicleKmDistances;

    @Column(name = "user_address")
    String userAddress;

    @Column(name = "scheduled_at")
    LocalDateTime scheduledAt;

    @Column(name = "quote_price")
    BigDecimal quotePrice;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    AppointmentStatusEnum status = AppointmentStatusEnum.PENDING;

    @Column(name = "notes")
    String notes;

    @Column(name = "search")
    String search;

    @ManyToMany
    @JoinTable(
            name = "appointment_service_types",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "Service_type_id")
    )
    List<ServiceTypeEntity> serviceTypeEntities = new ArrayList<>();

    @OneToMany(mappedBy = "appointment", fetch = FetchType.LAZY)
    List<MaintenanceManagementEntity> maintenanceManagementEntities = new ArrayList<>();

    @OneToMany(mappedBy = "appointment", fetch = FetchType.LAZY)
    List<com.fpt.evcare.entity.InvoiceEntity> invoices = new ArrayList<>();
}
