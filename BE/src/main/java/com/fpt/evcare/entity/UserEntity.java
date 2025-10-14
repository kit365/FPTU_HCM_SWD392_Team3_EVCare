package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "users")
public class UserEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID userId;

    @ManyToMany
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name ="role_id")
    )
    List<RoleEntity> roles = new ArrayList<>();

    @Column(name = "username", unique = true, nullable = false)
    String username;

    @Column(name = "email", unique = true, nullable = false)
    String email;

    @Column(name = "address")
    String address;

    @Column(name = "password")
    String password;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "search")
    String search;

    @Column(name = "phone")
    String numberPhone;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "last_login")
    String lastLogin;

    @Column(name = "provider")
    String provider;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    List<AppointmentEntity> appointmentsCustomer;

    @OneToMany(mappedBy = "technician", fetch = FetchType.LAZY)
    List<AppointmentEntity> appointmentsTechnician;

    @OneToMany(mappedBy = "assignee", fetch = FetchType.LAZY)
    List<AppointmentEntity> appointmentsAssignee;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    List<EmployeeProfileEntity> employeeProfiles;
}
