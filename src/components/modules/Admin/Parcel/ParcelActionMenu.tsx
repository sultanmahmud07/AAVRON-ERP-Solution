
import { Button } from "@/components/ui/button"
import {
      DropdownMenu,
      DropdownMenuCheckboxItem,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUpdateParcelByAdminMutation } from "@/redux/features/parcel/parcel.api"
import { useNavigate } from "react-router"
import { IParcel } from "@/types/parcel.type"
import { toast } from "sonner"
import { IApiError } from "@/types"
import { EllipsisVertical } from "lucide-react"

const parcelStatusOptions = [
      "REQUESTED"
      , "APPROVED"
      , "DISPATCHED"
      , "IN_TRANSIT"
      , "DELIVERED"
      , "CANCELED"
      , "BLOCKED"
      , "UNBLOCKED"] as const;

export function ParcelActionMenu({ parcel }: { parcel: IParcel }) {
      const [updateParcelByAdmin] = useUpdateParcelByAdminMutation();
      const navigate = useNavigate();

      const handleStatusUpdate = async (status: string) => {
            const toastId = toast.loading("Updating...");
            const parcelId = parcel?._id || "";
            const parcelInfo = {
                  status: status
            }
            try {
                  const res = await updateParcelByAdmin({ parcelId, parcelInfo }).unwrap();
                  if (res.success) {
                        toast.dismiss(toastId);
                        toast.success("Parcel status updated successfully");
                        navigate("/admin/parcels");
                  }
            } catch (err) {
                  console.error(err);
                  const error = err as IApiError;
                  toast.error(`${error.data.message}`);
            }
      };

      return (
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button variant="outline"><EllipsisVertical size={72} color="#3d6eff" strokeWidth={4.25} /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {
                              parcelStatusOptions.map((status) => (
                                    <DropdownMenuCheckboxItem
                                          key={status}
                                          checked={parcel.status === status}
                                          onCheckedChange={() => handleStatusUpdate(status)}
                                    >
                                          {status}
                                    </DropdownMenuCheckboxItem>
                              ))
                        }
                  </DropdownMenuContent>
            </DropdownMenu>
      )
}
