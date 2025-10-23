import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { FormSearch } from "../../../components/admin/ui/FormSearch";
import { Table } from "../../../components/admin/ui/Table";
import { Pagination } from "../../../components/admin/ui/Pagination";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import { useServiceType } from "../../../hooks/useServiceType";
import { pathAdmin } from "../../../constants/paths.constant";

const SERVICE_TYPE_TABLE_HEADERS = [
  { key: "serviceName", label: "Tên dịch vụ" },
  { key: "description", label: "Mô tả" },
  { key: "vehicleTypeResponse", label: "Loại xe" },
  { key: "isActive", label: "Trạng thái" },
  { key: "createdAt", label: "Ngày tạo" },
  { key: "actions", label: "Thao tác" }
];

export const ServiceTypeList = () => {
  const { list, loading, totalPages, totalElements, search, remove, restore } = useServiceType();
  const [currentPage, setCurrentPage] = useState(0);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    search({ page: currentPage, pageSize: 10, keyword });
  }, [currentPage, keyword, search]);

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa loại dịch vụ này?")) {
      const success = await remove(id);
      if (success) {
        search({ page: currentPage, pageSize: 10, keyword });
      }
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục loại dịch vụ này?")) {
      const success = await restore(id);
      if (success) {
        search({ page: currentPage, pageSize: 10, keyword });
      }
    }
  };

  const formatData = (data: any[]) => {
    return data.map((item) => ({
      ...item,
      vehicleTypeResponse: item.vehicleTypeResponse?.vehicleTypeName || "N/A",
      isActive: item.isActive ? "Hoạt động" : "Không hoạt động",
      createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
    }));
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <CardHeaderAdmin title="Quản lý loại dịch vụ" />
        
        <div className="px-[2.4rem] pb-[2.4rem]">
          <div className="flex justify-between items-center mb-6">
            <FormSearch onSearch={handleSearch} placeholder="Tìm kiếm loại dịch vụ..." />
            <Link
              to={`/${pathAdmin}/service-type/create`}
              className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
            >
              Thêm loại dịch vụ
            </Link>
          </div>

          {Array.isArray(list) && list.length === 0 && !loading ? (
            <FormEmpty title="Không có loại dịch vụ nào" />
          ) : (
            <>
              <Table
                headers={SERVICE_TYPE_TABLE_HEADERS}
                data={formatData(list)}
                loading={loading}
                onDelete={handleDelete}
                onRestore={handleRestore}
                editPath={`/${pathAdmin}/service-type/edit`}
                viewPath={`/${pathAdmin}/service-type/view`}
              />
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
