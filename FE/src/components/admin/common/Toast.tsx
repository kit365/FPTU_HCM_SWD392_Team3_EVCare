import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
type ToastOpt = Parameters<typeof toast.success>[1];

export const Toast = () => <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />;

export const notify = {
  success: (msg: string, options?: ToastOpt) => toast.success(msg, options),
  error: (msg: string, options?: ToastOpt) => toast.error(msg, options),
  info: (msg: string, options?: ToastOpt) => toast.info(msg, options),
  warn: (msg: string, options?: ToastOpt) => toast.warn(msg, options),
};
