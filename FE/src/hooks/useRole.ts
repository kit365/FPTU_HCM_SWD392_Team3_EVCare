import { useState } from "react";
import type { RoleResponse } from "../types/admin/role";
import { roleService } from "../service/roleService";


export function useRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const getAllRoles = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response);
      console.log("roles: ", response);
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