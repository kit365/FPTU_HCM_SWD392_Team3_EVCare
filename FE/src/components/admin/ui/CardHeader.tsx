import { ButtonAdmin } from "./Button";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";

interface CardHeaderProps {
    title: string;
    buttons?: ButtonItemProps[];
}

export const CardHeaderAdmin = ({ title, buttons = [] }: CardHeaderProps) => {
    return (
        <div className="p-[2.4rem] flex items-center justify-between">
            <h2 className="text-admin-secondary text-[1.6rem] font-[500] leading-[1.2]">{title}</h2>
            <div className="flex items-center">
                {buttons.map((btn: ButtonItemProps, index: number) => (
                    <ButtonAdmin
                        key={`${btn.href}-${index}`}
                        icon={btn.icon}
                        href={btn.href}
                        text={btn.text}
                        className={btn.className}
                    />
                ))}
            </div>
        </div>
    )
}
