import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Package, CheckCircle2, Truck, Clock } from "lucide-react";
import { useGetSenderAnalyticsQuery } from "@/redux/features/sender/sender.api";
import SenderRecentParcelList from "./RecentParcelList";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

const SenderAnalytics = () => {
  const { data, isLoading } = useGetSenderAnalyticsQuery(undefined);

  if (isLoading) return <p>Loading...</p>;

  const { totalParcels, delivered, inTransit, pending, canceled, monthlyShipments } =
    data?.data || {};

  const statusData = [
    { name: "Delivered", value: delivered },
    { name: "In Transit", value: inTransit },
    { name: "Pending", value: pending },
    { name: "Canceled", value: canceled },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthlyData = monthlyShipments?.map((m: any) => ({
    month: new Date(2025, m._id - 1).toLocaleString("default", { month: "short" }),
    count: m.count,
  }));

  return (
    <div className="md:px-4 px-3 space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">📦 Sender Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Total Parcels</CardTitle>
            <Package className="h-6 w-6 text-gray-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalParcels}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Delivered</CardTitle>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{delivered}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>In Transit</CardTitle>
            <Truck className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{inTransit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Pending / Canceled</CardTitle>
            <Clock className="h-6 w-6 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pending + canceled}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <SenderRecentParcelList></SenderRecentParcelList>
    </div>
  );
};

export default SenderAnalytics;
