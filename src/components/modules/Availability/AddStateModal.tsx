import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPinned, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAddStateMutation, useUpdateStateMutation } from "@/redux/features/state/state";
import { IApiError } from "@/types";

export interface IState {
  _id: string;
  state: string;
  zip?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface AddStateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stateToEdit?: IState | null;
}

export default function AddStateModal({ isOpen, onOpenChange, stateToEdit }: AddStateModalProps) {
  const [addState, { isLoading: isAdding }] = useAddStateMutation();
  const [updateState, { isLoading: isUpdating }] = useUpdateStateMutation();
  const [formData, setFormData] = useState({
    state: "",
    zip: "",
    type: "STANDARD_ESTIMATE",
  });

  useEffect(() => {
    if (stateToEdit) {
      setFormData({
        state: stateToEdit.state || "",
        zip: stateToEdit.zip || "",
        type: stateToEdit.type || "STANDARD_ESTIMATE",
      });
    } else {
      setFormData({
        state: "",
        zip: "",
        type: "STANDARD_ESTIMATE",
      });
    }
  }, [stateToEdit, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(stateToEdit ? "Updating state..." : "Adding state...");

    const payload = {
      state: formData.state,
      zip: formData.zip,
      type: formData.type,
    };

    try {
      let res;
      if (stateToEdit) {
        res = await updateState({
          stateId: stateToEdit._id,
          stateInfo: payload,
        }).unwrap();
      } else {
        res = await addState(payload).unwrap();
      }

      if (res.success) {
        toast.success(
          stateToEdit ? "State updated successfully!" : "State added successfully!",
          { id: toastId }
        );
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || `Failed to ${stateToEdit ? "update" : "add"} state`, { id: toastId });
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPinned className="w-5 h-5 text-primary" />
            {stateToEdit ? "Edit Available State" : "Add Available State"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>State Name</Label>
            <Input
              name="state"
              placeholder="e.g. Texas"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="bg-gray-50 dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-2">
            <Label>ZIP Code (Optional)</Label>
            <Input
              name="zip"
              placeholder="e.g. 75201"
              value={formData.zip}
              onChange={handleInputChange}
              className="bg-gray-50 dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-gray-50 dark:bg-zinc-900">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DFW_ESTIMATE">DFW Estimate</SelectItem>
                <SelectItem value="STANDARD_ESTIMATE">Standard Estimate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-[#16965f] text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save State"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
