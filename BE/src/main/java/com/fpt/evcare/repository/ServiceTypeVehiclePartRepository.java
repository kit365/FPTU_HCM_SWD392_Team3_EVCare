package com.fpt.evcare.repository;

import com.fpt.evcare.entity.ServiceTypeVehiclePartEntity;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeVehiclePartRepository extends JpaRepository<ServiceTypeVehiclePartEntity, UUID> {
    ServiceTypeVehiclePartEntity findByServiceTypeVehiclePartIdAndIsDeletedFalse(UUID id);
    ServiceTypeVehiclePartEntity findByServiceTypeVehiclePartIdAndIsDeletedTrue(UUID id);
    List<ServiceTypeVehiclePartEntity> findAllByServiceTypeServiceTypeIdAndIsDeletedFalse(UUID id);

    @Query(value = """
    SELECT EXISTS (
        SELECT 1
        FROM appointments a
        JOIN appointment_service_types ast ON a.id = ast.appointment_id
        JOIN service_types st ON ast.service_type_id = st.id
        WHERE st.id = :serviceTypeId
          AND st.is_deleted = FALSE
          AND st.is_active = TRUE
          AND a.status IN ('CONFIRMED', 'IN_PROGRESS')
          AND a.is_deleted = FALSE
          AND a.is_active = TRUE
    )
    """, nativeQuery = true)
    boolean existsActiveAppointmentsInServiceTypeVehiclePartByServiceTypeId(@Param("serviceTypeId") UUID serviceTypeId);


    @Query(value = """
    SELECT EXISTS (
        SELECT 1
        FROM appointments a
        JOIN appointment_service_types ast ON a.id = ast.appointment_id
        JOIN service_types_vehicle_parts stvp ON ast.service_type_id = stvp.service_type_id
        JOIN vehicle_part_inventories vpi ON stvp.vehicle_part_inventory_id = vpi.id
        WHERE vpi.id = :vehiclePartId
          AND vpi.is_deleted = FALSE
          AND vpi.is_active = TRUE
          AND a.status IN ('CONFIRMED', 'IN_PROGRESS')
          AND a.is_deleted = FALSE
          AND a.is_active = TRUE
          AND stvp.is_deleted = FALSE
          AND stvp.is_active = TRUE
    )
    """, nativeQuery = true)
    boolean existsActiveAppointmentsInServiceTypeVehiclePartByVehiclePartId(@Param("vehiclePartId") UUID vehiclePartId);


}
