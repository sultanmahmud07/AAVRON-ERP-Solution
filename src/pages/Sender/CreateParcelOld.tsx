import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetReceiverQuery } from "@/redux/features/receiver/receiver.api";
import { IApiError, IUser } from "@/types";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useAddParcelMutation } from "@/redux/features/parcel/parcel.api";
import { useNavigate } from "react-router";

// ✅ Schema aligned with backend
const parcelSchema = z.object({
  sender: z.string().min(1, "Sender is required"),
  receiver: z.string().min(1, "Receiver is required"),
  type: z.string().min(3, "Type is required"),
  weight: z
    .number()
    .positive("Weight must be greater than 0"),
  address: z.string().min(5, "Address is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  fee: z
    .number("Fee must be a number")
    .positive("Fee must be greater than 0"),
  note: z.string().optional(),
});

type ParcelFormValues = z.infer<typeof parcelSchema>;

const CreateParcel = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
    const { data: receiverData, isLoading: receiverLoading } =useGetReceiverQuery(undefined);
    const { data: userData, isLoading: userLoading } =useUserInfoQuery(undefined);
    const [addParcel] = useAddParcelMutation();
    const navigate = useNavigate();


  const form = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      receiver: "",
      sender: userData?.data?._id || "",
      type: "",
      weight: 0,
      address: "",
      deliveryDate: "",
      fee: 0,
      note: "",
    },
  });

  const onSubmit = async (data: ParcelFormValues) => {
    console.log(data)
      try {
      const res = await addParcel(data).unwrap();
      if (res.success) {
        toast.success("Parcel created successfully");
        navigate("/sender/parcels");
      }
    } catch (err) {
console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to create parcel");
    }
  };
if (receiverLoading && userLoading) {
    return <div>Loading senders...</div>;
  } 
  return (
    <div className={cn("flex flex-col gap-6 max-w-3xl mx-auto", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create New Parcel</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details to create a parcel
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender (Dropdown) */}
          <FormField
            control={form.control}
            name="receiver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receiver</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select receiver" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        receiverData?.data?.map((receiver: IUser) => (
                          <SelectItem key={receiver._id} value={receiver._id}>
                            {receiver.name} - {receiver.email}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="Parcel type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weight */}
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Weight"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Date */}
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fee */}
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee (BDT)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Fee"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea placeholder="Optional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Create Parcel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateParcel;
