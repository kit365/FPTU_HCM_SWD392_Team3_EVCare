import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Pagination, Stack } from "@mui/material";

interface TableAdminProps {
    dataList: any[];
    limit?: number;
    columns: any[];
}

export const TableAdmin = ({ dataList, limit, columns }: TableAdminProps) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sort, setSort] = useState({ key: "name", value: "desc" });

    // Sắp xếp
    const handleHeaderClick = (header: any) => {
        if (header.key === "actions" || header.key === "stt" || header.key === "checkbox") return;
        setSort({
            key: header.key,
            value:
                header.key === sort.key
                    ? (sort.value === "asc" ? "desc" : "asc")
                    : "desc"
        })
        setCurrentPage(1);
    }

    const sortedData = useMemo(() => {
        if (!sort?.key) return [...dataList];

        const newArray = [...dataList];

        newArray.sort((a: any, b: any) => {
            const A = a[sort.key];
            const B = b[sort.key];

            // numeric comparison
            const numA = Number(A);
            const numB = Number(B);
            if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                return sort.value === "asc" ? numA - numB : numB - numA;
            }

            // date comparison
            const timeA = Date.parse(String(A));
            const timeB = Date.parse(String(B));
            if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
                return sort.value === "asc" ? timeA - timeB : timeB - timeA;
            }

            // string comparison
            return sort.value === "asc"
                ? String(A).localeCompare(String(B), "vi", { sensitivity: "base", numeric: true })
                : String(B).localeCompare(String(A), "vi", { sensitivity: "base", numeric: true });
        });

        return newArray;
    }, [dataList, sort]);

    // Hết Sắp xếp

    // Phân trang
    const pageSize = limit || 8;
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const currentPageData = useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize]
    );

    // Chọn tất cả
    const toggleSelectAllPage = () => {
        const pageIds = currentPageData.map((item) => item.id);
        setSelected((prev) => {
            const newSet = new Set(prev);
            const allSelected = pageIds.every((id) => newSet.has(id));
            if (allSelected) {
                pageIds.forEach((id) => newSet.delete(id));
            } else {
                pageIds.forEach((id) => newSet.add(id));
            }
            return newSet;
        });
    };

    // Chọn 1
    const toggleSelectOne = (id: string) => {
        setSelected((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    return (
        <>
            <div className="px-[2.4rem] pb-[2.4rem]">
                <table className="w-full">
                    <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={col.key}
                                    className={`p-[1.2rem] font-[500] 
                                        ${index === 0 ? "rounded-l-[8px]" : ""}
                                        ${index === columns.length - 1 ? "rounded-r-[8px]" : ""}`}
                                    style={{
                                        width: `${col.width}%`,
                                        textAlign: col.align || "left",
                                    }}
                                    onClick={() => handleHeaderClick(col)}
                                >
                                    {col.key === "checkbox" ? (
                                        <input
                                            type="checkbox"
                                            checked={currentPageData.every((item) =>
                                                selected.has(item.id)
                                            )}
                                            onChange={toggleSelectAllPage}
                                        />
                                    ) : (
                                        <div>
                                            <span>{col.title}</span>
                                            {col.key === sort.key && (
                                                sort.value === "asc" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-[#2b2d3b] text-[1.3rem]">
                        {currentPageData.map((item: any, index: number) => (
                            <tr
                                key={item.id}
                                className={`border-b border-gray-200 ${index !== dataList.length - 1 ? "border-dashed" : "border-none"
                                    } ${index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"}`}
                            >
                                {columns.map((col) => {
                                    if (col.key === "checkbox") {
                                        return (
                                            <td key={col.key} className="p-[1.2rem] text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(item.id)}
                                                    onChange={() => toggleSelectOne(item.id)}
                                                />
                                            </td>
                                        );
                                    }

                                    if (col.key === "stt") {
                                        return (
                                            <td key={col.key} className="p-[1.2rem]">
                                                {(currentPage - 1) * pageSize + index + 1}
                                            </td>
                                        );
                                    }

                                    if (col.key === "status") {
                                        return (
                                            <td key={col.key} className="p-[1.2rem]">
                                                <span
                                                    className={`text-white text-[1.1rem] leading-1 rounded-[6.4px] px-2 py-1 transition-[filter] duration-300 hover:brightness-95 cursor-pointer ${item.status === "active"
                                                        ? "bg-[#22C5AD]"
                                                        : "bg-[#EF4D56]"
                                                        }`}
                                                >
                                                    {item.status === "active" ? "Hoạt động" : "Tạm dừng"}
                                                </span>
                                            </td>
                                        );
                                    }

                                    if (col.key === "actions") {
                                        return (
                                            <td
                                                key={col.key}
                                                className="p-[1.2rem] text-center flex justify-center"
                                            >
                                                <Link
                                                    to={"#"}
                                                    className="text-blue-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80"
                                                >
                                                    <EditIcon className="!w-full !h-full" />
                                                </Link>
                                                <button className="text-red-500 w-[2rem] h-[2rem] cursor-pointer hover:opacity-80">
                                                    <DeleteOutlineIcon className="!w-full !h-full" />
                                                </button>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={col.key} className="p-[1.2rem]">
                                            {item[col.key]}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Stack spacing={2}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    color="primary"
                    onChange={(_, value) => setCurrentPage(value)}
                />
            </Stack>
        </>
    );
};
