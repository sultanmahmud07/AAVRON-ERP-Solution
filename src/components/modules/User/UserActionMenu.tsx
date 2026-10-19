
import { Button } from "@/components/ui/button"
import {
      DropdownMenu,
      DropdownMenuCheckboxItem,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { IApiError, IUser } from "@/types"
import { useUpdateUserMutation } from "@/redux/features/user/user.api"
import { EllipsisVertical } from "lucide-react"

const userStatusOptions = [
      "ACTIVE"
      , "INACTIVE"
      , "BLOCKED"] as const;

export function UserActionMenu({ user }: { user: IUser }) {
      const [updateUserByAdmin] = useUpdateUserMutation();

      const handleStatusUpdate = async (status: string) => {
            const toastId = toast.loading("Updating...");
            const userId = user?._id || "";
            const userInfo = {
                  isActive: status
            }
            try {
                  const res = await updateUserByAdmin({userId, userInfo}).unwrap();
                  if (res.success) {
                        toast.dismiss(toastId);
                        toast.success("User status updated successfully");
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
                              userStatusOptions.map((status) => (
                                    <DropdownMenuCheckboxItem
                                          key={status}
                                          checked={user?.isActive === status}
                                          disabled={user?.role === "SUPER_ADMIN"}
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
