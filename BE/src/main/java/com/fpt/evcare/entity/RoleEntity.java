package com.fpt.evcare.entity;
import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.RoleEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.*;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "roles")
public class RoleEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "role_id", updatable = false, nullable = false)
    UUID roleId;

    @Column(name = "role_name", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    RoleEnum roleName;

    @Column(name = "description", length = 100)
    String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id"))
    @Column(name = "Permissions")
    List<String> permissions = new ArrayList<>();

    @ManyToMany(mappedBy = "roles")
    private List<UserEntity> users = new ArrayList<>();

}
