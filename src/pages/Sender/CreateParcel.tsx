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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
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
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const parcelSchema = z.object({
  sender: z.string().min(1, "Sender is required"),
  receiver: z.string().min(1, "Receiver is required"),
  type: z.string().min(3, "Type is required"),
  weight: z.number().positive("Weight must be greater than 0"),
  address: z.string().min(5, "Address is required"),
  deliveryDate: z.date(),
  fee: z.number().nonnegative("Fee must be greater than or equal to 0"), // Change this line
  note: z.string().optional(),
});


type ParcelFormValues = z.infer<typeof parcelSchema>;

const CreateParcel = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { data: receiverData, isLoading: receiverLoading } =
    useGetReceiverQuery(undefined);
  const { data: userData, isLoading: userLoading } =
    useUserInfoQuery(undefined);
  const [addParcel, { isLoading: isSubmitting }] = useAddParcelMutation();
  const navigate = useNavigate();

  const form = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      sender: userData?.data?._id || "",
      receiver: "",
      type: "",
      weight: 0,
      address: "",
      deliveryDate: new Date(),
      fee: 0,
      note: "",
    },

  });

  // Auto calculate fee when weight changes
  const weight = form.watch("weight");
  useEffect(() => {
    if (weight > 0) {
      form.setValue("fee", weight * 20); // 1kg = 20tk
    } else {
      form.setValue("fee", 0);
    }
  }, [weight, form]);

  const onSubmit = async (data: ParcelFormValues) => {
    console.log(data)
    const parcelData = {
      ...data,
      deliveryDate: data.deliveryDate.toISOString(),
    }
    try {
      const res = await addParcel(parcelData).unwrap();
      if (res.success) {
        toast.success("Parcel created successfully");
        navigate("/sender/parcels");
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to create parcel");
       if (error?.data?.errorSources) {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             error?.data?.errorSources.map((er:any) => toast.error(er.message) );
            }
    }
  };

  if (receiverLoading || userLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 md:max-w-3xl mx-auto md:p-4", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Create New Parcel</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details to create a parcel
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="parcel-create-from-select grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Receiver */}
          <FormField
            control={form.control}
            name="receiver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receiver</FormLabel>
                <FormControl className="w-full">
                  <Select onValueChange={field.onChange} value={field.value}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select receiver" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {receiverData?.data?.map((receiver: IUser) => (
                        <SelectItem className="w-full" key={receiver._id} value={receiver._id}>
                          {receiver.name} - {receiver.email}
                        </SelectItem>
                      ))}
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
                    defaultValue={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
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
                  <Input type="number" {...field} readOnly />
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
          {/* Delivery Date */}
          <div className="w-full md:col-span-2">
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      numberOfMonths={window.innerWidth < 768 ? 1 : 2}
                      className="rounded-lg border shadow-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>



          {/* Submit */}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full cursor-pointer">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Parcel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateParcel;

