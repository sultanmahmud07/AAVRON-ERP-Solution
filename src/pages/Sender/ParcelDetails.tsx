import { useGetParcelDetailsQuery } from "@/redux/features/parcel/parcel.api";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatDate } from "@/utils/getDateFormater";
import { IStatusLog } from "@/types/parcel.type";
import Loader from "../Spinner";

const ParcelDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetParcelDetailsQuery(id);

  if (isLoading) {
    return <Loader></Loader>;
  }

  const parcel = data?.data;
  if (!parcel) {
    return <div className="text-center py-10">Parcel not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto md:p-6">
      <Card className="shadow-xl rounded-2xl border">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-2xl font-bold">Parcel Details</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                parcel.status === "DELIVERED"
                  ? "default"
                  : parcel.status === "REQUESTED"
                  ? "secondary"
                  : "outline"
              }
            >
              {parcel.status}
            </Badge>
            {parcel.isBlocked && (
              <Badge variant="destructive">Blocked</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Tracking ID</p>
              <p className="font-medium">{parcel.trackingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{parcel.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-medium">{parcel.weight} g</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{parcel.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sender Data</p>
              <p className="font-medium">{parcel.sender?.name}</p>
              <p className="font-medium">{parcel.sender?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Receiver Data</p>
              <p className="font-medium">{parcel.receiver?.name}</p>
              <p className="font-medium">{parcel.receiver?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Date</p>
              <p className="font-medium">{formatDate(parcel.deliveryDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(parcel.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated At</p>
              <p className="font-medium">{formatDate(parcel.updatedAt)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Status Logs</h3>
            <div className="space-y-4">
              {parcel.statusLogs?.map((log: IStatusLog, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  {/* Timeline Dot */}
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <p className="font-medium">{log.status}</p>
                    <p className="text-sm text-gray-500">
                      by <span className="uppercase text-primary">{log.updatedBy || "N/A"}</span> • {format(new Date(log.timestamp), "PPP p")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParcelDetails;
