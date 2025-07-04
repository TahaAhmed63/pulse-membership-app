
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRolePermissions } from '@/hooks/useRolePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission, 
  fallbackPath = '/not-authorized' 
}) => {
  const hasPermission = useRolePermissions();

  if (!hasPermission(permission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
