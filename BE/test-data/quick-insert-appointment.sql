-- Script nhanh để insert appointment test PENDING
-- Copy paste vào MySQL Workbench hoặc console và chạy

-- Tạo appointment PENDING với dữ liệu test
INSERT INTO appointments (
    id,
    customer_id,
    customer_full_name,
    customer_phone_number,
    customer_email,
    service_mode,
    vehicle_type_id,
    vehicle_number_plate,
    vehicle_km_distances,
    user_address,
    scheduled_at,
    quote_price,
    status,
    notes,
    search,
    is_deleted,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT 
    UUID() as id,
    (SELECT id FROM users WHERE role_name = 'CUSTOMER' AND is_deleted = 0 LIMIT 1) as customer_id,
    'Nguyễn Văn Test' as customer_full_name,
    '0912345678' as customer_phone_number,
    'nguyenvantest@gmail.com' as customer_email,
    'STATIONARY' as service_mode,
    (SELECT id FROM vehicle_types WHERE is_deleted = 0 LIMIT 1) as vehicle_type_id,
    CONCAT('30A-', LPAD(FLOOR(RAND() * 99999), 5, '0')) as vehicle_number_plate,
    '15000' as vehicle_km_distances,
    '123 Đường Test, Quận 1, TP.HCM' as user_address,
    DATE_ADD(NOW(), INTERVAL 2 DAY) as scheduled_at,
    500000.00 as quote_price,
    'PENDING' as status,
    'Cuộc hẹn test - tự động tạo' as notes,
    'Nguyễn Văn Test nguyenvantest@gmail.com 0912345678' as search,
    0 as is_deleted,
    NOW() as created_at,
    NOW() as updated_at,
    'System' as created_by,
    'System' as updated_by;

-- Lấy appointment_id vừa tạo và insert service types
SET @new_appointment_id = (SELECT id FROM appointments ORDER BY created_at DESC LIMIT 1);

-- Thêm 2 service types đầu tiên vào appointment
INSERT INTO appointment_service_types (appointment_id, service_type_id)
SELECT 
    @new_appointment_id,
    id
FROM service_types 
WHERE is_deleted = 0
LIMIT 2;

-- Hiển thị kết quả
SELECT 
    CONCAT('✅ Đã tạo appointment: ', a.id) as result,
    a.customer_full_name as 'Khách hàng',
    a.vehicle_number_plate as 'Biển số',
    a.status as 'Trạng thái',
    DATE_FORMAT(a.scheduled_at, '%d/%m/%Y %H:%i') as 'Ngày hẹn',
    CASE 
        WHEN a.assignee_id IS NULL AND (SELECT COUNT(*) FROM appointment_technicians WHERE appointment_id = a.id) = 0 
        THEN '❌ Chưa phân công'
        ELSE '✅ Đã phân công'
    END as 'Tình trạng'
FROM appointments a
WHERE a.id = @new_appointment_id;

