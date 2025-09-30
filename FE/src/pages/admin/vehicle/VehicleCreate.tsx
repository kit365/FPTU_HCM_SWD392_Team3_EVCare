import { Card } from "@mui/material"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader"
import { LabelAdmin } from "../../../components/admin/ui/form/Label"
import { InputAdmin } from "../../../components/admin/ui/form/Input"
import { ButtonAdmin } from "../../../components/admin/ui/Button"
import { SelectAdmin } from "../../../components/admin/ui/form/Select"
import { Test } from "../../../components/admin/ui/Test"

interface SelectOption {
    value: string;
    label: string;
}

const CAR_STATUS_OPTIONS: SelectOption[] = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Tạm dừng" }
];

export const VehicleCreate = () => {
    const schema = yup.object({
        carname: yup
            .string()
            .trim()
            .required("Vui lòng nhập tên mẫu xe")
            .matches(/^[A-Za-zÀ-ỹ\s]+$/u, "Chỉ chứa chữ cái và khoảng trắng")
            .test("has-word", "Phải có ít nhất 1 từ hợp lệ", (value) => {
                const v = (value || "").trim();
                const words = v.split(/\s+/).filter(Boolean);
                return words.length >= 1 && /[A-Za-zÀ-ỹ]/u.test(v);
            }),
        status: yup.string().optional()
    }).required();

    const { register, handleSubmit, formState: { errors } } = useForm<{ carname: string; status?: string }>({
        resolver: yupResolver(schema),
        defaultValues: { carname: "", status: CAR_STATUS_OPTIONS[0]?.value }
    });

    const onSubmit = (data: { carname: string; status?: string }) => {
        // submit handler
        console.log("submit vehicle:", data);
    }

    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Thêm mới mẫu xe"
                    />
                    {/* Content */}
                    <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] h-full grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
                        <div>
                            <LabelAdmin htmlFor="carname" content="Tên mẫu xe" />
                            <InputAdmin
                                id="carname"
                                placeholder="Nhập tên mẫu xe..."
                                {...register("carname")}
                                error={errors.carname?.message}
                            />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="status" content="Trạng thái" />
                            <SelectAdmin name="status" id="status" options={CAR_STATUS_OPTIONS} />
                        </div>
                    </form>
                    {/* Buttons */}
                    <div className="px-[2.4rem] pb-[2.4rem] flex items-center gap-[6px] justify-end">
                        <button type="submit" form="" className="hidden" />
                        <ButtonAdmin text="Tạo mới" className="bg-[#22c55e] border-[#22c55e] inline-block shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]" />
                        <ButtonAdmin text="Hủy" className="bg-[#ef4d56] border-[#ef4d56] inline-block shadow-[0_1px_2px_0 _gba(239, 77, 86, .35)]" />
                    </div>
                </Card >
            </div >
            <Test />
        </>
    )
}
