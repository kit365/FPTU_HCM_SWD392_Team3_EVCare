import { Card } from "@mui/material";
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Popconfirm } from "antd";
import { FormEmpty } from "../../../components/admin/ui/FormEmpty";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useServiceType } from "../../../hooks/useServiceType";
import { pathAdmin } from "../../../constants/paths.constant";

export const VehicleService = () => {
    const { id } = useParams();
    const { detail, getById } = useServiceType();

    useEffect(() => {
        if (id) getById(id);
    }, [id]);

    const renderVehicleParts = (parts: any[] = []) => {
        if (!parts.length) return <span className="text-gray-400 italic">Không có linh kiện</span>;
        return (
            <ul className="list-disc list-inside text-left text-[1.3rem] leading-[2rem]">
                {parts.map((p) => (
                    <li key={p.serviceTypeVehiclePartId}>
                        <span className="font-medium">{p.vehiclePart?.vehiclePartName}</span>{" "}
                        <span className="text-gray-500">
                            (SL: {p.requiredQuantity || 0}, Thời gian: {p.estimatedTimeDefault || 0} phút)
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderChildren = (children: any[] = []) => {
        if (!children.length) {
            return (
                <tr>
                    <td colSpan={5} className="text-center text-gray-400 italic py-[1rem]">
                        Không có dịch vụ con
                    </td>
                </tr>
            );
        }

        return children.map((child: any, idx: number) => (
            <tr key={child.serviceTypeId} className="border-b border-gray-200 text-center bg-[#FBFBFD] hover:bg-[#f7f8fc]">
                <td className="p-[1.2rem]">{idx + 1}</td>
                <td className="p-[1.2rem] font-[600] text-left">{child.serviceName}</td>
                <td className="p-[1.2rem] text-left">{child.description || "-"}</td>
                <td className="p-[1.2rem]">{renderVehicleParts(child.serviceTypeVehiclePartResponses)}</td>
                <td className="p-[1.2rem] flex justify-center gap-2">
                    <Link
                        to={`/${pathAdmin}/vehicle/service/${child.serviceTypeId}`}
                        className="text-blue-500 hover:opacity-80"
                        title="Chỉnh sửa"
                    >
                        <EditIcon className="!w-[2rem] !h-[2rem]" />
                    </Link>
                    <Popconfirm
                        title="Xóa dịch vụ"
                        description="Bạn chắc chắn muốn xóa dịch vụ này?"
                        okText="Đồng ý"
                        cancelText="Hủy"
                        placement="left"
                    >
                        <button className="text-red-500 hover:opacity-80">
                            <DeleteOutlineIcon className="!w-[2rem] !h-[2rem]" />
                        </button>
                    </Popconfirm>
                </td>
            </tr>
        ));
    };

    const serviceList = (detail as any)?.data || [];


    if (!serviceList.length) {
        return <FormEmpty colspan={5} />;
    }

    return (
        <div className="max-w-[1320px] px-[12px] mx-auto">
            <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                <CardHeaderAdmin title="Danh sách dịch vụ" />

                <div className="px-[2.4rem] pb-[2.4rem] h-full">
                    {serviceList.map((serviceParent: any) => (
                        <div
                            key={serviceParent.serviceTypeId}
                            className="mb-[3rem] border border-gray-100 rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all"
                        >
                            <div className="p-[1.6rem] border-b bg-[#fafafa] rounded-t-[10px]">
                                <h2 className="text-[1.6rem] font-[700] text-[#2b2d3b] mb-[0.6rem]">
                                    {serviceParent.serviceName}
                                </h2>
                                <p className="text-[1.3rem] text-gray-600">{serviceParent.description}</p>
                            </div>

                            <div className="p-[1.2rem] overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="text-[#000000] text-[1.3rem] border-dashed bg-[#f4f6f9]">
                                        <tr>
                                            <th className="p-[1.2rem] font-[500] text-center w-[5%] rounded-l-[8px]">STT</th>
                                            <th className="p-[1.2rem] font-[500] text-center w-[25%]">Tên dịch vụ con</th>
                                            <th className="p-[1.2rem] font-[500] text-center w-[25%]">Mô tả</th>
                                            <th className="p-[1.2rem] font-[500] text-center w-[35%]">Linh kiện sử dụng</th>
                                            <th className="p-[1.2rem] font-[500] text-center w-[10%] rounded-r-[8px]">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[#2b2d3b] text-[1.3rem]">
                                        {renderChildren(serviceParent.children)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
