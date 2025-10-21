import { Card } from "@mui/material"
import { useForm, type SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader"
import { LabelAdmin } from "../../../components/admin/ui/form/Label"
import { InputAdmin } from "../../../components/admin/ui/form/Input"
import { SelectAdmin } from "../../../components/admin/ui/form/Select"
import { pathAdmin } from "../../../constants/paths.constant"
import { staffSchema, type StaffFormValues } from "../../../validations/staff.validation"
import { ButtonAdmin } from "../../../components/admin/ui/Button"

interface SelectOption {
    value: string;
    label: string;
}

const STAFF_STATUS_OPTIONS: SelectOption[] = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Tạm dừng" }
];

export const StaffCreatePage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<StaffFormValues>({
        resolver: yupResolver(staffSchema),
        defaultValues: {
            fullname: "",
            username: "",
            email: "",
            status: "active",
            password: "",
        },
    });

    const onSubmit: SubmitHandler<StaffFormValues> = (data) => {
        console.log("submit staff:", data);
    }

    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Tạo tài khoản nhân viên"
                    />
                    {/* Content */}
                    <form onSubmit={handleSubmit(onSubmit)} className="px-[2.4rem] pb-[2.4rem] h-full grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
                        <div>
                            <LabelAdmin htmlFor="fullname" content="Họ và tên" />
                            <InputAdmin id="fullname" placeholder="Nhập họ và tên..." {...register("fullname")} error={errors.fullname?.message} />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="status" content="Trạng thái" />
                            <SelectAdmin name="status" id="status" options={STAFF_STATUS_OPTIONS} />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="username" content="Tên đăng nhập" />
                            <InputAdmin id="username" placeholder="Nhập tên đăng nhập..." {...register("username")} error={errors.username?.message} />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="email" content="Email" />
                            <InputAdmin id="email" type="email" placeholder="Nhập email..." {...register("email")} error={errors.email?.message} />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="password" content="Mật khẩu" />
                            <InputAdmin id="password" placeholder="Nhập mật khẩu..." {...register("password")} error={errors.password?.message} />
                        </div>

                        {/* Buttons */}
                        {/* <div className="col-span-2 px-[2.4rem] pb-[2.4rem] flex items-center gap-[6px] justify-end">
                            <ButtonAdmin type="submit" text="Tạo mới" className="bg-[#22c55e] border-[#22c55e] inline-block shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]" />
                            <ButtonAdmin href={`/${pathAdmin}/staff`} text="Hủy" className="bg-[#ef4d56] border-[#ef4d56] inline-block shadow-[0_1px_2px_0_rgba(239,77,86,0.35)]" />
                        </div> */}
                    </form>
                </Card >
            </div >
        </>
    )
}