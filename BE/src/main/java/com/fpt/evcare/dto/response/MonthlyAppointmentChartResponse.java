package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MonthlyAppointmentChartResponse {
    String month; // "T1", "T2", ...
    Long count;   // Số lượng lịch hẹn
}


