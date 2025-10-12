import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { ButtonAdmin } from "../../../components/admin/ui/Button";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { pathAdmin } from "../../../constants/paths.constant";
import { manufacturers } from "../../../constants/manufacturer.constant";


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
});

type FormData = {
    vehicleTypeName: string;
    manufacturer: string;
    modelYear: number;
    batteryCapacity: number;
    maintenanceIntervalKm: number;
    maintenanceIntervalMonths: number;
    description: string;
};

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
        component: "input",
        defaultValue: new Date().getFullYear()
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
];

export const VehicleCreate = () => {
    const { isLoading: loading, createVehicleType } = useVehicleType();
    const navigate = useNavigate();
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vehicleTypeName: "",
            manufacturer: "",
            modelYear: 0,
            batteryCapacity: 1,
            maintenanceIntervalKm: 0,
            maintenanceIntervalMonths: 0,
            description: ""
        }
    });

    const onSubmit = async (data: FormData) => {
        const response = await createVehicleType(data);
        if (response?.success) {
            reset();
            navigate(`/${pathAdmin}/vehicle`);
        }
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Thêm mới mẫu xe" />
                <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-[24px]">
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
                                />
                            ) : (
                                <InputAdmin
                                    id={name}
                                    type={type}
                                    placeholder={placeholder}
                                    {...register(name)}
                                    error={errors[name]?.message}
                                />
                            )}
                        </div>
                    ))}
                    <div className="col-span-2 flex items-center gap-[6px] justify-end">
                        <ButtonAdmin
                            text={loading ? "Đang tạo..." : "Tạo mới"}
                            type="submit"
                            className="bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
                            disabled={loading}
                        />
                        <ButtonAdmin
                            text="Hủy"
                            href={`/${pathAdmin}/vehicle`}
                            className="bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
};