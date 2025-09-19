interface BaseButtonProps {
    icon?: React.ElementType;
    className?: string;
}


export interface ButtonItemProps extends BaseButtonProps {
    href: string;
    text: string;
}

export interface ButtonProps extends BaseButtonProps {
    href?: string;
    text: string;
}