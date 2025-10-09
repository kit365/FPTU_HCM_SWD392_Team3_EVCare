import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { ButtonAdmin } from "../../../components/admin/ui/Button";
import { carModelService } from "../../../service/carModelService";
import { notify } from "../../../components/admin/common/Toast";


const schema = yup.object({
    vehicleTypeName: yup.string().trim().required("Vui lòng nhập tên mẫu xe")
        .test("has-word", "Phải có ít nhất 1 từ hợp lệ", (value) => {
            const v = (value || "").trim();
            const words = v.split(/\s+/).filter(Boolean);
            return words.length >= 1 && /[A-Za-zÀ-ỹ]/u.test(v);
        }),
    manufacturer: yup.string().trim().required("Vui lòng nhập hãng sản xuất"),
    modelYear: yup.number().typeError("Năm sản xuất phải là số").required("Vui lòng nhập năm sản xuất"),
    batteryCapacity: yup.number().typeError("Dung lượng pin phải là số").required("Vui lòng nhập dung lượng pin"),
    maintenanceIntervalKm: yup.number().typeError("Bảo dưỡng (km) phải là số").required("Vui lòng nhập số km bảo dưỡng"),
    maintenanceIntervalMonths: yup.number().typeError("Bảo dưỡng (tháng) phải là số").required("Vui lòng nhập số tháng bảo dưỡng"),
    description: yup.string().trim().required("Vui lòng nhập mô tả")
}).required();

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
    { name: "vehicleTypeName" as const, label: "Tên mẫu xe", placeholder: "Nhập tên mẫu xe...", type: "text" },
    { name: "manufacturer" as const, label: "Hãng sản xuất", placeholder: "Nhập hãng sản xuất...", type: "text" },
    { name: "modelYear" as const, label: "Năm sản xuất", placeholder: "Nhập năm sản xuất...", type: "number" },
    { name: "batteryCapacity" as const, label: "Dung lượng pin (kWh)", placeholder: "Nhập dung lượng pin...", type: "number" },
    { name: "maintenanceIntervalKm" as const, label: "Bảo dưỡng (km)", placeholder: "Nhập số km bảo dưỡng...", type: "number" },
    { name: "maintenanceIntervalMonths" as const, label: "Bảo dưỡng (tháng)", placeholder: "Nhập số tháng bảo dưỡng...", type: "number" },
    { name: "description" as const, label: "Mô tả", placeholder: "Nhập mô tả...", type: "text", fullWidth: true }
];

export const VehicleCreate = () => {
    const [loading, setLoading] = useState(false);
    
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
        setLoading(true);
        try {
            const response = await carModelService.createVehicleType(data);
            console.log("Respone Create:", response)
            if (response?.data.success === true) {
                notify.success(response?.data.message || "Tạo mới mẫu xe thành công")
                reset();
            } else {
                notify.error(response?.data.message || "Tạo mới mẫu xe thất bại!");
            }
        } catch (error) {
            alert("Có lỗi xảy ra khi tạo mới!");
            console.error("Error fetching vehicle types:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Thêm mới mẫu xe" />
                <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-[24px]">
                    {fields.map(({ name, label, placeholder, type, fullWidth }) => (
                        <div key={name} className={fullWidth ? "col-span-2" : ""}>
                            <LabelAdmin htmlFor={name} content={label} />
                            <InputAdmin
                                id={name}
                                type={type}
                                placeholder={placeholder}
                                {...register(name)}
                                error={errors[name]?.message}
                            />
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
                            type="button"
                            className="bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
                            onClick={() => reset()}
                        />
                    </div>
                </form>
            </Card>
        </div>
    );
};