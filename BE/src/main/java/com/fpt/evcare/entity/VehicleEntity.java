package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID vehicleId;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    UserEntity user;

    @ManyToOne
    @JoinColumn(name = "vehicle_type_id")
    VehicleTypeEntity vehicleType;

    @Column(name = "plate_number")
    String plateNumber;

    @Column(name = "vin")
    String vin;

    @Column(name = "current_km")
    Float currentKm;

    @Column(name = "last_maintenance_date")
    LocalDateTime lastMaintenanceDate;

    @Column(name = "last_maintenance_km")
    LocalDateTime lastMaintenanceKm;

    @Column(name = "notes")
    String notes;

    @Column(name = "search")
    String search;
}
