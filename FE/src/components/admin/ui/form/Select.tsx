import { NavArrowDown } from "iconoir-react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectAdminProps {
    name: string;
    id: string;
    options: SelectOption[];
}

export const SelectAdmin = ({ name, id, options }: SelectAdminProps) => {
    return (
        <div className="relative">
            <select
                name={name}
                id={id}
                className="
          appearance-none border border-[#e2e7f1] rounded-[0.64rem] text-admin-secondary font-[400] text-[1.3rem] 
          py-[0.827rem] pr-[4.56rem] pl-[1.52rem] outline-none focus:outline-none w-full
          focus:border-admin-primary transition-[border] duration-150
        "
            >
                {options.map((item: SelectOption) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
            <NavArrowDown className="absolute top-[50%] right-[10px] translate-y-[-50%] pointer-events-none w-[2rem] h-[2rem]" />
        </div>
    );
};