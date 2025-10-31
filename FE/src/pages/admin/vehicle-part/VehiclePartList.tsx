import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Popconfirm } from 'antd';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useVehiclePart } from "../../../hooks/useVehiclePart";

const columns = [
  { title: "STT", width: 5 },
  { title: "Tên phụ tùng", width: 15 },
  { title: "Danh mục phụ tùng", width: 15 },
  { title: "Loại xe", width: 12 },
  { title: "Số lượng", width: 8 },
  { title: "Tồn tối thiểu", width: 8 },
  { title: "Giá", width: 8 },
  { title: "Trạng thái", width: 8 },
  { title: "Hành động", width: 11 },
];

export const VehiclePartList = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");

  const { list, totalPages, search, remove } = useVehiclePart();

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

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Danh sách phụ tùng" href={`/admin/vehicle-part/create`} content="Tạo phụ tùng" />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          <FormSearch onSearch={handleSearch} />

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
                  <tr key={item.vehiclePartId} className={`border-b border-gray-200 text-center ${index !== (Array.isArray(list) ? list.length - 1 : 0) ? "border-dashed" : "border-none"} ${index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"}`}>
                    <td className="p-[1.2rem]">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="p-[1.2rem]">{item.vehiclePartName}</td>
                    <td className="p-[1.2rem]">{item.vehiclePartCategory?.partCategoryName || '-'}</td>
                    <td className="p-[1.2rem]">{item.vehicleType?.vehicleTypeName || '-'}</td>
                    <td className="p-[1.2rem]">{item.currentQuantity}</td>
                    <td className="p-[1.2rem]">{item.minStock}</td>
                    <td className="p-[1.2rem]">{item.unitPrice?.toLocaleString('vi-VN')}</td>
                    <td className="p-[1.2rem]">
                      <span className={`px-2 py-1 rounded-full text-[1rem] font-medium ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        item.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {item.status === 'AVAILABLE' ? 'Còn hàng' :
                          item.status === 'LOW_STOCK' ? 'Sắp hết' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="p-[1.2rem] text-center flex justify-center">
                      <Link to={`/admin/vehicle-part/view/${item.vehiclePartId}`} className="text-green-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80" title="Xem chi tiết">
                        <RemoveRedEyeIcon className="!w-full !h-full" />
                      </Link>
                      <Link to={`/admin/vehicle-part/edit/${item.vehiclePartId}`} className="text-blue-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80" title="Chỉnh sửa">
                        <EditIcon className="!w-full !h-full" />
                      </Link>
                      <Popconfirm title="Xóa phụ tùng" description="Bạn chắc chắn xóa phụ tùng này?" onConfirm={() => handleDelete(item.vehiclePartId)} okText="Đồng ý" cancelText="Hủy" placement="left">
                        <button className="text-red-500 w-[2rem] h-[2rem] cursor-pointer hover:opacity-80">
                          <DeleteOutlineIcon className="!w-full !h-full" />
                        </button>
                      </Popconfirm>
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
