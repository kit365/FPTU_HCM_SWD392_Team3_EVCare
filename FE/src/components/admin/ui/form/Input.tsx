import { forwardRef } from "react";

interface InputAdminProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    id: string;
    type?: string;
    placeholder?: string;
    error?: string;
}

export const InputAdmin = forwardRef<HTMLInputElement, InputAdminProps>(({ name, id, type = "text", placeholder, error, ...rest }, ref) => {
    return (
        <>
            <input
                name={name}
                id={id}
                ref={ref}
                type={type}
                placeholder={placeholder}
                className="w-full py-[0.83rem] px-[1.52rem] block text-[1.3rem]
                 font-[400] leading-1.5 appearance-none outline-none border
                  border-[#e2e7f1] rounded-[0.64rem] focus:border-[#24c660] 
                  focus:outline-none transition-[border] duration-150"

                {...rest}
            />
            {error && (
                <p className="mt-[6px] text-[1.2rem] text-red-500">{error}</p>
            )}
        </>
    )
});