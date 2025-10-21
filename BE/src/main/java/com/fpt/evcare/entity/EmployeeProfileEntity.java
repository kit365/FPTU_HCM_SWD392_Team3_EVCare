package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.SkillLevelEnum;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employee_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeProfileEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID employeeProfileId;

    @Column(name = "skill_level")
    @Enumerated(EnumType.STRING)
    SkillLevelEnum skillLevel;

    @Column(name = "certifications")
    String certifications;

    @Column(name = "performance_score")
    Float performanceScore;

    @Column(name = "total_hours_worked")
    Float totalHoursWorked;

    @Column(name = "hire_date")
    LocalDateTime hireDate;

    @Column(name = "salary_base")
    Float salaryBase;

    @Column(name = "emergency_contact")
    String emergencyContact;

    @Column(name = "notes", length = 500)
    String notes;

    @Column(name = "search")
    String search;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinColumn(name = "user_id")
    UserEntity user;



}
