package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "service_types_vehicle_parts")
public class ServiceTypeVehiclePartEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID serviceTypeVehiclePartId;

    @ManyToOne
    @JoinColumn(name = "service_type_id")
    ServiceTypeEntity serviceType;

    @ManyToOne
    @JoinColumn(name = "vehicle_part_inventory_id")
    VehiclePartEntity vehiclePart;

    @Column(name = "required_quantity")
    Integer requiredQuantity;

    @Column(name = "estimated_time_default")
    Integer estimatedTimeDefault;
}
