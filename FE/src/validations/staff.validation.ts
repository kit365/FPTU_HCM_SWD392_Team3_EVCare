import * as yup from "yup";

export type Status = "active" | "inactive";

export interface StaffFormValues {
    fullname: string;
    username: string;
    email: string;
    status: Status;
    password: string;
}

export const STATUS_VALUES: Status[] = ["active", "inactive"];

export const staffSchema: yup.ObjectSchema<StaffFormValues> = yup
    .object({
        fullname: yup
            .string()
            .trim()
            .required("Vui lòng nhập họ và tên")
            .matches(/^[A-Za-zÀ-ỹ\s]+$/u, "Chỉ chứa chữ cái và khoảng trắng")
            .test("has-word", "Phải có ít nhất 1 từ hợp lệ", (value) => {
                const v = (value || "").trim();
                const words = v.split(/\s+/).filter(Boolean);
                return words.length >= 1 && /[A-Za-zÀ-ỹ]/u.test(v);
            }),
        username: yup
            .string()
            .trim()
            .required("Vui lòng nhập tên đăng nhập")
            .min(5, "Tên đăng nhập tối thiểu 5 ký tự"),
        email: yup
            .string()
            .trim()
            .required("Vui lòng nhập email")
            .email("Email không hợp lệ"),
        status: yup
            .mixed<Status>()
            .oneOf(STATUS_VALUES, "Trạng thái không hợp lệ")
            .required("Vui lòng chọn trạng thái"),
        password: yup
            .string()
            .required("Vui lòng nhập mật khẩu!")
            .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự!")
            .matches(/[A-Z]/, "Phải chứa ít nhất 1 chữ in hoa!")
            .matches(/[a-z]/, "Phải chứa ít nhất 1 chữ thường!")
            .matches(/\d/, "Phải chứa ít nhất 1 chữ số!")
            .matches(/[@$!%*?&]/, "Phải chứa ít nhất 1 ký tự đặc biệt!"),
    })
    .required();
