import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Popconfirm } from 'antd';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useVehicleType } from "../../../hooks/useVehicleType";
import { pathAdmin } from "../../../constants/paths.constant";

const columns = [
  { title: "STT", width: 5 },
  { title: "Khách hàng", width: 15 },
  { title: "Email", width: 15 },
  { title: "Loại xe", width: 12 },
  { title: "Biển số xe", width: 10 },
  { title: "Số khung (VIN)", width: 12 },
  { title: "Km hiện tại", width: 10 },
  { title: "Ngày bảo trì gần nhất", width: 12 },
  { title: "Hành động", width: 9 },
];

export const VehicleProfileList = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");
  const [vehicleTypeId, setVehicleTypeId] = useState<string>("");

  const { list, totalPages, search, remove } = useVehicleProfile();
  const { vehicleTypeOptions, fetchVehicleTypeNames } = useVehicleType();

  const load = useCallback(() => {
    search({ 
      page: currentPage - 1, 
      size: pageSize, 
      keyword,
      vehicleTypeId: vehicleTypeId || undefined 
    });
  }, [currentPage, pageSize, keyword, vehicleTypeId, search]);

  useEffect(() => {
    fetchVehicleTypeNames();
  }, [fetchVehicleTypeNames]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const ok = await remove(id);
    if (ok) load();
  };

  const handleSearchChange = (value: string) => {
    setKeyword(value);
    // Tự động search khi xóa hết keyword
    if (value === "") {
      setCurrentPage(1);
    }
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin 
          title="Danh sách hồ sơ xe người dùng" 
          href={`/${pathAdmin}/vehicle-profile/create`} 
          content="Tạo hồ sơ xe" 
        />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          {/* Search and Filter Section */}
          <div className="flex items-center gap-3 mb-6">
            {/* Custom Search Input */}
            <div className="flex-1 flex items-center border-2 border-gray-300 rounded-[0.8rem] focus-within:border-blue-500 transition-colors bg-white h-[4.8rem]">
              <input
                type="text"
                value={keyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="Tìm theo tên, email, SĐT khách hàng hoặc biển số xe..."
                className="flex-1 px-[1.6rem] text-[1.4rem] focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="h-full px-[1.6rem] text-[#95a0c5] hover:text-[#8e98bb] transition-colors"
              >
                <SearchIcon className="!w-[2rem] !h-[2rem]" />
              </button>
            </div>
            
            {/* Vehicle Type Filter */}
            <select
              value={vehicleTypeId}
              onChange={(e) => {
                setVehicleTypeId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-[240px] h-[4.8rem] px-[1.6rem] text-[1.4rem] border-2 border-gray-300 rounded-[0.8rem] focus:border-blue-500 focus:outline-none transition-colors bg-white cursor-pointer hover:border-gray-400"
            >
              <option value="">Tất cả loại xe</option>
              {vehicleTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <table className="w-full">
            <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
              <tr className="h-[5.6rem]">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="font-[600] px-[0.8rem] py-[1.6rem] text-left border-b-2 border-solid border-[#dfe3e7]"
                    style={{ width: `${col.width}%` }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[1.3rem]">
              {list && list.length > 0 ? (
                list.map((item, index) => (
                  <tr
                    key={item.vehicleId}
                    className="border-b border-solid border-[#dfe3e7] hover:bg-[#f4f6f9] transition-colors"
                  >
                    <td className="px-[0.8rem] py-[1.6rem] align-top">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top font-[500]">
                      {item.user?.fullName || item.user?.username || "-"}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top">
                      {item.user?.email || "-"}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top">
                      {item.vehicleType?.vehicleTypeName || "-"}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top font-[600]">
                      {item.plateNumber || "-"}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top text-[1.2rem] text-gray-600">
                      {item.vin || "-"}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top">
                      {item.currentKm ? `${item.currentKm.toLocaleString()} km` : "-"}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top">
                      {formatDate(item.lastMaintenanceDate)}
                    </td>
                    <td className="px-[0.8rem] py-[1.6rem] align-top">
                      <div className="flex items-center gap-[0.6rem]">
                        <Link
                          to={`/${pathAdmin}/vehicle-profile/view/${item.vehicleId}`}
                          className="text-[#3498db] hover:opacity-80"
                          title="Xem chi tiết"
                        >
                          <RemoveRedEyeIcon className="!w-[2rem] !h-[2rem]" />
                        </Link>
                        <Link
                          to={`/${pathAdmin}/vehicle-profile/edit/${item.vehicleId}`}
                          className="text-[#f39c12] hover:opacity-80"
                          title="Chỉnh sửa"
                        >
                          <EditIcon className="!w-[2rem] !h-[2rem]" />
                        </Link>
                        <Popconfirm
                          title="Xóa hồ sơ xe"
                          description="Bạn chắc chắn muốn xóa hồ sơ xe này?"
                          onConfirm={() => handleDelete(item.vehicleId)}
                          okText="Đồng ý"
                          cancelText="Hủy"
                        >
                          <button className="text-[#e74c3c] hover:opacity-80" title="Xóa">
                            <DeleteOutlineIcon className="!w-[2rem] !h-[2rem]" />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <FormEmpty />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  color="primary"
                  onChange={(_, page) => setCurrentPage(page)}
                  showFirstButton
                  showLastButton
                  size="large"
                />
              </Stack>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

