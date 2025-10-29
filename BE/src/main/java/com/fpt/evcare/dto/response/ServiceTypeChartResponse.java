package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceTypeChartResponse {
    String id;          // Service type ID
    String label;       // Tên dịch vụ
    Long value;         // Số lượng appointments sử dụng service này
}


