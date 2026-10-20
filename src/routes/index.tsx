import { createBrowserRouter } from "react-router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardOverview from "@/pages/DashboardOverview";
import UnitsPage from "@/pages/inventory/UnitsPage";
import ModulePlaceholder from "@/pages/ModulePlaceholder";

import Products from "@/pages/Product/Products";
import AddProduct from "@/pages/Product/AddProduct";
import EditProduct from "@/pages/Product/EditProduct";
import AllCategories from "@/pages/Category/AllCategories";
import BrandsPage from "@/pages/Brand/BrandsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: DashboardOverview,
      },
      // Dashboard sub-routes
      {
        path: "dashboard/hrm",
        Component: DashboardOverview,
      },
      {
        path: "dashboard/:module",
        Component: ModulePlaceholder,
      },

      // Inventory routes
      {
        path: "inventory/products",
        Component: Products,
      },
      {
        path: "inventory/products/add",
        Component: AddProduct,
      },
      {
        path: "inventory/products/edit/:id",
        Component: EditProduct,
      },
      {
        path: "inventory/categories",
        Component: AllCategories,
      },
      {
        path: "inventory/brands",
        Component: BrandsPage,
      },
      {
        path: "inventory/units",
        Component: UnitsPage,
      },
      {
        path: "inventory/variants",
        Component: UnitsPage,
      },
      {
        path: "inventory/attributes",
        Component: UnitsPage,
      },
      {
        path: "inventory/:section",
        Component: ModulePlaceholder,
      },
      {
        path: "inventory/stock/:type",
        Component: ModulePlaceholder,
      },

      // Sales routes
      {
        path: "sales/:section",
        Component: ModulePlaceholder,
      },

      // Purchase routes
      {
        path: "purchase/:section",
        Component: ModulePlaceholder,
      },

      // Finance routes
      {
        path: "finance/:section",
        Component: ModulePlaceholder,
      },
      {
        path: "finance/reports/:reportType",
        Component: ModulePlaceholder,
      },

      // HRM routes
      {
        path: "hrm/:section",
        Component: ModulePlaceholder,
      },
      {
        path: "hrm/leave/:leaveType",
        Component: ModulePlaceholder,
      },

      // Applications & Layouts
      {
        path: "apps/:app",
        Component: ModulePlaceholder,
      },
      {
        path: "layouts/:layout",
        Component: ModulePlaceholder,
      },

      // Fallback
      {
        path: "*",
        Component: DashboardOverview,
      },
    ],
  },
]);
