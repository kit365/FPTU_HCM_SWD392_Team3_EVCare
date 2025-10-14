import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { ButtonAdmin } from "../../../components/admin/ui/Button";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { pathAdmin } from "../../../constants/paths.constant";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { manufacturers } from "../../../constants/manufacturer.constant";
import type { UpdateVehicleTypeRequest, VehicleTypeModel} from "../../../type/carModel";


// Định nghĩa schema validation
const schema = yup.object().shape({
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
    isActive: yup.boolean().optional(),
    isActive: yup.boolean().required()
}) satisfies yup.ObjectSchema<UpdateVehicleTypeRequest>;



// Định nghĩa fields giống với VehicleCreate
const fields = [
    {
        name: "vehicleTypeName" as const,
        label: "Tên mẫu xe",
        placeholder: "Nhập tên mẫu xe...",
        type: "text",
        component: "input"
    },
    {
        name: "manufacturer" as const,
        label: "Hãng sản xuất",
        placeholder: "Chọn hãng sản xuất...",
        type: "select",
        component: "select",
        options: manufacturers
    },
    {
        name: "modelYear" as const,
        label: "Năm sản xuất",
        placeholder: "Nhập năm sản xuất...",
        type: "number",
        component: "input"
    },
    {
        name: "batteryCapacity" as const,
        label: "Dung lượng pin (kWh)",
        placeholder: "Nhập dung lượng pin...",
        type: "number",
        component: "input"
    },
    {
        name: "maintenanceIntervalKm" as const,
        label: "Bảo dưỡng (km)",
        placeholder: "Nhập số km bảo dưỡng...",
        type: "number",
        component: "input"
    },
    {
        name: "maintenanceIntervalMonths" as const,
        label: "Bảo dưỡng (tháng)",
        placeholder: "Nhập số tháng bảo dưỡng...",
        type: "number",
        component: "input"
    },
    {
        name: "description" as const,
        label: "Mô tả",
        placeholder: "Nhập mô tả...",
        type: "text",
        component: "input",
        fullWidth: true
    },
    {
        name: "createdAt" as const,
        label: "Ngày tạo",
        placeholder: "",
        type: "text",
        component: "input",
        fullWidth: false
    },
    {
        name: "updatedAt" as const,
        label: "Ngày cập nhật",
        placeholder: "",
        type: "text",
        component: "input",
        fullWidth: false
    },
];

export const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = location.pathname.includes("edit");
    const { isLoading: loading, getVehicleType, updateVehicleType } = useVehicleType();
    // Hàm định dạng ngày giờ
    const formatDateTime = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    // Khởi tạo react-hook-form
    const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateVehicleTypeRequest>({
        resolver: yupResolver(schema),
        defaultValues: {
    vehicleTypeName: "",
    manufacturer: "",
    modelYear: 0,
    batteryCapacity: 1,
    maintenanceIntervalKm: 0,
    maintenanceIntervalMonths: 0,
    description: "",
    isActive: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "",
    updatedBy: "",
},
    });

    // Lấy dữ liệu xe khi component mount
    useEffect(() => {
        const fetchVehicle = async () => {
            if (id) {
                const response = await getVehicleType(id);
                if (response) {
                    reset({
                        ...response,
                        createdAt: formatDateTime(response.createdAt),
                        updatedAt: formatDateTime(response.updatedAt),
                    });
                }
            }
        };
        fetchVehicle();
    }, [id]);

    const onSubmit = async (data: UpdateVehicleTypeRequest) => {
        if (isEdit && id) {
            const success = await updateVehicleType(id, data);
            if (success) {
                // Reload data sau khi update thành công
                const updatedData = await getVehicleType(id);
                if (updatedData) {
                    reset({
                        ...updatedData,
                        createdAt: formatDateTime(updatedData.createdAt),
                        updatedAt: formatDateTime(updatedData.updatedAt),
                    });
                }
                navigate(`/${pathAdmin}/vehicle`);
            }
        }
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title={isEdit ? "Chỉnh sửa mẫu xe" : "Chi tiết mẫu xe"} />
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-[24px]"
                >
                    {fields.map(({ name, label, placeholder, type, component, options, fullWidth }) => (
                        <div key={name} className={fullWidth ? "col-span-2" : ""}>
                            <LabelAdmin htmlFor={name} content={label} />
                            {component === 'select' ? (
                                <SelectAdmin
                                    id={name}
                                    name={name}
                                    placeholder={placeholder}
                                    options={options || []}
                                    register={register(name)}
                                    error={errors[name]?.message}
                                    disabled={!isEdit}
                                />
                            ) : (
                                <InputAdmin
                                    id={name}
                                    type={type}
                                    placeholder={placeholder}
                                    {...register(name)}
                                    error={errors[name]?.message}
                                    disabled={!isEdit}
                                />
                            )}
                        </div>
                    ))}
                    <div className="col-span-2 flex items-center gap-[6px] justify-end">
                        {isEdit ? (
                            <>
                                <ButtonAdmin
                                    text={loading ? "Đang lưu..." : "Lưu thay đổi"}
                                    type="submit"
                                    className="bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
                                    disabled={loading}
                                />
                                <ButtonAdmin
                                    text="Hủy"
                                    href={`/${pathAdmin}/vehicle`}
                                    className="bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
                                />
                            </>
                        ) : (
                            <ButtonAdmin
                                text="Quay lại"
                                href={`/${pathAdmin}/vehicle`}
                                className="bg-gray-500 border-gray-500 shadow-[0_1px_2px_0_rgba(0,0,0,0.35)]"
                            />
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
};