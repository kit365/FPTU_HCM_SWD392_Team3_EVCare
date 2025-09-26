import { Heart } from "iconoir-react"

export const FooterAdmin = () => {
    return (
        <div className="px-[1.2rem] mt-[2.4rem]">
            <div className="w-full bg-white shadow-[0_3px_16px_rgba(142,134,171,.05)] rounded-t-[0.64rem]">
                <div className="max-w-[1320px] mx-auto flex items-center justify-between p-[2.4rem] text-[#96a0b5] text-[1.3rem] font-[400]">
                    <p>© 2025 Maika</p>
                    <p className="flex items-center">Crafted with <Heart className="text-[#ef4d56] w-[1.3rem] h-[1.3rem] mb-[3px] mx-[2px]" /> by beautiful Maika</p>
                </div>
            </div>
        </div>

    )
}