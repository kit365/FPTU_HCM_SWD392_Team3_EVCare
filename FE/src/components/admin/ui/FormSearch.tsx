import type { FormEvent } from "react";

interface FormSearchProps {
    onSearch: (value: string) => void;
}

export const FormSearch = ({ onSearch }: FormSearchProps) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const searchValue = e.currentTarget.search.value;
        onSearch(searchValue);
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="flex items-center mb-[2.4rem] w-[50%] h-[37.6px]">
                <input
                    name="search"
                    type="text"
                    placeholder="Từ khóa..."
                    className="h-full flex-1 text-admin-secondary text-[1.3rem] font-[400] leading-1.5 bg-[#ffffff] border border-[#e2e7f1] py-[0.83rem] px-[1.52rem] rounded-l-[0.64rem] focus:border-[#24c660] focus:outline-none transition-[border] duration-150"
                />
                <button type="submit" className="h-full inline-block text-[1.3rem] font-[500] leading-1.5 border border-[#95a0c5] bg-[#95a0c5] text-white py-[0.83rem] px-[1.52rem] cursor-pointer shadow-[0_1px_2px_0_rgba(149,160,197,0.35)] rounded-r-[0.64rem] hover:shadow-none hover:bg-[#8e98bb] hover:border-[#8e98bb] transition-[background-color, border-color] duration-150">Tìm kiếm</button>
            </form>
        </>
    )
}