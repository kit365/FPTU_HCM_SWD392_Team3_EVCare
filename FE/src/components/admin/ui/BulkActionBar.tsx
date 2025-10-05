import { NavArrowDown } from 'iconoir-react';

interface BulkActionBarProps {
    count: number,
    entityName: string,
    // onChangeStatus: (value: string) => void;
    // onApply: () => void;
}

export const BulkActionBar = ({ count, entityName }: BulkActionBarProps) => {
    return (
        <>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden
                    ${count > 0 ? "opacity-100 max-h-[80px]" : "opacity-0 max-h-0 mb-0"}
                `}
            >
                <div className="flex items-center justify-between bg-[#f9fafb] border border-[#e5e7eb] rounded-[0.6rem] px-[1.6rem] py-[0.8rem] mb-[1.6rem] mt-[1.6rem]">
                    <span className="text-[1.3rem] text-[#374151]">
                        Đã chọn <b>{count}</b> {entityName}
                    </span>
                    <div className="flex items-center gap-[1rem] relative">
                        <select
                            id="bulkStatus"
                            className="
                                appearance-none border border-[#e2e7f1] rounded-[0.64rem] 
                              text-admin-secondary font-[400] text-[1.3rem] 
                                py-[0.6rem] pr-[3rem] pl-[1rem] outline-none focus:outline-none
                              focus:border-admin-primary transition-[border] duration-150
                            "
                        >
                            <option value="">-- Thay đổi trạng thái --</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm dừng</option>
                        </select>
                        <NavArrowDown className="absolute right-[35%] w-[1.6rem] h-[1.6rem] pointer-events-none text-[#6b7280]" />
                        <button className="bg-admin-primary cursor-pointer text-white text-[1.3rem] px-[1.6rem] py-[0.6rem] rounded-[0.6rem] hover:opacity-90 transition">
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}