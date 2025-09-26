export const InputAdmin = ({ name, id, type = "text", placeholder }: { name: string, id: string, type?: string, placeholder: string }) => {
    return (
        <>
            <input
                name={name}
                id={id}
                type={type}
                placeholder={placeholder}
                className="w-full py-[0.83rem] px-[1.52rem] block text-[1.3rem] font-[400] leading-1.5 appearance-none outline-none border border-[#e2e7f1] rounded-[0.64rem] focus:border-[#24c660] focus:outline-none transition-[border] duration-150" />
        </>
    )
}