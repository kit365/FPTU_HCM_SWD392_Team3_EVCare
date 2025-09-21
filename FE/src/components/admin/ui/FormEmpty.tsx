interface FormEmptyProps {
    colspan: number;
}

export const FormEmpty = ({ colspan }: FormEmptyProps) => {
    return (
        <tr>
            <td
                colSpan={colspan}
                className="text-center text-admin-secondary p-[2.5rem] pb-0 text-[1.3rem] font-[400]"
            >
                Không có dữ liệu nào để hiển thị
            </td>
        </tr>
    );
};