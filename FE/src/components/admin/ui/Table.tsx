import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Pagination, Stack } from "@mui/material";
import slugify from "slugify";
import { FormSearch } from "./FormSearch";
import { FormEmpty } from "./FormEmpty";
import { StatusFilter } from "./StatusFilter";
import { BulkActionBar } from "./BulkActionBar";
import { compareBySort, matchesSearch, matchesStatus } from "../../../utils/admin/table";

interface TableAdminProps {
    dataList: any[];
    limit?: number;
    columns: any[];
}

export const TableAdmin = ({ dataList, limit, columns }: TableAdminProps) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sort, setSort] = useState({ key: "name", value: "desc" });
    const [search, setSearch] = useState<string>('');

    const processedData = useMemo(() => {
        const keyword = search ? slugify(search, { replacement: " ", lower: true }) : null;

        return [...dataList]
            .filter(item => matchesSearch(item, keyword) && matchesStatus(item, statusFilter))
            .sort((a, b) => compareBySort(a, b, sort as { key: string; value: "asc" | "desc" }))
    }, [dataList, search, sort, statusFilter]);

    // Phân trang
    const pageSize = limit || 8;
    const totalPages = Math.ceil(processedData.length / pageSize);

    const currentPageData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return processedData.slice(startIndex, endIndex);
    }, [processedData, currentPage, pageSize]);
    // Hết Phân trang

    // Sắp xếp
    const handleHeaderClick = (header: any) => {
        if (header.key === "actions" || header.key === "stt" || header.key === "checkbox") return;

        setSort({
            key: header.key,
            value: header.key === sort.key
                ? (sort.value === "asc" ? "desc" : "asc")
                : "desc"
        });
        setCurrentPage(1);
    };
    // Hết Sắp xếp

    // Tìm kiếm
    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setCurrentPage(1);
    }, [])
    // Hết tìm kiếm

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

    // Lọc theo trạng thái
    const handleChangeStatus = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatusFilter(value);
        setCurrentPage(1);
    }, []);
    // Hết Lọc theo trạng thái

    return (
        <>
            <div className="px-[2.4rem] pb-[2.4rem] h-full">
                <div className="flex items-start justify-between">
                    <FormSearch onSearch={handleSearch} />
                    <StatusFilter value={statusFilter} onChange={handleChangeStatus} />
                </div>

                <BulkActionBar
                    count={selected.size}
                    entityName="nhân viên"
                />
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
                                        currentPageData.length > 0 && (
                                            <input
                                                type="checkbox"
                                                checked={currentPageData.every((item) =>
                                                    selected.has(item.id)
                                                )}
                                                onChange={toggleSelectAllPage}
                                            />
                                        )
                                    ) : (
                                        <div>
                                            <span className="cursor-pointer">{col.title}</span>
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
                        {currentPageData.length > 0 ? (
                            currentPageData.map((item: any, index: number) => (
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
                            ))
                        ) : (
                            <FormEmpty colspan={columns.length} />
                        )}
                    </tbody>
                </table>

                {currentPageData.length > 0 && (
                    <Stack spacing={2} className="mt-[2rem]">
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            color="primary"
                            onChange={(_, value) => setCurrentPage(value)}
                        />
                    </Stack>
                )}
            </div>
        </>
    );
};
