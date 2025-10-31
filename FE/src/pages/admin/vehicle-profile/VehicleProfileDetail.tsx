import { Card } from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useVehicleProfile } from "../../../hooks/useVehicleProfile";
import { useEffect, useCallback, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { pathAdmin } from "../../../constants/paths.constant";

export const VehicleProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById } = useVehicleProfile();
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getById(id);
      if (data) {
        setVehicleData(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id, getById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <div className="py-3 border-b border-gray-100">
      <div className="text-[1.2rem] text-gray-500 mb-1">{label}</div>
      <div className="text-[1.4rem] font-[500] text-gray-900">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        <div className="px-[2.4rem] py-[2.4rem] flex items-center justify-between border-b border-gray-200">
          <h1 className="text-[2rem] font-[700] text-[#2b2d3b]">Chi tiết hồ sơ xe</h1>
          <div className="flex gap-2">
            <Link
              to={`/${pathAdmin}/vehicle-profile/edit/${id}`}
              className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#f39c12] border-[#f39c12] shadow-[0_1px_2px_0_rgba(243,156,18,0.35)]"
            >
              <EditIcon className="!w-[1.6rem] !h-[1.6rem]" />
              Chỉnh sửa
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#6c757d] border-[#6c757d] shadow-[0_1px_2px_0_rgba(108,117,125,0.35)]"
            >
              <ArrowBackIcon className="!w-[1.6rem] !h-[1.6rem]" />
              Quay lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-[2.4rem] py-[4rem]">
            {/* Loading Skeleton */}
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i}>
                  <div className="h-[1.2rem] bg-gray-200 rounded w-[20%] mb-2"></div>
                  <div className="h-[1.8rem] bg-gray-300 rounded w-[40%]"></div>
                </div>
              ))}
            </div>
          </div>
        ) : vehicleData ? (
          <div className="px-[2.4rem] py-[2.4rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {/* Cột trái */}
              <div>
                <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b] mb-4 pb-2 border-b-2 border-blue-500">
                  Thông tin xe
                </h2>
                <InfoRow label="Loại xe" value={vehicleData.vehicleType?.vehicleTypeName} />
                <InfoRow label="Biển số xe" value={vehicleData.plateNumber} />
                <InfoRow label="Số khung (VIN)" value={vehicleData.vin} />
                <InfoRow 
                  label="Km hiện tại" 
                  value={vehicleData.currentKm ? `${vehicleData.currentKm.toLocaleString()} km` : undefined} 
                />
                <InfoRow label="Ngày bảo trì gần nhất" value={formatDate(vehicleData.lastMaintenanceDate)} />
                <InfoRow 
                  label="Km bảo trì gần nhất" 
                  value={vehicleData.lastMaintenanceKm ? `${vehicleData.lastMaintenanceKm.toLocaleString()} km` : undefined} 
                />
              </div>

              {/* Cột phải */}
              <div>
                <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b] mb-4 pb-2 border-b-2 border-green-500">
                  Thông tin khách hàng
                </h2>
                <InfoRow label="Tên khách hàng" value={vehicleData.user?.fullName || vehicleData.user?.username} />
                <InfoRow label="Email" value={vehicleData.user?.email} />
                <InfoRow label="Số điện thoại" value={vehicleData.user?.numberPhone} />
                <InfoRow label="Địa chỉ" value={vehicleData.user?.address} />

                <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b] mb-4 pb-2 border-b-2 border-purple-500 mt-6">
                  Thông tin hệ thống
                </h2>
                <InfoRow label="Ngày tạo" value={formatDateTime(vehicleData.createdAt)} />
                <InfoRow label="Người tạo" value={vehicleData.createdBy} />
                <InfoRow label="Ngày cập nhật" value={formatDateTime(vehicleData.updatedAt)} />
                <InfoRow label="Người cập nhật" value={vehicleData.updatedBy} />
              </div>

              {/* Ghi chú (full width) */}
              {vehicleData.notes && (
                <div className="col-span-1 md:col-span-2 mt-6">
                  <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b] mb-4 pb-2 border-b-2 border-orange-500">
                    Ghi chú
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[1.4rem] text-gray-700 whitespace-pre-wrap">
                      {vehicleData.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-[2.4rem] py-[4rem] text-center">
            <p className="text-[1.6rem] text-gray-500">Không tìm thấy thông tin hồ sơ xe</p>
          </div>
        )}
      </Card>
    </div>
  );
};

