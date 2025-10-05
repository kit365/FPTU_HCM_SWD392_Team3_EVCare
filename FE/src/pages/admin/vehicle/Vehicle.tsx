import React from 'react'
import { Card } from "@mui/material";
import { TrashSolid, Plus } from 'iconoir-react';
import { CardHeaderAdmin } from "../../../components/admin/ui/CardHeader";
import { pathAdmin } from "../../../constants/paths.constant";
import type { ButtonItemProps } from "../../../types/admin/button-item.types";
import { TableAdmin } from "../../../components/admin/ui/Table";
// Update the import to match the actual exported member from vehicle.types
import type { VehicleProps } from "../../../types/admin/vehicle.types";


export const Vehicle = () => {
    
    const buttonsList: ButtonItemProps[] = [
        {
            icon: TrashSolid,
            href: `/${pathAdmin}/vehicle/trash`,
            text: "Thùng rác",
            className: "bg-[#ef4d56] border-[#ef4d56] shadow-[0_1px_2px_0_rgba(239,77,86,0.35)] mr-[0.6rem]",
        },
        {
            icon: Plus,
            href: `/${pathAdmin}/vehicle/create`,
            text: "Tạo mẫu xe",
            className: "bg-[#22c55e] border-[#22c55e] shadow-[0_1px_2px_0_rgba(34,197,94,0.35)]",
        },
    ]

const vehicleList: VehicleProps[] = [
  {
    id: "1",
    vehicleTypeName: "VinFast Lux A2.0",
    manufacturer: "VinFast",
    modelYear: 2020,
    batteryCapacity: 0, // xe xăng, nên để 0
    maintenanceIntervalKm: 10000,
    maintenanceIntervalMonths: 6,
    description: "Sedan hạng D của VinFast"
  },
  {
    id: "2",
    vehicleTypeName: "VinFast Lux SA2.0",
    manufacturer: "VinFast",
    modelYear: 2020,
    batteryCapacity: 0,
    maintenanceIntervalKm: 10000,
    maintenanceIntervalMonths: 6,
    description: "SUV hạng E của VinFast"
  },
  {
    id: "3",
    vehicleTypeName: "VinFast Fadil",
    manufacturer: "VinFast",
    modelYear: 2019,
    batteryCapacity: 0,
    maintenanceIntervalKm: 8000,
    maintenanceIntervalMonths: 6,
    description: "Xe hatchback hạng A"
  },
  {
    id: "4",
    vehicleTypeName: "VinFast VF e34",
    manufacturer: "VinFast",
    modelYear: 2021,
    batteryCapacity: 42,
    maintenanceIntervalKm: 15000,
    maintenanceIntervalMonths: 12,
    description: "Crossover điện cỡ C"
  },
  {
    id: "5",
    vehicleTypeName: "VinFast VF 8",
    manufacturer: "VinFast",
    modelYear: 2022,
    batteryCapacity: 82,
    maintenanceIntervalKm: 15000,
    maintenanceIntervalMonths: 12,
    description: "SUV điện hạng D"
  },
  {
    id: "6",
    vehicleTypeName: "VinFast VF 9",
    manufacturer: "VinFast",
    modelYear: 2022,
    batteryCapacity: 92,
    maintenanceIntervalKm: 15000,
    maintenanceIntervalMonths: 12,
    description: "SUV điện cỡ lớn hạng E"
  },
  {
    id: "7",
    vehicleTypeName: "McLaren 570S",
    manufacturer: "McLaren",
    modelYear: 2019,
    batteryCapacity: 0,
    maintenanceIntervalKm: 10000,
    maintenanceIntervalMonths: 12,
    description: "Siêu xe thể thao V8 Twin-Turbo"
  },
  {
    id: "8",
    vehicleTypeName: "McLaren 720S",
    manufacturer: "McLaren",
    modelYear: 2020,
    batteryCapacity: 0,
    maintenanceIntervalKm: 10000,
    maintenanceIntervalMonths: 12,
    description: "Siêu xe hiệu suất cao dòng Super Series"
  },
  {
    id: "9",
    vehicleTypeName: "McLaren GT",
    manufacturer: "McLaren",
    modelYear: 2020,
    batteryCapacity: 0,
    maintenanceIntervalKm: 10000,
    maintenanceIntervalMonths: 12,
    description: "Siêu xe Grand Tourer, tiện nghi hơn"
  },
  {
    id: "10",
    vehicleTypeName: "McLaren Artura",
    manufacturer: "McLaren",
    modelYear: 2021,
    batteryCapacity: 7.4, // hybrid plug-in
    maintenanceIntervalKm: 10000,
    maintenanceIntervalMonths: 12,
    description: "Siêu xe hybrid V6 đầu tiên của McLaren"
  }
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
        { title: "Tên mẫu xe", width: 15, key: "name" },
        { title: "Trạng thái", width: 15, align: "left", key: "status" },
        // { title: "Lần đăng nhập cuối", width: 15, align: "left", key: "lastLogin" },
        { title: "Hành động", width: 20, align: "center", key: "actions" },
    ];

    return (
        <>
            <div className="max-w-[1320px] px-[12px] mx-auto">
                <Card elevation={0} className="shadow-[0_3px_16px_rgba(142,134,171,0.05)]">
                    {/* Header */}
                    <CardHeaderAdmin
                        title="Danh sách mẫu xe"
                        buttons={buttonsList}
                    />
                    {/* Content */}
                    <TableAdmin dataList={vehicleList} columns={columns} />
                </Card >
            </div >
        </>
    )
}

 