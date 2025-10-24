import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card } from "@mui/material";
import moment from "moment";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { LabelAdmin } from "../../../components/admin/ui/form/Label";
import { InputAdmin } from "../../../components/admin/ui/form/Input";
import { SelectAdmin } from "../../../components/admin/ui/form/Select";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { manufacturers } from "../../../constants/manufacturer.constant";
import { pathAdmin } from "../../../constants/paths.constant";

export const VehicleDetail = () => {
    const { id } = useParams();
    const { getVehicleType } = useVehicleType();

    const { register, reset } = useForm();

    useEffect(() => {
        const fetchVehicle = async () => {
            if (id) {
                const response = await getVehicleType(id);
                if (response) {
                    reset({
                        ...response,
                        createdAt: moment(response.createdAt).format("HH:mm - DD/MM/YYYY"),
                        updatedAt: moment(response.updatedAt).format("HH:mm - DD/MM/YYYY"),
                    });
                }
            }
        };
        fetchVehicle();
    }, []);

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Chi tiết mẫu xe" href={`/${pathAdmin}/vehicle/service/${id}`} content="Dịch vụ" />
                <form
                    className="px-[2.4rem] pb-[2.4rem] grid grid-cols-2 gap-x-[24px] gap-y-[24px]"
                >
                    <div>
                        <LabelAdmin htmlFor="vehicleTypeName" content="Tên mẫu xe" />
                        <InputAdmin
                            id="vehicleTypeName"
                            {...register("vehicleTypeName")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="manufacturer" content="Hãng sản xuất" />
                        <SelectAdmin
                            id="manufacturer"
                            name="manufacturer"
                            options={manufacturers}
                            register={register("manufacturer")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="modelYear" content="Năm sản xuất" />
                        <InputAdmin
                            id="modelYear"
                            type="number"
                            {...register("modelYear")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="batteryCapacity" content="Dung lượng pin (kWh)" />
                        <InputAdmin
                            id="batteryCapacity"
                            type="number"
                            {...register("batteryCapacity")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="maintenanceIntervalKm" content="Bảo dưỡng (km)" />
                        <InputAdmin
                            id="maintenanceIntervalKm"
                            type="number"
                            {...register("maintenanceIntervalKm")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="maintenanceIntervalMonths" content="Bảo dưỡng (tháng)" />
                        <InputAdmin
                            id="maintenanceIntervalMonths"
                            type="number"
                            {...register("maintenanceIntervalMonths")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="createdAt" content="Ngày tạo" />
                        <InputAdmin
                            id="createdAt"
                            {...register("createdAt")}
                            disabled
                        />
                    </div>

                    <div>
                        <LabelAdmin htmlFor="updatedAt" content="Ngày cập nhật" />
                        <InputAdmin
                            id="updatedAt"
                            {...register("updatedAt")}
                            disabled
                        />
                    </div>

                    <div className="col-span-2">
                        <LabelAdmin htmlFor="description" content="Mô tả" />
                        <InputAdmin
                            id="description"
                            {...register("description")}
                            disabled
                        />
                    </div>

                    {/* ====== Buttons ====== */}
                    <div className="col-span-2 flex items-center gap-[6px] justify-end">
                        <Link
                            to={`/${pathAdmin}/vehicle`}
                            className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#7c3aed] border-[#7c3aed] shadow-[0_1px_2px_0_rgba(124,58,237,0.35)]"
                        >
                            Quay lại
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};
