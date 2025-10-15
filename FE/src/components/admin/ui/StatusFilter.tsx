import { NavArrowDown } from 'iconoir-react';

interface StatusFilterProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[] | null;
}

export const StatusFilter = ({ value, onChange }: StatusFilterProps) => {
    return (
        <>
            <div className="relative w-[25%]">
                <select
                    onChange={onChange}
                    value={value}
                    className="
                                appearance-none border border-[#e2e7f1] rounded-[0.64rem] text-admin-secondary font-[400] text-[1.3rem] 
                                py-[0.827rem] pr-[4.56rem] pl-[1.52rem] outline-none focus:outline-none w-full
                                focus:border-admin-primary transition-[border] duration-150
                            "
                >
                    <option value="">-- Lọc theo trạng thái --</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                </select>
                <NavArrowDown className="absolute top-[50%] right-[10px] translate-y-[-50%] pointer-events-none w-[2rem] h-[2rem]" />
            </div>
        </>
    )
}