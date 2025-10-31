package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.VehiclePartStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vehicle_part_inventories")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehiclePartEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID vehiclePartId;

    @Column(name = "vehicle_part_name")
    String vehiclePartName;

    @Column(name = "current_quantity")
    Integer currentQuantity;

    @Column(name = "min_stock")
    Integer minStock;

    @Column(name = "unit_price")
    BigDecimal unitPrice;

    @Column(name = "last_restock_date")
    @CreatedDate
    LocalDateTime lastRestockDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    VehiclePartStatusEnum status = VehiclePartStatusEnum.AVAILABLE;

    @Column(name = "average_lifespan")
    Integer averageLifespan;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "search")
    String search;

    @ManyToOne
    @JoinColumn(name = "vehicle_type_id")
    VehicleTypeEntity vehicleType;

    @ManyToOne
    @JoinColumn(name = "vehicle_part_category_id")
    VehiclePartCategoryEntity vehiclePartCategories;

    @OneToMany(mappedBy = "vehiclePart", fetch = FetchType.LAZY)
    List<ServiceTypeVehiclePartEntity> serviceTypeVehiclePartList;

    @Version // 🔒 giúp kiểm soát version để tránh conflict khi update đồng thời
    Long version;
}
