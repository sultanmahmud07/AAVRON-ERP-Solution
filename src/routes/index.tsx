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
import NewSalePage from "@/pages/sales/NewSalePage";
import AddPurchasePage from "@/pages/purchase/AddPurchasePage";
import ManagePurchasePage from "@/pages/purchase/ManagePurchasePage";
import PurchaseDetailsPage from "@/pages/purchase/PurchaseDetailsPage";
import PurchaseReturnPage from "@/pages/purchase/PurchaseReturnPage";
import ExpensesPage from "@/pages/finance/ExpensesPage";
import ExpenseCategoryPage from "@/pages/finance/ExpenseCategoryPage";
import PaymentsPage from "@/pages/finance/PaymentsPage";
import BudgetingPage from "@/pages/finance/BudgetingPage";
import TaxesPage from "@/pages/finance/TaxesPage";
import FinanceReportsPage from "@/pages/finance/FinanceReportsPage";
import ChartOfAccountsPage from "@/pages/accounting/ChartOfAccountsPage";
import BalanceAdjustmentPage from "@/pages/accounting/BalanceAdjustmentPage";
import BalanceTransferPage from "@/pages/accounting/BalanceTransferPage";
import TransactionHistoryPage from "@/pages/accounting/TransactionHistoryPage";
import CustomerDuePage from "@/pages/due/CustomerDuePage";
import SupplierDuePage from "@/pages/due/SupplierDuePage";
import AssetsPage from "@/pages/asset/AssetsPage";
import AssignmentsPage from "@/pages/asset/AssignmentsPage";
import AssetTypesPage from "@/pages/asset/AssetTypesPage";
import UserManagementPage from "@/pages/system/UserManagementPage";
import RolesPermissionsPage from "@/pages/system/RolesPermissionsPage";
import DeleteRequestsPage from "@/pages/system/DeleteRequestsPage";
import SettingsPage from "@/pages/system/SettingsPage";
import BranchPage from "@/pages/system/BranchPage";
import ManageQuotesPage from "@/pages/sales/ManageQuotesPage";
import CreateQuotePage from "@/pages/sales/CreateQuotePage";
import RefundsPage from "@/pages/sales/RefundsPage";
import SalesAnalyticsPage from "@/pages/sales/SalesAnalyticsPage";
import EmployeesPage from "@/pages/hrm/EmployeesPage";
import AddEmployeePage from "@/pages/hrm/AddEmployeePage";
import DepartmentsPage from "@/pages/hrm/DepartmentsPage";
import DesignationsPage from "@/pages/hrm/DesignationsPage";
import LeavesPage from "@/pages/hrm/LeavesPage";
import LeaveTypesPage from "@/pages/hrm/LeaveTypesPage";
import HolidaysPage from "@/pages/hrm/HolidaysPage";
import PayrollPage from "@/pages/hrm/PayrollPage";
import AddPayrollPage from "@/pages/hrm/AddPayrollPage";
import RecruitmentPage from "@/pages/hrm/RecruitmentPage";
import AddJobRequisitionPage from "@/pages/hrm/AddJobRequisitionPage";
import PerformanceAppraisalPage from "@/pages/hrm/PerformanceAppraisalPage";
import TrainingPage from "@/pages/hrm/TrainingPage";
import AttendancePage from "@/pages/hrm/AttendancePage";
import HRAnalyticsPage from "@/pages/hrm/HRAnalyticsPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Unauthorized from "@/pages/Unauthorized";
import { withAuth } from "@/utils/withAuth";
import { role } from "@/constants/role";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: withAuth(DashboardLayout, [role.superAdmin, role.admin]),
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
        path: "inventory/product/add",
        Component: AddProduct,
      },
      {
        path: "product/add",
        Component: AddProduct,
      },
      {
        path: "inventory/products/edit/:id",
        Component: EditProduct,
      },
      {
        path: "products/edit/:id",
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
        path: "sales/new",
        Component: NewSalePage,
      },
      {
        path: "sales/add",
        Component: NewSalePage,
      },
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
      // Sales Quotations
      {
        path: "sales/quotes",
        Component: ManageQuotesPage,
      },
      {
        path: "sales/quotes/list",
        Component: ManageQuotesPage,
      },
      {
        path: "sales/quotes/create",
        Component: CreateQuotePage,
      },
      {
        path: "sales/quotes/new",
        Component: CreateQuotePage,
      },
      {
        path: "sales/quotes/edit/:quoteId",
        Component: CreateQuotePage,
      },
      {
        path: "sales/quotes/convert/:quoteId",
        Component: CreateQuotePage,
      },
      // Refunds & Returns routes
      {
        path: "sales/refunds",
        Component: RefundsPage,
      },
      {
        path: "sales/returns",
        Component: RefundsPage,
      },
      {
        path: "refunds",
        Component: RefundsPage,
      },
      // Sales Analytics route
      {
        path: "sales/analytics",
        Component: SalesAnalyticsPage,
      },
      {
        path: "analytics/sales",
        Component: SalesAnalyticsPage,
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

      // Due Management routes
      {
        path: "due/customer",
        Component: CustomerDuePage,
      },
      {
        path: "due/customer-due",
        Component: CustomerDuePage,
      },
      {
        path: "due/customers",
        Component: CustomerDuePage,
      },
      {
        path: "due/supplier",
        Component: SupplierDuePage,
      },
      {
        path: "due/supplier-due",
        Component: SupplierDuePage,
      },
      {
        path: "due/suppliers",
        Component: SupplierDuePage,
      },
      {
        path: "due-management/customer-due",
        Component: CustomerDuePage,
      },
      {
        path: "due-management/supplier-due",
        Component: SupplierDuePage,
      },
      {
        path: "due-management/:section",
        Component: ModulePlaceholder,
      },
      {
        path: "due/:section",
        Component: ModulePlaceholder,
      },

      // Finance routes
      {
        path: "finance/expenses",
        Component: ExpensesPage,
      },
      {
        path: "finance/expense-list",
        Component: ExpensesPage,
      },
      {
        path: "finance/expense-category",
        Component: ExpenseCategoryPage,
      },
      {
        path: "finance/expense-categories",
        Component: ExpenseCategoryPage,
      },
      {
        path: "finance/payments",
        Component: PaymentsPage,
      },
      {
        path: "finance/budgeting",
        Component: BudgetingPage,
      },
      {
        path: "finance/taxes",
        Component: TaxesPage,
      },
      {
        path: "finance/reports",
        Component: FinanceReportsPage,
      },
      {
        path: "finance/reports/:reportType",
        Component: FinanceReportsPage,
      },
      {
        path: "finance/:section",
        Component: ModulePlaceholder,
      },

      // Accounting routes
      {
        path: "accounting/chart-of-accounts",
        Component: ChartOfAccountsPage,
      },
      {
        path: "accounting/accounts",
        Component: ChartOfAccountsPage,
      },
      {
        path: "accounting/create-account",
        Component: ChartOfAccountsPage,
      },
      {
        path: "accounting/balance-adjustment",
        Component: BalanceAdjustmentPage,
      },
      {
        path: "accounting/adjustments",
        Component: BalanceAdjustmentPage,
      },
      {
        path: "accounting/balance-transfer",
        Component: BalanceTransferPage,
      },
      {
        path: "accounting/transfers",
        Component: BalanceTransferPage,
      },
      {
        path: "accounting/transaction-history",
        Component: TransactionHistoryPage,
      },
      {
        path: "accounting/transactions",
        Component: TransactionHistoryPage,
      },
      {
        path: "accounting/:section",
        Component: ModulePlaceholder,
      },

      // Asset Management routes
      {
        path: "assets",
        Component: AssetsPage,
      },
      {
        path: "assets/list",
        Component: AssetsPage,
      },
      {
        path: "assets/all",
        Component: AssetsPage,
      },
      {
        path: "assets/types",
        Component: AssetTypesPage,
      },
      {
        path: "assets/categories",
        Component: AssetTypesPage,
      },
      {
        path: "assets/asset-types",
        Component: AssetTypesPage,
      },
      {
        path: "assets/assignments",
        Component: AssignmentsPage,
      },
      {
        path: "assets/assignment",
        Component: AssignmentsPage,
      },
      {
        path: "assignments",
        Component: AssignmentsPage,
      },
      {
        path: "assets/:section",
        Component: ModulePlaceholder,
      },

      // HRM routes
      {
        path: "hrm/employees",
        Component: EmployeesPage,
      },
      {
        path: "hrm/employees/add",
        Component: AddEmployeePage,
      },
      {
        path: "hrm/employees/edit/:id",
        Component: AddEmployeePage,
      },
      {
        path: "hrm/departments",
        Component: DepartmentsPage,
      },
      {
        path: "hrm/designations",
        Component: DesignationsPage,
      },
      {
        path: "hrm/leaves",
        Component: LeavesPage,
      },
      {
        path: "hrm/leave-types",
        Component: LeaveTypesPage,
      },
      {
        path: "hrm/leave/types",
        Component: LeaveTypesPage,
      },
      {
        path: "hrm/holidays",
        Component: HolidaysPage,
      },
      {
        path: "holidays",
        Component: HolidaysPage,
      },
      {
        path: "hrm/attendance",
        Component: AttendancePage,
      },
      {
        path: "attendance",
        Component: AttendancePage,
      },
      {
        path: "hrm/payroll",
        Component: PayrollPage,
      },
      {
        path: "hrm/payroll/add",
        Component: AddPayrollPage,
      },
      {
        path: "hrm/payroll/edit/:id",
        Component: AddPayrollPage,
      },
      {
        path: "payroll",
        Component: PayrollPage,
      },
      {
        path: "payroll/add",
        Component: AddPayrollPage,
      },
      {
        path: "payroll/edit/:id",
        Component: AddPayrollPage,
      },
      {
        path: "employees",
        Component: EmployeesPage,
      },
      {
        path: "employees/add",
        Component: AddEmployeePage,
      },
      {
        path: "departments",
        Component: DepartmentsPage,
      },
      {
        path: "designations",
        Component: DesignationsPage,
      },
      {
        path: "leave",
        Component: LeavesPage,
      },
      {
        path: "leaves",
        Component: LeavesPage,
      },
      {
        path: "leave-types",
        Component: LeaveTypesPage,
      },
      {
        path: "hrm/recruitment",
        Component: RecruitmentPage,
      },
      {
        path: "hrm/recruitment/add",
        Component: AddJobRequisitionPage,
      },
      {
        path: "hrm/recruitment/edit/:id",
        Component: AddJobRequisitionPage,
      },
      {
        path: "recruitment",
        Component: RecruitmentPage,
      },
      {
        path: "recruitment/add",
        Component: AddJobRequisitionPage,
      },
      {
        path: "recruitment/edit/:id",
        Component: AddJobRequisitionPage,
      },
      {
        path: "hrm/performance",
        Component: PerformanceAppraisalPage,
      },
      {
        path: "hrm/performance-appraisal",
        Component: PerformanceAppraisalPage,
      },
      {
        path: "performance",
        Component: PerformanceAppraisalPage,
      },
      {
        path: "performance-appraisal",
        Component: PerformanceAppraisalPage,
      },
      {
        path: "hrm/training",
        Component: TrainingPage,
      },
      {
        path: "hrm/training-development",
        Component: TrainingPage,
      },
      {
        path: "training",
        Component: TrainingPage,
      },
      {
        path: "hrm/analytics",
        Component: HRAnalyticsPage,
      },
      {
        path: "hrm/hr-analytics",
        Component: HRAnalyticsPage,
      },
      {
        path: "analytics",
        Component: HRAnalyticsPage,
      },
      {
        path: "hr-analytics",
        Component: HRAnalyticsPage,
      },
      {
        path: "hrm/:section",
        Component: ModulePlaceholder,
      },
      {
        path: "hrm/leave/:leaveType",
        Component: ModulePlaceholder,
      },

      // System routes
      {
        path: "system/users",
        Component: UserManagementPage,
      },
      {
        path: "system/user-management",
        Component: UserManagementPage,
      },
      {
        path: "system/roles",
        Component: RolesPermissionsPage,
      },
      {
        path: "system/roles-permissions",
        Component: RolesPermissionsPage,
      },
      {
        path: "system/permissions",
        Component: RolesPermissionsPage,
      },
      {
        path: "system/delete-requests",
        Component: DeleteRequestsPage,
      },
      {
        path: "system/branch",
        Component: BranchPage,
      },
      {
        path: "system/branches",
        Component: BranchPage,
      },
      {
        path: "settings/branch",
        Component: BranchPage,
      },
      {
        path: "settings/branches",
        Component: BranchPage,
      },
      {
        path: "system/settings",
        Component: SettingsPage,
      },
      {
        path: "system/settings/:tab",
        Component: SettingsPage,
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
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/unauthorized",
    Component: Unauthorized,
  },
]);
