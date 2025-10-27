package com.fpt.evcare.dto.request.maintain_record;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationMaintenanceRecordRequest {

    @NotNull(message = "Phụ tùng không được để trống")
    UUID vehiclePartInventoryId;

    @NotNull(message = "Số lượng vật tư không được để trống")
    @Min(value = 1, message = "Số lượng sử dụng phải lớn hơn hoặc bằng 1")
    Integer quantityUsed;

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    Boolean approvedByUser;
}
