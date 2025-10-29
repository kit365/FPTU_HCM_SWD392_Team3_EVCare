package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MonthlyRevenueChartResponse {
    String month;       // "T1", "T2", ...
    Double revenue;     // Doanh thu (triệu VNĐ)
}


