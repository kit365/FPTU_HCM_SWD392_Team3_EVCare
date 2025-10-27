package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Vehicle_part_categories")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehiclePartCategoryEntity extends BaseEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID vehiclePartCategoryId;

    @Column(name = "part_category_name", nullable = false)
    String partCategoryName;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "search", length = 255)
    String search;

    @OneToMany(mappedBy = "vehiclePartCategories", fetch = FetchType.EAGER)
    List<VehiclePartEntity> vehicleParts;
}
