import { NavArrowDown } from "iconoir-react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectAdminProps {
    name: string;
    id: string;
    options: SelectOption[];
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    register?: any;
}

export const SelectAdmin = ({ name, id, options, error, disabled, placeholder, register, ...props }: SelectAdminProps) => {
    return (
        <div className="relative">
            <select
                name={name}
                id={id}
                disabled={disabled}
                className={`
                    appearance-none border rounded-[0.64rem] text-admin-secondary font-[400] text-[1.3rem] 
                    py-[0.827rem] pr-[4.56rem] pl-[1.52rem] outline-none focus:outline-none w-full
                    transition-[border] duration-150
                    ${error ? "border-red-500" : "border-[#e2e7f1] focus:border-admin-primary"}
                    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                `}
                {...(register || {})}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((item: SelectOption) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
            <NavArrowDown className="absolute top-[50%] right-[10px] translate-y-[-50%] pointer-events-none w-[2rem] h-[2rem]" />
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
        </div>
    );
};