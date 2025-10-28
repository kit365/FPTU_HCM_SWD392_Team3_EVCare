package com.fpt.evcare.scheduler;

import com.fpt.evcare.service.ShiftService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShiftStatusScheduler {

    ShiftService shiftService;

    /**
     * Tự động cập nhật trạng thái ca làm việc mỗi 1 phút
     * - PENDING_ASSIGNMENT → LATE_ASSIGNMENT (quá giờ bắt đầu mà chưa phân công)
     * - SCHEDULED → IN_PROGRESS (khi đến giờ bắt đầu)
     * - IN_PROGRESS → COMPLETED (khi đến giờ kết thúc)
     */
    @Scheduled(fixedDelay = 60000) // Chạy mỗi 1 phút (60000 milliseconds)
    public void updateShiftStatuses() {
        log.info("Running scheduled task: Update Shift Status");
        shiftService.updateShiftStatuses();
    }
}

