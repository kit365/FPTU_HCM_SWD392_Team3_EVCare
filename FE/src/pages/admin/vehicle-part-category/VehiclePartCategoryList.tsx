import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Popconfirm } from 'antd';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useVehiclePartCategory } from "../../../hooks/useVehiclePartCategory";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import HasRole from "../../../components/common/HasRole";
import { RoleEnum } from "../../../constants/roleConstants";
import { useAuthContext } from "../../../context/useAuthContext";

const columns = [
  { title: "STT", width: 5 },
  { title: "Tên danh mục", width: 30 },
  { title: "Mô tả", width: 40 },
  { title: "Hành động", width: 15 },
];

export const VehiclePartCategoryList = () => {
  const { user } = useAuthContext();
  const roles = user?.roleName || [];
  const canCreate = roles.includes(RoleEnum.ADMIN);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");

  const { list, totalPages, search, remove } = useVehiclePartCategory();

  const load = useCallback(() => {
    search({ page: currentPage - 1, pageSize, keyword });
  }, [currentPage, pageSize, keyword, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) load();
  };

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setKeyword(value);
    // Tự động search khi xóa hết keyword
    if (value === "") {
      setCurrentPage(1);
    }
  }, []);

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin 
          title="Danh sách danh mục phụ tùng" 
          href={canCreate ? `/admin/vehicle-part-category/create` : undefined} 
          content={canCreate ? "Tạo danh mục phụ tùng" : undefined} 
        />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          <FormSearch onSearch={handleSearch} onChange={handleSearchChange} value={keyword} />

          <table className="w-full">
            <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className={`p-[1.2rem] font-[500] text-center ${index === 0 ? "rounded-l-[8px]" : ""} ${index === columns.length - 1 ? "rounded-r-[8px]" : ""}`} style={{ width: `${col.width}%` }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#2b2d3b] text-[1.3rem]">
              {Array.isArray(list) && list.length > 0 ? (
                list.map((item: any, index: number) => (
                  <tr key={item.vehiclePartCategoryId} className={`border-b border-gray-200 text-center ${index !== (Array.isArray(list) ? list.length - 1 : 0) ? "border-dashed" : "border-none"} ${index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"}`}>
                    <td className="p-[1.2rem]">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="p-[1.2rem]">{item.partCategoryName}</td>
                    <td className="p-[1.2rem]">{item.description || '-'}</td>
                    <td className="p-[1.2rem] text-center flex justify-center">
                      <Link to={`/admin/vehicle-part-category/view/${item.vehiclePartCategoryId}`} className="text-green-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80" title="Xem chi tiết">
                        <RemoveRedEyeIcon className="!w-full !h-full" />
                      </Link>
                      <HasRole allow={RoleEnum.ADMIN}>
                        <Link to={`/admin/vehicle-part-category/edit/${item.vehiclePartCategoryId}`} className="text-blue-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80" title="Chỉnh sửa">
                          <EditIcon className="!w-full !h-full" />
                        </Link>
                      </HasRole>
                      <HasRole allow={RoleEnum.ADMIN}>
                        <Popconfirm title="Xóa danh mục phụ tùng" description="Bạn chắc chắn xóa danh mục phụ tùng này?" onConfirm={() => handleDelete(item.vehiclePartCategoryId)} okText="Đồng ý" cancelText="Hủy" placement="left">
                          <button className="text-red-500 w-[2rem] h-[2rem] cursor-pointer hover:opacity-80">
                            <DeleteOutlineIcon className="!w-full !h-full" />
                          </button>
                        </Popconfirm>
                      </HasRole>
                    </td>
                  </tr>
                ))
              ) : (
                <FormEmpty colspan={columns.length} />
              )}
            </tbody>
          </table>

          {Array.isArray(list) && list.length > 0 && (
            <Stack spacing={2} className="mt-[2rem]">
              <Pagination count={totalPages} page={currentPage} color="primary" onChange={(_, value) => setCurrentPage(value)} />
            </Stack>
          )}
        </div>
      </Card>
    </div>
  );
};
