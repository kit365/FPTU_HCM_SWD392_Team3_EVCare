import { NavArrowDown } from "iconoir-react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectAdminProps {
    name: string;
    id: string;
    options: SelectOption[];
    placeholder?: string | null; 
    disabled?: boolean | null;
    register?: UseFormRegisterReturn;
    error?: string;
}

export const SelectAdmin = ({ name, id, options, placeholder, disabled, register, error }: SelectAdminProps) => {
    return (
        <div className="relative">
            <select
                {...register}
                name={name}
                id={id}
                disabled={disabled || false}
                className={`
                    appearance-none border rounded-[0.64rem] text-admin-secondary font-[400] text-[1.3rem] 
                    py-[0.827rem] pr-[4.56rem] pl-[1.52rem] outline-none focus:outline-none w-full
                    transition-[border] duration-150
                    ${error ? 'border-red-500 focus:border-red-500' : 'border-[#e2e7f1] focus:border-admin-primary'}
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((item: SelectOption) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
            <NavArrowDown className="absolute top-[50%] right-[10px] translate-y-[-50%] pointer-events-none w-[2rem] h-[2rem]" />
            {error && <p className="text-red-500 text-[1.2rem] mt-[0.5rem]">{error}</p>}
        </div>
    );
};