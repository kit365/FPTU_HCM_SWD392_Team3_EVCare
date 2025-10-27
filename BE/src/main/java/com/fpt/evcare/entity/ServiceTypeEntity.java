package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "service_types")
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceTypeEntity extends BaseEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID serviceTypeId;

    @Column(name = "parent_id")
    UUID parentId; // Thêm để set từ DTO

    @Column(name = "service_name", nullable = false)
    String serviceName;

    String description;
    
    @Column(name = "estimated_duration_minutes")
    Integer estimatedDurationMinutes; // Thời lượng ước tính (phút)

    String search;

    // Mối quan hệ tự tham chiếu (cha-con)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(insertable=false, updatable=false)
    ServiceTypeEntity parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id")
    VehicleTypeEntity vehicleTypeEntity;

    @OneToMany(mappedBy = "serviceType", fetch = FetchType.LAZY)
    List<ServiceTypeVehiclePartEntity> serviceTypeVehiclePartList;

    @ManyToMany(mappedBy = "serviceTypeEntities")
    List<AppointmentEntity> appointmentEntities = new ArrayList<>();
}
