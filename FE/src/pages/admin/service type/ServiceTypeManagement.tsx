import { pathAdmin } from '../../../constants/paths.constant'
import { Card } from 'antd';
import { CardHeaderAdmin } from '../../../components/admin/ui/CardHeader';
import { TableAdmin } from '../../../components/admin/ui/Table';
import { Plus, TrashSolid } from 'iconoir-react';
import type { ButtonItemProps } from '../../../types/admin/button-item.types';
import type { ServiceTypeProps } from '../../../types/admin/service.types';

const ServiceTypeManagement = () => {
    const buttonsList: ButtonItemProps[] = [
        {
            icon: TrashSolid,
            href: `/${pathAdmin}/staff/trash`,
            text: "Thùng rác",
            className: "bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] mr-[0.6rem]",
        },
        {
            icon: Plus,
            href: `/${pathAdmin}/staff/create`,
            text: "Tạo tài khoản",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },
    ]

  const serviceList: ServiceTypeProps[] = [
  // --- Nhóm Khẩn cấp ---
  { serviceTypeId: "1", serviceName: "Cứu hộ xe", serviceType: "Khẩn cấp" },
  { serviceTypeId: "2", serviceName: "Cứu thương", serviceType: "Khẩn cấp" },
  { serviceTypeId: "3", serviceName: "Chữa cháy", serviceType: "Khẩn cấp" },

  // --- Nhóm Vận chuyển ---
  { serviceTypeId: "4", serviceName: "Xe tải", serviceType: "Vận chuyển" },
  { serviceTypeId: "5", serviceName: "Xe container", serviceType: "Vận chuyển" },
  { serviceTypeId: "6", serviceName: "Xe chở hàng", serviceType: "Vận chuyển" },
  { serviceTypeId: "7", serviceName: "Xe đầu kéo", serviceType: "Vận chuyển" },

  // --- Nhóm Cá nhân ---
  { serviceTypeId: "8", serviceName: "Xe máy", serviceType: "Cá nhân" },
  { serviceTypeId: "9", serviceName: "Ô tô", serviceType: "Cá nhân" },
  { serviceTypeId: "10", serviceName: "Xe mô tô phân khối lớn", serviceType: "Cá nhân" },
  { serviceTypeId: "11", serviceName: "Xe tự lái", serviceType: "Cá nhân" },
  { serviceTypeId: "12", serviceName: "Xe điện", serviceType: "Cá nhân" },
  { serviceTypeId: "13", serviceName: "Xe hybrid", serviceType: "Cá nhân" },
  { serviceTypeId: "14", serviceName: "Xe đạp điện", serviceType: "Cá nhân" },

  // --- Nhóm Công cộng ---
  { serviceTypeId: "15", serviceName: "Xe bus", serviceType: "Công cộng" },
  { serviceTypeId: "16", serviceName: "Xe bus mini", serviceType: "Công cộng" },
  { serviceTypeId: "17", serviceName: "Xe taxi", serviceType: "Công cộng" },
  { serviceTypeId: "18", serviceName: "Xe du lịch", serviceType: "Công cộng" },

  // --- Nhóm Chuyên dụng ---
  { serviceTypeId: "19", serviceName: "Xe cẩu", serviceType: "Chuyên dụng" },
  { serviceTypeId: "20", serviceName: "Xe bồn", serviceType: "Chuyên dụng" },
  { serviceTypeId: "21", serviceName: "Xe chuyên dụng khác", serviceType: "Chuyên dụng" },
];




    interface TableColumn {
        title: string;
        width: number;
        align?: "left" | "center" | "right";
        key?: string;
    }

    const columns: TableColumn[] = [
        { title: "", width: 5, align: "center", key: "checkbox" },
        { title: "STT", width: 10, align: "left", key: "stt" },
        { title: "Tên dịch vụ", width: 15, key: "serviceName" },
        { title: "Loại dịch vụ", width: 15, key: "serviceType" },
        { title: "Hành động", width: 20, align: "center", key: "actions" },
    ];

    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Danh sách nhân viên"
                        buttons={buttonsList}
                    />
                    {/* Content */}
                    <TableAdmin dataList={serviceList} columns={columns} />
                </Card >
            </div >
        </>
    )
}

export default ServiceTypeManagement