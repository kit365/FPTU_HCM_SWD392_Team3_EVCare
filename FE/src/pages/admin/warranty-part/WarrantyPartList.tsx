import { Card, Pagination, Stack } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popconfirm } from 'antd';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useWarrantyPart } from "../../../hooks/useWarrantyPart";
import HasRole from "../../../components/common/HasRole";
import { RoleEnum } from "../../../constants/roleConstants";
import { useAuthContext } from "../../../context/useAuthContext";

const columns = [
  { title: "STT", width: 5 },
  { title: "Phụ tùng", width: 20 },
  { title: "Loại giảm giá", width: 12 },
  { title: "Giá trị giảm giá", width: 12 },
  { title: "Thời gian hiệu lực", width: 15 },
  { title: "Trạng thái", width: 10 },
  { title: "Hành động", width: 16 },
];

const getValidityPeriodUnitLabel = (unit: string) => {
  switch (unit) {
    case 'DAY':
      return 'ngày';
    case 'MONTH':
      return 'tháng';
    case 'YEAR':
      return 'năm';
    default:
      return unit;
  }
};

const getDiscountTypeLabel = (type: string) => {
  switch (type) {
    case 'PERCENTAGE':
      return 'Giảm giá %';
    case 'FREE':
      return 'Miễn phí';
    default:
      return type;
  }
};

export const WarrantyPartList = () => {
  const { user } = useAuthContext();
  const roles = user?.roleName || [];
  const canCreate = roles.includes(RoleEnum.ADMIN) || roles.includes(RoleEnum.STAFF);
  const canEdit = roles.includes(RoleEnum.ADMIN) || roles.includes(RoleEnum.STAFF);
  const canDelete = roles.includes(RoleEnum.ADMIN) || roles.includes(RoleEnum.STAFF);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>("");

  const { list, totalPages, search, remove } = useWarrantyPart();

  const load = useCallback(() => {
    search({
      page: currentPage - 1,
      pageSize,
      keyword: keyword || undefined,
    });
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
    if (value === "") {
      setCurrentPage(1);
    }
  }, []);

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin 
          title="Danh sách bảo hành phụ tùng" 
          href={canCreate ? `/admin/warranty-part/create` : undefined} 
          content={canCreate ? "Tạo bảo hành phụ tùng" : undefined} 
        />

        <div className="px-[2.4rem] pb-[2.4rem] h-full">
          <FormSearch onSearch={handleSearch} onChange={handleSearchChange} value={keyword} />

          <table className="w-full mt-[2rem]">
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
                  <tr key={item.warrantyPartId} className={`border-b border-gray-200 text-center ${index !== (Array.isArray(list) ? list.length - 1 : 0) ? "border-dashed" : "border-none"} ${index % 2 !== 0 ? "bg-transparent" : "bg-[#FBFBFD]"}`}>
                    <td className="p-[1.2rem]">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="p-[1.2rem]">{item.vehiclePart?.vehiclePartName || '-'}</td>
                    <td className="p-[1.2rem]">{getDiscountTypeLabel(item.discountType)}</td>
                    <td className="p-[1.2rem]">
                      {item.discountType === 'FREE' ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        <span>{item.discountValue || 0}%</span>
                      )}
                    </td>
                    <td className="p-[1.2rem]">
                      {item.validityPeriod} {getValidityPeriodUnitLabel(item.validityPeriodUnit)}
                    </td>
                    <td className="p-[1.2rem]">
                      <span className={`px-2 py-1 rounded-full text-[1rem] font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="p-[1.2rem] text-center flex justify-center">
                      <Link to={`/admin/warranty-part/view/${item.warrantyPartId}`} className="text-green-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80" title="Xem chi tiết">
                        <RemoveRedEyeIcon className="!w-full !h-full" />
                      </Link>
                      {(canEdit || canDelete) && (
                        <>
                          {canEdit && (
                            <Link to={`/admin/warranty-part/edit/${item.warrantyPartId}`} className="text-blue-500 w-[2rem] h-[2rem] mr-2 inline-block hover:opacity-80" title="Chỉnh sửa">
                              <EditIcon className="!w-full !h-full" />
                            </Link>
                          )}
                          {canDelete && (
                            <Popconfirm title="Xóa bảo hành phụ tùng" description="Bạn chắc chắn xóa bảo hành phụ tùng này?" onConfirm={() => handleDelete(item.warrantyPartId)} okText="Đồng ý" cancelText="Hủy" placement="left">
                              <button className="text-red-500 w-[2rem] h-[2rem] cursor-pointer hover:opacity-80">
                                <DeleteOutlineIcon className="!w-full !h-full" />
                              </button>
                            </Popconfirm>
                          )}
                        </>
                      )}
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
