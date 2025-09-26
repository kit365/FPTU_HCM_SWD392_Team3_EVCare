export const LabelAdmin = ({ content, htmlFor }: { content: string, htmlFor: string }) => {
    return (
        <>
            <label htmlFor={htmlFor} className="inline-block mb-[0.8rem] font-[500] text-[#656d9a] text-[1.3rem]">{content} <span className="text-red-500">*</span></label>
        </>
    )
}