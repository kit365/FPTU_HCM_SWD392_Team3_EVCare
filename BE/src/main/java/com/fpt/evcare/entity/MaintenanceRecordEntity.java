package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "maintenance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MaintenanceRecordEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID maintenanceRecordId;

    @ManyToOne
    @JoinColumn(name = "maintenance_management_id")
    MaintenanceManagementEntity maintenanceManagement;

    @ManyToOne
    @JoinColumn(name = "vehicle_part_inventory_id")
    VehiclePartEntity vehiclePart;

    @Column(name = "quantity_used")
    Integer quantityUsed;

    @Column(name = "approved_by_user")
    Boolean approvedByUser;

    @Column(name = "search")
    String search;
}
