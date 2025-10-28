package com.fpt.evcare.entity;

import com.fpt.evcare.base.BaseEntity;
import com.fpt.evcare.enums.ShiftStatusEnum;
import com.fpt.evcare.enums.ShiftTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "shifts")
public class ShiftEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shift_id")
    UUID shiftId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    UserEntity staff;

    @ManyToMany
    @JoinTable(
            name = "shift_technicians",
            joinColumns = @JoinColumn(name = "shift_id"),
            inverseJoinColumns = @JoinColumn(name = "technician_id")
    )
    List<UserEntity> technicians = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id") // nullable = true (chưa phân công khi auto-create)
    UserEntity assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id") // nullable = true (cho ca trực, kiểm kê, bảo trì,...)
    AppointmentEntity appointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_type")
    ShiftTypeEnum shiftType;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time")
    LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    ShiftStatusEnum status;

    @Column(name = "total_hours", precision = 5, scale = 2)
    BigDecimal totalHours;

    @Column(name = "notes", length = 500)
    String notes;

    @Column(name = "search")
    String search;
}

