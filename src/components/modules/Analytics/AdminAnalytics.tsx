/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, ClipboardCheck, Users, TrendingUp } from "lucide-react";
import AnalyticsSkeleton from "../loader/AnalyticsSkeleton";
import { useGetDashboardAnalyticsQuery } from "@/redux/features/product/product.api";

const AdminAnalytics = () => {
  // Update this hook call based on where your query is defined
  const { data: response, isLoading } = useGetDashboardAnalyticsQuery(undefined); 
  
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  const stats = response?.data?.data;
  if (!stats) return null;

  const { summary, counts, inspectionSeries } = stats;

  // Pie chart data for Inspection Status Breakdown
  const inspectionDistribution = [
    { name: "Pending", value: counts.inspectionStatus.pending },
    { name: "Confirmed", value: counts.inspectionStatus.confirmed },
    { name: "Completed", value: counts.inspectionStatus.completed },
    { name: "Cancelled", value: counts.inspectionStatus.cancelled },
  ];
  // Colors: Pending (Orange), Confirmed (Blue), Completed (Green), Cancelled (Red)
  const PIE_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444"];

  // Format the date for the X-Axis on the Area Chart
  const formattedSeriesData = inspectionSeries.map((item: any) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd")
  }));

  return (
    <div className="w-full space-y-6 md:p-4">
      
      {/* Header */}
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#ea580c]" />
          Service Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor your inspections, collected addresses, and calendar availability.
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Inspections */}
        <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inspections</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalInspections}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{counts.newInspectionsLast30} booked in 30 days
            </p>
          </CardContent>
        </Card>

        {/* Address Leads */}
        <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Address Leads</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalAddresses}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{counts.newAddressesLast30} new leads
            </p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalUsers}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{counts.newUsersLast30} joined recently
            </p>
          </CardContent>
        </Card>

        {/* Scheduled Availability Days */}
        <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Calendar Days</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalAvailability}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mt-1">
              Days with available slots
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Inspection Timeline */}
        <Card className="lg:col-span-2 border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-gray-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Inspections Booked (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Bookings"
                    stroke="#ea580c" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorInspections)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Inspection Statuses */}
        <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-gray-100 dark:border-zinc-800/50 pb-4">
            <CardTitle className="text-lg">Inspection Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inspectionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {inspectionDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
      
    </div>
  );
};

export default AdminAnalytics;