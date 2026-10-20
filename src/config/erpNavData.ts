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
  FileText,
  FileCode,
  Banknote,
  FileCheck,
  Wallet,
  CircleDollarSign,
  Truck,
  BarChart2,
  ClipboardList,
  FileX,
  PackageCheck,
  Receipt,
  ListFilter,
  CreditCard,
  TrendingUp,
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
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  badge?: string;
}

export interface NavItem {
  title: string;
  url?: string;
  icon: any;
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
      { title: "POS System", icon: ShoppingCart, url: "/sales/pos" },
      { title: "Customers", icon: Contact, url: "/sales/customers" },
      { title: "Sales Orders", icon: Layers, url: "/sales/orders" },
      { title: "Sales Quotes", icon: FileCheck, url: "/sales/quotes" },
      { title: "Cash Sales", icon: Wallet, url: "/sales/cash-sales" },
      { title: "Refunds", icon: CircleDollarSign, url: "/sales/refunds" },
      { title: "Sales Analytics", icon: BarChart2, url: "/sales/analytics" },
    ],
  },
  {
    sectionTitle: "Purchase",
    items: [
      { title: "Purchases", icon: ClipboardList, url: "/purchase/list" },
      { title: "Purchase Orders", icon: FileCheck, url: "/purchase/orders" },
      { title: "Purchase Return", icon: FileX, url: "/purchase/returns" },
      { title: "Vendors", icon: Users, url: "/purchase/vendors" },
      { title: "Procurement Analytics", icon: PackageCheck, url: "/purchase/analytics" },
    ],
  },
  {
    sectionTitle: "Finance",
    items: [
      { title: "Expenses", icon: Receipt, url: "/finance/expenses" },
      { title: "Expense Category", icon: ListFilter, url: "/finance/expense-category" },
      { title: "Payments", icon: CreditCard, url: "/finance/payments" },
      { title: "Cashflow", icon: TrendingUp, url: "/finance/cashflow" },
      { title: "Budgeting", icon: BarChart3, url: "/finance/budgeting" },
      { title: "Taxes", icon: Percent, url: "/finance/taxes" },
      {
        title: "Reports",
        icon: PieChart,
        subItems: [
          { title: "Profit & Loss", url: "/finance/reports/profit-loss" },
          { title: "Balance Sheet", url: "/finance/reports/balance-sheet" },
          { title: "Cash Flow Report", url: "/finance/reports/cashflow" },
          { title: "Tax Report", url: "/finance/reports/tax" },
        ],
      },
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
];
