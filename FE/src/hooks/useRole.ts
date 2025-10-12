import { useState } from "react";
import type { RoleResponse } from "../types/admin/role";
import { roleService } from "../service/roleService";


export function useRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const getAllRoles = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await roleService.getAllRole();
      if (response?.data.success === true) {
        setRoles(response.data.data);
        console.log("roles: ", response.data.data);
      } else {
        throw new Error(response?.data.message || "Lấy danh sách role thất bại");
      }
    } catch (error) {
      console.error("Error getting roles:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAllRoles,
    roles,
    isLoading
  };
}