import * as yup from "yup";

export const vehicleTypeSchema = yup.object().shape({
    vehicleTypeName: yup
        .string()
        .trim()
        .required("Vui lòng nhập tên mẫu xe")
        .test("has-word", "Phải có ít nhất 1 từ hợp lệ", (value) => {
            const v = (value || "").trim();
            const words = v.split(/\s+/).filter(Boolean);
            return words.length >= 1 && /[A-Za-zÀ-ỹ]/u.test(v);
        }),
    manufacturer: yup
        .string()
        .trim()
        .required("Vui lòng chọn hãng sản xuất"),
    modelYear: yup
        .number()
        .typeError("Năm sản xuất phải là số")
        .required("Vui lòng nhập năm sản xuất")
        .min(2000, "Năm sản xuất phải từ 2000 trở lên")
        .max(new Date().getFullYear() + 1, "Năm sản xuất không hợp lệ"),
    batteryCapacity: yup
        .number()
        .typeError("Dung lượng pin phải là số")
        .required("Vui lòng nhập dung lượng pin")
        .min(1, "Dung lượng pin phải lớn hơn 0"),
    maintenanceIntervalKm: yup
        .number()
        .typeError("Bảo dưỡng (km) phải là số")
        .required("Vui lòng nhập số km bảo dưỡng")
        .min(1, "Số km bảo dưỡng phải lớn hơn 0"),
    maintenanceIntervalMonths: yup
        .number()
        .typeError("Bảo dưỡng (tháng) phải là số")
        .required("Vui lòng nhập số tháng bảo dưỡng")
        .min(1, "Số tháng bảo dưỡng phải lớn hơn 0"),
    description: yup
        .string()
        .trim()
        .required("Vui lòng nhập mô tả"),
});
