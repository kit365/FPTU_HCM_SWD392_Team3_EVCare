-- Update provider cho user đã login bằng Google nhưng chưa có provider = 'GOOGLE'
-- Chạy query này trong MySQL Workbench hoặc tool database của bạn

-- Xem tất cả users hiện tại và provider của họ
SELECT user_id, username, email, full_name, provider 
FROM users 
WHERE is_deleted = false;

-- Update provider = 'GOOGLE' cho user cụ thể (thay {email} bằng email thực tế)
-- Ví dụ: phuocnguyenhuu2510@gmail.com
UPDATE users 
SET provider = 'GOOGLE' 
WHERE email = 'phuocnguyenhuu2510@gmail.com' 
  AND is_deleted = false;

-- Hoặc update tất cả users có email là Gmail (nếu chắc chắn họ dùng Google)
-- CẨNH TRỌNG: Chỉ chạy nếu chắc chắn!
-- UPDATE users 
-- SET provider = 'GOOGLE' 
-- WHERE email LIKE '%@gmail.com' 
--   AND (provider IS NULL OR provider = 'LOCAL')
--   AND is_deleted = false;

-- Kiểm tra lại sau khi update
SELECT user_id, username, email, full_name, provider 
FROM users 
WHERE is_deleted = false;


