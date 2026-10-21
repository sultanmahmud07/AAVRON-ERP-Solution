import {
  LayoutDashboard,
  AppWindow,
  Package,
  Mail,
  Triangle,
  Compass,
  Boxes,
  Users,
  Home,
  ExternalLink,
  Contact,
  Layers,
  Banknote,
  FileCheck,
  CircleDollarSign,
  BarChart2,
  ClipboardList,
  PlusCircle,
  RotateCcw,
  Receipt,
  ListFilter,
  CreditCard,
  // TrendingUp,
  BarChart3,
  Percent,
  PieChart,
  UserCircle,
  Building,
  UserCog,
  CalendarCheck,
  CalendarDays,
  Calendar,
  UserPlus,
  ShieldCheck,
  ShoppingCart,
  LucideIcon,
  Landmark,
  SlidersHorizontal,
  ArrowRightLeft,
  History,
  UserCheck,
  Truck,
  Box,
  Tags,
  User,
  Settings as SettingsGear,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  badge?: string;
}

export interface NavItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  badge?: string;
  subItems?: NavSubItem[];
}

export interface NavSection {
  sectionTitle: string;
  items: NavItem[];
}

export const erpNavSections: NavSection[] = [
  {
    sectionTitle: "Main",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/",
      },
      {
        title: "Applications",
        icon: AppWindow,
        subItems: [
          { title: "Chat", url: "/apps/chat" },
          { title: "Calendar", url: "/apps/calendar" },
          { title: "Email", url: "/apps/email" },
          { title: "File Manager", url: "/apps/file-manager" },
          { title: "Notes", url: "/apps/notes" },
          { title: "To Do List", url: "/apps/todo" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Inventory",
    items: [
      { title: "Products", icon: Package, url: "/inventory/products" },
      { title: "Categories", icon: Mail, url: "/inventory/categories" },
      { title: "Brands", icon: Triangle, url: "/inventory/brands" },
      { title: "Variants / Units", icon: Compass, url: "/inventory/units" },
      { title: "Inventory", icon: Boxes, url: "/inventory/stock-list" },
      { title: "Suppliers", icon: Users, url: "/inventory/suppliers" },
      { title: "Warehouse", icon: Home, url: "/inventory/warehouse" },
      {
        title: "Stock",
        icon: ExternalLink,
        subItems: [
          { title: "Stock Transfer", url: "/inventory/stock/transfer" },
          { title: "Stock Adjustment", url: "/inventory/stock/adjustment" },
          { title: "Low Stock Alerts", url: "/inventory/stock/low-stock" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Sales",
    items: [
      { title: "New Sale", icon: PlusCircle, url: "/sales/new" },
      { title: "Sales Orders", icon: Layers, url: "/sales/orders" },
      { title: "POS System", icon: ShoppingCart, url: "/sales/pos" },
      { title: "Customers", icon: Contact, url: "/sales/customers" },
      {
        title: "Sales Quotes",
        icon: FileCheck,
        subItems: [
          { title: "Create Quote", url: "/sales/quotes/create" },
          { title: "Manage Quotes", url: "/sales/quotes" },
        ],
      },
      { title: "Refunds", icon: CircleDollarSign, url: "/sales/refunds" },
      { title: "Sales Analytics", icon: BarChart2, url: "/sales/analytics" },
    ],
  },
  {
    sectionTitle: "Purchase",
    items: [
      { title: "Add purchase", icon: PlusCircle, url: "/purchase/add" },
      { title: "Manage purchase", icon: ClipboardList, url: "/purchase/manage" },
      { title: "Purchase return", icon: RotateCcw, url: "/purchase/returns" },
    ],
  },
  {
    sectionTitle: "Due Management",
    items: [
      { title: "Customer Due", icon: UserCheck, url: "/due/customer-due" },
      { title: "Supplier Due", icon: Truck, url: "/due/supplier-due" },
    ],
  },
  {
    sectionTitle: "Finance",
    items: [
      { title: "Expenses", icon: Receipt, url: "/finance/expenses" },
      { title: "Expense Category", icon: ListFilter, url: "/finance/expense-category" },
      { title: "Payments", icon: CreditCard, url: "/finance/payments" },
      // { title: "Cashflow", icon: TrendingUp, url: "/finance/cashflow" },
      { title: "Budgeting", icon: BarChart3, url: "/finance/budgeting" },
      { title: "Taxes", icon: Percent, url: "/finance/taxes" },
      {
        title: "Reports",
        icon: PieChart,
        subItems: [
          { title: "Expense Summary", url: "/finance/reports/expense-summary" },
          { title: "Income Summary", url: "/finance/reports/income-summary" },
          { title: "Profit & Loss", url: "/finance/reports/profit-loss" },
          { title: "Income vs Expense", url: "/finance/reports/income-vs-expense" },
          { title: "Tax Summary", url: "/finance/reports/tax-summary" },
        ],
      },
    ],
  },
  {
    sectionTitle: "Accounting",
    items: [
      { title: "Chart of Accounts", icon: Landmark, url: "/accounting/chart-of-accounts" },
      { title: "Balance Adjustment", icon: SlidersHorizontal, url: "/accounting/balance-adjustment" },
      { title: "Balance Transfer", icon: ArrowRightLeft, url: "/accounting/balance-transfer" },
      { title: "Transaction History", icon: History, url: "/accounting/transaction-history" },
    ],
  },
  {
    sectionTitle: "Asset Management",
    items: [
      { title: "Assets", icon: Box, url: "/assets/list" },
      { title: "Assignments", icon: UserCheck, url: "/assets/assignments" },
      { title: "Asset Types", icon: Tags, url: "/assets/types" },
    ],
  },
  {
    sectionTitle: "HRM",
    items: [
      { title: "Employees", icon: UserCircle, url: "/hrm/employees" },
      { title: "Departments", icon: Building, url: "/hrm/departments" },
      { title: "Designations / Roles", icon: UserCog, url: "/hrm/designations" },
      { title: "Attendance", icon: CalendarCheck, url: "/hrm/attendance" },
      {
        title: "Leave",
        icon: CalendarDays,
        subItems: [
          { title: "Leave Requests", url: "/hrm/leave/requests" },
          { title: "Leave Types", url: "/hrm/leave/types" },
          { title: "Leave Balance", url: "/hrm/leave/balance" },
        ],
      },
      { title: "Holidays", icon: Calendar, url: "/hrm/holidays" },
      { title: "Payroll", icon: Banknote, url: "/hrm/payroll" },
      { title: "Recruitment", icon: UserPlus, url: "/hrm/recruitment" },
      { title: "Performance & Appraisal", icon: ShieldCheck, url: "/hrm/performance" },
    ],
  },
  {
    sectionTitle: "System",
    items: [
      { title: "User Management", icon: User, url: "/system/users" },
      { title: "Roles & Permissions", icon: Layers, url: "/system/roles" },
      { title: "Delete Requests", icon: SettingsGear, url: "/system/delete-requests" },
      {
        title: "Settings",
        icon: ClipboardList,
        subItems: [
          { title: "General", url: "/system/settings/general" },
          { title: "Security", url: "/system/settings/security" },
          { title: "Notifications", url: "/system/settings/notifications" },
          { title: "Integrations", url: "/system/settings/integrations" },
        ],
      },
    ],
  },
];
