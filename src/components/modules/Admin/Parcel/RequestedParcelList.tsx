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
import {
      Pagination,
      PaginationContent,
      PaginationItem,
      PaginationLink,
      PaginationNext,
      PaginationPrevious,
} from "@/components/ui/pagination";
import { EyeIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useBlockParcelByAdminMutation, useGetAllParcelsQuery, useRemoveParcelMutation } from "@/redux/features/parcel/parcel.api";
import { IParcel } from "@/types/parcel.type";
import { Link } from "react-router";
import { ParcelActionMenu } from "./ParcelActionMenu";
import { formatDate } from "@/utils/getDateFormater";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IApiError } from "@/types";
import { Switch } from "@/components/ui/switch";
import TableSkeleton from "../../loader/Receiver/TableSkeleton";


export default function RequestedParcelList() {
      const [currentPage, setCurrentPage] = useState(1);
      const [limit] = useState(10);
      const [searchTerm, setSearchTerm] = useState("")
      const [sortOrder, setSortOrder] = useState("")
      const { data, isLoading } = useGetAllParcelsQuery({ page: currentPage, limit, searchTerm, sort: sortOrder, status: "REQUESTED" });
      const [removeParcel] = useRemoveParcelMutation();
      const [blockParcelByAdmin] = useBlockParcelByAdminMutation();
      const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
      }

      const handleSortChange = (value: string) => {
            setSortOrder(value)
      }
      const handleRemoveParcel = async (parcelId: string) => {
            const toastId = toast.loading("Removing...");
            try {
                  const res = await removeParcel(parcelId).unwrap();

                  if (res.success) {
                        toast.success("Parcel remove successfully!");
                        toast.dismiss(toastId);
                  }
            } catch (err) {
                  toast.dismiss(toastId);
                  console.error(err);
            }
      };

      const handleUpdateParcel = async (parcel: IParcel) => {
            const toastId = toast.loading("Updating...");
            const parcelId = parcel?._id || "";
            const parcelInfo = {
                  isBlocked: !parcel.isBlocked
            }
            try {
                  const res = await blockParcelByAdmin({ parcelId, parcelInfo }).unwrap();
                  if (res.success) {
                        toast.dismiss(toastId);
                        toast.success("Parcel updated successfully");
                  }
            } catch (err) {
                  console.error(err);
                  const error = err as IApiError;
                  toast.error(`${error.data.message}`);
            }
      };
      const totalPage = data?.meta?.totalPage || 1;
      // console.log(data)


      return (
            <div className="w-full ">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold">Requested Parcels</h1>
                        <Input
                              className="w-full md:w-sm"
                              type="text"
                              placeholder="Search here.."
                              value={searchTerm}
                              onChange={handleSearchChange}
                        />
                        <Select onValueChange={handleSortChange} value={sortOrder}>
                              <SelectTrigger className="md:w-[180px]">
                                    <SelectValue placeholder="Select a list order" />
                              </SelectTrigger>
                              <SelectContent>
                                    <SelectGroup>
                                          <SelectLabel>Order By</SelectLabel>
                                          <SelectItem value="createdAt">Ascending</SelectItem>
                                          <SelectItem value="-createdAt">Descending</SelectItem>
                                    </SelectGroup>
                              </SelectContent>
                        </Select>
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
                                                <TableHead className="">Status</TableHead>
                                                <TableHead className="text-center">Action</TableHead>
                                          </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {data?.data.map((parcel: IParcel) => (
                                                <TableRow key={parcel._id}>
                                                      <TableCell className="font-medium">{parcel.type}</TableCell>
                                                      <TableCell className="font-medium">{parcel.weight}</TableCell>
                                                      <TableCell>{parcel.fee || 0}</TableCell>
                                                      <TableCell className="">{formatDate(parcel.deliveryDate)}</TableCell>
                                                      <TableCell className="text-yellow-600">{parcel.status}</TableCell>
                                                      <TableCell className="flex items-center gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                  <Switch
                                                                        checked={parcel.isBlocked}
                                                                        id="airplane-mode" onClick={() => handleUpdateParcel(parcel)} />
                                                                  <Label htmlFor="airplane-mode">{parcel.isBlocked ? "Blocked" : "Unblock"}</Label>
                                                            </div>
                                                            <Link className="w-full cursor-pointer" to={`/admin/parcel/${parcel._id}`}>
                                                                  <Button size="sm">
                                                                        <EyeIcon />
                                                                  </Button>
                                                            </Link>
                                                            <DeleteConfirmation
                                                                  onConfirm={() => handleRemoveParcel(parcel._id)}
                                                            >
                                                                  <Button size="sm">
                                                                        <Trash2 />
                                                                  </Button>
                                                            </DeleteConfirmation>
                                                            <ParcelActionMenu parcel={parcel}></ParcelActionMenu>
                                                      </TableCell>
                                                </TableRow>
                                          ))}
                                    </TableBody>
                              </Table>
                  }
                  {totalPage > 1 && (
                        <div className="flex justify-end mt-4">
                              <div>
                                    <Pagination>
                                          <PaginationContent>
                                                <PaginationItem>
                                                      <PaginationPrevious
                                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                                            className={
                                                                  currentPage === 1
                                                                        ? "pointer-events-none opacity-50"
                                                                        : "cursor-pointer"
                                                            }
                                                      />
                                                </PaginationItem>
                                                {Array.from({ length: totalPage }, (_, index) => index + 1).map(
                                                      (page) => (
                                                            <PaginationItem
                                                                  key={page}
                                                                  onClick={() => setCurrentPage(page)}
                                                            >
                                                                  <PaginationLink className="cursor-pointer" isActive={currentPage === page}>
                                                                        {page}
                                                                  </PaginationLink>
                                                            </PaginationItem>
                                                      )
                                                )}
                                                <PaginationItem>
                                                      <PaginationNext
                                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                                            className={
                                                                  currentPage === totalPage
                                                                        ? "pointer-events-none opacity-50"
                                                                        : "cursor-pointer"
                                                            }
                                                      />
                                                </PaginationItem>
                                          </PaginationContent>
                                    </Pagination>
                              </div>
                        </div>
                  )}
            </div>
      );
}
