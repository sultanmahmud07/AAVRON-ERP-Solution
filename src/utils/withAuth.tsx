import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { TRole } from "@/types";
import { ComponentType } from "react";
import { Navigate, useLocation } from "react-router";

export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  requiredRoles?: TRole | readonly TRole[]
) => {
  return function AuthWrapper(props: P) {
    const location = useLocation();
    // Uses HTTP-only cookie automatically via credentials
    const { data, isLoading, isError } = useUserInfoQuery(undefined);

    // 1. Loading state: Never render protected component while verifying credentials
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1117] transition-colors">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              Verifying session...
            </p>
          </div>
        </div>
      );
    }

    // 2. Unauthenticated: If query failed or no user email in cookie session, redirect to /login
    if (isError || !data?.data?.email) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Role-based access control: Verify user role against permitted roles
    if (requiredRoles) {
      const allowedRoles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];
      if (!allowedRoles.includes(data?.data?.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // 4. Authorized: Render component with all props preserved
    return <Component {...props} />;
  };
};
