import { Card } from "@mui/material"
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

const STAFF_STATUS_OPTIONS: SelectOption[] = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Tạm dừng" }
];

export const StaffCreatePage = () => {
    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Tạo tài khoản nhân viên"
                    />
                    {/* Content */}
                    <div className="px-[2.4rem] pb-[2.4rem] h-full grid grid-cols-2 gap-x-[24px] gap-y-[24px]">
                        <div>
                            <LabelAdmin htmlFor="fullname" content="Họ và tên" />
                            <InputAdmin name="fullname" id="fullname" placeholder="Nhập họ và tên..." />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="status" content="Trạng thái" />
                            <SelectAdmin name="status" id="status" options={STAFF_STATUS_OPTIONS} />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="username" content="Tên đăng nhập" />
                            <InputAdmin id="username" name="username" placeholder="Nhập tên đăng nhập..." />
                        </div>
                        <div>
                            <LabelAdmin htmlFor="email" content="Email" />
                            <InputAdmin id="email" name="email" type="email" placeholder="Nhập email..." />
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="px-[2.4rem] pb-[2.4rem] flex items-center gap-[6px] justify-end">
                        <ButtonAdmin text="Tạo mới" className="bg-[#22c55e] border-[#22c55e] inline-block shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]" />
                        <ButtonAdmin text="Hủy" className="bg-[#ef4d56] border-[#ef4d56] inline-block shadow-[0_1px_2px_0 _gba(239, 77, 86, .35)]" />
                    </div>
                </Card >
            </div >
            <Test />
        </>
    )
}
