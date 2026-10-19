import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
} from "@/components/ui/table";
import { EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { useCancelParcelBySenderMutation, useGetParcelBySenderQuery } from "@/redux/features/parcel/parcel.api";
import { IParcel } from "@/types/parcel.type";
import { Link } from "react-router";
import { formatDate } from "@/utils/getDateFormater";
import { IApiError } from "@/types";
import TableSkeleton from "../loader/Receiver/TableSkeleton";


export default function SenderRecentParcelList() {
      const { data, isLoading } = useGetParcelBySenderQuery({ page: 1, limit: 5 });
      const [cancelParcelBySender] = useCancelParcelBySenderMutation();

      const handleRemoveParcel = async (parcelId: string) => {
            const toastId = toast.loading("Updating...");
            try {
                  const res = await cancelParcelBySender(parcelId).unwrap();
                  if (res.success) {
                        toast.dismiss(toastId);
                        toast.success("Parcel cancel successfully");
                  }
            } catch (err) {
                  console.error(err);
                  toast.dismiss(toastId);
                  const error = err as IApiError;
                  toast.error(`${error.data.message}`);
            }
      };


      return (
            <div className="w-full border-t my-5 py-3">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold">Recent Parcels</h1>
                        <Link className="underline text-primary" to={"/sender/parcels"}>View all</Link>
                  </div>
                  {
                        isLoading ?
                              <TableSkeleton></TableSkeleton>
                              :
                              <Table>
                                    <TableHeader>
                                          <TableRow>
                                                <TableHead className="">Type</TableHead>
                                                <TableHead>Weight</TableHead>
                                                <TableHead>Deu Amount</TableHead>
                                                <TableHead>Delivery Date</TableHead>
                                                <TableHead className="">Tracking Id</TableHead>
                                                <TableHead className="">Status</TableHead>
                                                <TableHead className="text-center">Action</TableHead>
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {data?.map((parcel: IParcel) => (
                                                <TableRow key={parcel._id}>
                                                      <TableCell className="font-medium">{parcel.type}</TableCell>
                                                      <TableCell className="font-medium">{parcel.weight}</TableCell>
                                                      <TableCell>{parcel.fee || 0}</TableCell>
                                                      <TableCell className="">{formatDate(parcel.deliveryDate)}</TableCell>
                                                      <TableCell>{parcel.trackingId}</TableCell>
                                                      <TableCell className={`${parcel.status == "DELIVERED" && "text-green-600 font-bold"} ${parcel.status == "CANCELED" && "text-red-600 font-bold"} ${parcel.status == "REQUESTED" && "text-yellow-600 font-bold"} `}>{parcel.status}</TableCell>
                                                      <TableCell className="flex items-center gap-2">
                                                            <Link className="w-full cursor-pointer" to={`/sender/parcel/${parcel._id}`}>
                                                                  <Button size="sm">
                                                                        <EyeIcon />
                                                                  </Button>
                                                            </Link>
                                                            <DeleteConfirmation
                                                                  onConfirm={() => handleRemoveParcel(parcel._id)}
                                                            >
                                                                  <Button disabled={parcel.status == "CANCELED"} variant="destructive" size="sm">
                                                                        Cancel
                                                                  </Button>
                                                            </DeleteConfirmation>
                                                      </TableCell>
                                                </TableRow>
                                          ))}
                                    </TableBody>
                              </Table>
                  }
            </div>
      );
}
