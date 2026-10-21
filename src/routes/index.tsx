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
import SuppliersPage from "@/pages/inventory/SuppliersPage";
import WarehousePage from "@/pages/inventory/WarehousePage";
import InventoryPage from "@/pages/inventory/InventoryPage";
import CustomersPage from "@/pages/sales/CustomersPage";
import SalesOrdersPage from "@/pages/sales/SalesOrdersPage";
import SalesOrderPreviewPage from "@/pages/sales/SalesOrderPreviewPage";
import POSPage from "@/pages/sales/POSPage";
import AddPurchasePage from "@/pages/purchase/AddPurchasePage";
import ManagePurchasePage from "@/pages/purchase/ManagePurchasePage";
import PurchaseDetailsPage from "@/pages/purchase/PurchaseDetailsPage";
import PurchaseReturnPage from "@/pages/purchase/PurchaseReturnPage";

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
        path: "inventory/stock-list",
        Component: InventoryPage,
      },
      {
        path: "inventory/inventory",
        Component: InventoryPage,
      },
      {
        path: "inventory/suppliers",
        Component: SuppliersPage,
      },
      {
        path: "inventory/warehouse",
        Component: WarehousePage,
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
        path: "sales/customers",
        Component: CustomersPage,
      },
      {
        path: "customers",
        Component: CustomersPage,
      },
      {
        path: "sales/pos",
        Component: POSPage,
      },
      {
        path: "sales/orders",
        Component: SalesOrdersPage,
      },
      {
        path: "sales/orders/:orderId",
        Component: SalesOrderPreviewPage,
      },
      {
        path: "sales/orders/preview/:orderId",
        Component: SalesOrderPreviewPage,
      },
      {
        path: "sales/order-preview/:orderId",
        Component: SalesOrderPreviewPage,
      },
      {
        path: "sales/:section",
        Component: ModulePlaceholder,
      },

      // Purchase routes
      {
        path: "purchase/add",
        Component: AddPurchasePage,
      },
      {
        path: "purchase/create",
        Component: AddPurchasePage,
      },
      {
        path: "purchase/manage",
        Component: ManagePurchasePage,
      },
      {
        path: "purchase/list",
        Component: ManagePurchasePage,
      },
      {
        path: "purchase/orders",
        Component: ManagePurchasePage,
      },
      {
        path: "purchase/details/:id",
        Component: PurchaseDetailsPage,
      },
      {
        path: "purchase/preview/:id",
        Component: PurchaseDetailsPage,
      },
      {
        path: "purchase/returns",
        Component: PurchaseReturnPage,
      },
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
  }
]);
