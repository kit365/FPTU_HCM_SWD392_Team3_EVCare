import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { pathAdmin } from "../../../constants/paths.constant";
import { manufacturers } from "../../../constants/manufacturer.constant";
import { Link, useNavigate } from "react-router-dom";
import { vehicleTypeSchema } from "../../../validations/vehicleType.validation";

type FormData = {
    vehicleTypeName: string;
    manufacturer: string;
    modelYear: number;
    batteryCapacity: number;
    maintenanceIntervalKm: number;
    maintenanceIntervalMonths: number;
    description: string;
};

export const VehicleCreate = () => {
    const { loading, createVehicleType } = useVehicleType();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(vehicleTypeSchema),
        defaultValues: {
            vehicleTypeName: "",
            manufacturer: "",
            modelYear: new Date().getFullYear(),
            batteryCapacity: 1,
            maintenanceIntervalKm: 0,
            maintenanceIntervalMonths: 0,
            description: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                vehicleTypeName: data.vehicleTypeName,
                manufacturer: data.manufacturer,
                modelYear: data.modelYear,
                batteryCapacity: data.batteryCapacity,
                maintenanceIntervalKm: data.maintenanceIntervalKm,
                maintenanceIntervalMonths: data.maintenanceIntervalMonths,
                description: data.description || "",
            };

            if (await createVehicleType(payload)) {
                // Redirect về trang danh sách sau khi tạo thành công
                navigate(`/${pathAdmin}/vehicle`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Thêm mới mẫu xe" />

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]"
                >
                    <div>
                        <LabelAdmin htmlFor="vehicleTypeName" content="Tên mẫu xe" />
                        <InputAdmin
                            id="vehicleTypeName"
                            placeholder="Nhập tên mẫu xe..."
                            {...register("vehicleTypeName")}
                            error={errors.vehicleTypeName?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="manufacturer" content="Hãng sản xuất" />
                        <SelectAdmin
                            id="manufacturer"
                            name="manufacturer"
                            placeholder="-- Chọn hãng sản xuất --"
                            options={manufacturers}
                            register={register("manufacturer")}
                            error={errors.manufacturer?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="modelYear" content="Năm sản xuất" />
                        <InputAdmin
                            id="modelYear"
                            type="number"
                            placeholder="Nhập năm sản xuất..."
                            {...register("modelYear")}
                            error={errors.modelYear?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="batteryCapacity" content="Dung lượng pin (kWh)" />
                        <InputAdmin
                            id="batteryCapacity"
                            type="number"
                            placeholder="Nhập dung lượng pin..."
                            {...register("batteryCapacity")}
                            error={errors.batteryCapacity?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="maintenanceIntervalKm" content="Bảo dưỡng (km)" />
                        <InputAdmin
                            id="maintenanceIntervalKm"
                            type="number"
                            placeholder="Nhập số km bảo dưỡng..."
                            {...register("maintenanceIntervalKm")}
                            error={errors.maintenanceIntervalKm?.message}
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="maintenanceIntervalMonths" content="Bảo dưỡng (tháng)" />
                        <InputAdmin
                            id="maintenanceIntervalMonths"
                            type="number"
                            placeholder="Nhập số tháng bảo dưỡng..."
                            {...register("maintenanceIntervalMonths")}
                            error={errors.maintenanceIntervalMonths?.message}
                        />
                    </div>

                    <div className="col-span-2">
                        <LabelAdmin htmlFor="description" content="Mô tả" />
                        <InputAdmin
                            id="description"
                            placeholder="Nhập mô tả..."
                            {...register("description")}
                            error={errors.description?.message}
                        />
                    </div>

                    {/* ====== Buttons ====== */}
                    <div className="col-span-2 flex items-center gap-[6px] justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
                        >
                            {loading ? "Đang tạo..." : "Tạo mới"}
                        </button>
                        <Link
                            to={`/${pathAdmin}/vehicle`}
                            className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]"
                        >
                            Hủy
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};
