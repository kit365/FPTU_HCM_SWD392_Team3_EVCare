package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vehicle_types")
@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleTypeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID vehicleTypeId;

    @Column(name = "vehicle_name")
    String vehicleTypeName;

    @Column(name = "manufacturer")
    String manufacturer;

    @Column(name = "model_year")
    Integer modelYear;

    @Column(name = "battery_capacity")
    Float batteryCapacity;

    @Column(name = "maintenance_interval_km")
    Float maintenanceIntervalKm;

    @Column(name = "maintenance_interval_months")
    Integer maintenanceIntervalMonths;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "search")
    String search;

    @OneToMany(mappedBy = "vehicleType")
    List<VehiclePartEntity> vehicleParts;
}
