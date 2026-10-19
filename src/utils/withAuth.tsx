import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { TRole } from "@/types";
import { ComponentType } from "react";
import { Navigate } from "react-router";

export const withAuth = (Component: ComponentType, requiredRoles?: TRole | readonly TRole[]) => {
  return function AuthWrapper() {
    const { data, isLoading } = useUserInfoQuery(undefined);
    // console.log("🚀 ~ AuthWrapper ~ data:", data?.data);
    // console.log("🚀 ~ AuthWrapper ~ requiredRoles:", requiredRoles);

    if (!isLoading && !data?.data?.email) {
      return <Navigate to="/login" />;
    }

    if (requiredRoles && !isLoading) {
      const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      if (!allowedRoles.includes(data?.data?.role)) {
        return <Navigate to="/unauthorized" />;
      }
    }

    return <Component />;
  };
};
