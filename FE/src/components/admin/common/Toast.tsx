import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Toast - Component và hàm tiện ích dùng react-toastify cho toàn bộ app
 *
 * Cách sử dụng:
 * 1. Thêm <Toast /> vào App.tsx (hoặc layout gốc) để ToastContainer hoạt động toàn cục.
 *    Ví dụ:
 *      import { Toast } from 'src/components/admin/common/Toast';
 *      ...
 *      <Toast />
 *
 * 2. Gọi toast thông báo ở bất kỳ đâu:
 *    import { notify } from 'src/components/admin/common/Toast';
 *    ...
 *    notify.success('Thành công!');
 *    notify.error('Có lỗi xảy ra!');
 *    notify.info('Thông tin...');
 *    notify.warn('Cảnh báo!');
 *
 * 3. Tuỳ chọn: truyền options cho toast (tham khảo https://fkhadra.github.io/react-toastify/introduction)
 *    notify.success('...', { autoClose: 1000 })
 */

type ToastOpt = Parameters<typeof toast.success>[1];

export const Toast = () => <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />;

export const notify = {
  success: (msg: string, options?: ToastOpt) => toast.success(msg, options),
  error: (msg: string, options?: ToastOpt) => toast.error(msg, options),
  info: (msg: string, options?: ToastOpt) => toast.info(msg, options),
  warn: (msg: string, options?: ToastOpt) => toast.warn(msg, options),
};
