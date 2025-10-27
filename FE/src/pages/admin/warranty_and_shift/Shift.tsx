import { useState, useEffect, useCallback } from 'react';
import { Card } from "@mui/material";
import { Plus } from 'iconoir-react';
import { pathAdmin } from "../../../constants/paths.constant";
import { TableAdmin } from "../../../components/admin/ui/Table";
import { CreateShiftModal } from "./components/CreateShiftModal";

// Shift Interface
interface ShiftProps {
  shiftId: string;
  staffName: string;
  staffId: string;
  serviceMode: string;
  serviceTypeName: string;
  workDate: string;
  workTime: string;
  appointmentId: string;
}

// Fake data cho ca làm
const fakeShiftData: ShiftProps[] = [
  {
    shiftId: "1",
    staffName: "Nguyễn Văn A",
    staffId: "staff-001",
    serviceMode: "STATIONARY",
    serviceTypeName: "Bảo dưỡng định kỳ",
    workDate: "2025-10-27",
    workTime: "08:00 - 12:00",
    appointmentId: "apt-001"
  },
  {
    shiftId: "2",
    staffName: "Trần Thị B",
    staffId: "staff-002",
    serviceMode: "MOBILE",
    serviceTypeName: "Sửa chữa hệ thống điện",
    workDate: "2025-10-27",
    workTime: "13:00 - 17:00",
    appointmentId: "apt-002"
  },
  {
    shiftId: "3",
    staffName: "Lê Văn C",
    staffId: "staff-003",
    serviceMode: "STATIONARY",
    serviceTypeName: "Thay thế pin",
    workDate: "2025-10-28",
    workTime: "08:00 - 12:00",
    appointmentId: "apt-003"
  },
];

const Shift = () => {
  const [shiftList, setShiftList] = useState<ShiftProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setShiftList(fakeShiftData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setLoading(false);
    }
  }, []);

  // Load data
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Table headers
  const headers = [
    { key: 'stt', label: 'STT' },
    { key: 'staffName', label: 'Tên nhân viên' },
    { key: 'serviceMode', label: 'Loại dịch vụ' },
    { key: 'serviceTypeName', label: 'Tên dịch vụ' },
    { key: 'workDate', label: 'Ngày làm' },
    { key: 'workTime', label: 'Giờ làm' },
    { key: 'actions', label: 'Hành động' },
  ];

  // Map service mode to Vietnamese
  const mapServiceMode = (mode: string) => {
    return mode === 'STATIONARY' ? 'Tại trung tâm' : 'Di động';
  };

  // Prepare data for table with STT and mapped service mode
  const dataWithIndex = shiftList.map((shift, index) => ({
    ...shift,
    stt: index + 1,
    serviceMode: mapServiceMode(shift.serviceMode),
  }));

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateSuccess = () => {
    fetchShifts();
  };

  return (
    <div className="max-w-[1320px] px-[12px] mx-auto">
      <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
        {/* Header */}
        <div className="p-[2.4rem] flex items-center justify-between">
          <h2 className="text-admin-secondary text-[1.6rem] font-[500] leading-[1.2]">
            Quản lý ca làm nhân viên
          </h2>
          <button
            onClick={handleOpenModal}
            className="flex items-center cursor-pointer text-white text-[1.3rem] font-[500] py-[0.82rem] px-[1.52rem] leading-[1.5] border rounded-[0.64rem] hover:opacity-90 transition-opacity duration-150 ease-in-out bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]"
          >
            <Plus className="w-[2rem] h-[2rem] mr-[0.5rem]" />
            <span>Tạo ca làm</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-[2.4rem] pb-[2.4rem]">
          {dataWithIndex.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="text-[6rem] mb-4">📅</div>
              <p className="text-[1.6rem] text-gray-600 font-[500] mb-2">
                Chưa có ca làm nào
              </p>
              <p className="text-[1.3rem] text-gray-500">
                Nhấn nút "Tạo ca làm" để phân công nhân viên
              </p>
            </div>
          ) : (
            <TableAdmin
              headers={headers}
              data={dataWithIndex}
              loading={loading}
              editPath={`/${pathAdmin}/shift/edit`}
            />
          )}
        </div>
      </Card>

      {/* Create Shift Modal */}
      <CreateShiftModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Shift;
