import React from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { RoleEnum } from '../../constants/roleConstants';

type HasRoleProps = {
    allow: Array<keyof typeof RoleEnum> | keyof typeof RoleEnum;
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

const HasRole: React.FC<HasRoleProps> = ({ allow, fallback = null, children }) => {
    const { user, isLoading } = useAuthContext();

    if (isLoading) return null;

    const allowedRoles = Array.isArray(allow) ? allow : [allow];
    const userRoles = user?.roleName || [];

    const canShow = userRoles.some(r => allowedRoles.includes(r as keyof typeof RoleEnum));

    return canShow ? <>{children}</> : <>{fallback}</>;
};

export default HasRole;


