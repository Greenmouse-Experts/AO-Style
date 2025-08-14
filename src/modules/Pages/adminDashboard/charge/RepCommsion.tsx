import { useMutation, useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { toast, ToastContainer } from "react-toastify";
import { SyntheticEvent, useRef } from "react";

interface AdminCommissionInterface {
  statusCode: number;
  data: {
    id: string;
    fabric_vendor_commission: string;
    fashion_designer_commission: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  };
}

export default function RepCommission() {
  const query = useQuery<AdminCommissionInterface>({
    queryKey: ["AdminCommission"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/commission");
      return resp.data;
    },
  });

  const mutate = useMutation({
    mutationFn: async (data: any) => {
      let resp = await CaryBinApi.put(
        "/commission/" + query.data?.data.id,
        data,
      );
      return resp.data;
    },
    onError: () => {
      toast.error("Error occurred while updating commission");
    },
    onSuccess: () => {
      toast.success("Commission updated successfully");
      setTimeout(() => {
        toast.dismiss();
        editDialogRef.current?.close();
      }, 500);
    },
  });

  const editDialogRef = useRef<HTMLDialogElement>(null);

  if (query.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="text-error text-center mt-10">
        Error loading commission data. Please try again later.
      </div>
    );
  }

  const onCommissionSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);

    const commissionData = {
      fabric_vendor_commission: Number(
        formData.get("fabric_vendor_commission"),
      ),
      fashion_designer_commission: Number(
        formData.get("fashion_designer_commission"),
      ),
    };

    toast.promise(async () => await mutate.mutateAsync(commissionData), {
      pending: "Updating commission...",
      success: "Commission updated!",
      error: "Failed to update commission",
    });
  };

  const commissionData = query.data?.data;

  return (
    <div id="cus-app" data-theme="nord" className="container mx-auto p-4">
      <div className="card bg-base-100 rounded-md">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title text-xl font-bold">
              Market Rep Commission
            </h2>
          </div>

          <form
            method="dialog"
            className="space-y-4"
            onSubmit={onCommissionSubmit}
          >
            <div className="mb-4">
              <label className="label block mb-1">
                <span className="label-text">Fabric Vendor Commission (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 3.5"
                className="input input-bordered w-full"
                name="fabric_vendor_commission"
                id="fabric_vendor_commission"
                defaultValue={commissionData?.fabric_vendor_commission}
              />
            </div>
            <div className="mb-6">
              <label className="label block mb-1">
                <span className="label-text">
                  Fashion Designer Commission (%)
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 5.0"
                className="input input-bordered w-full"
                name="fashion_designer_commission"
                id="fashion_designer_commission"
                defaultValue={commissionData?.fashion_designer_commission}
              />
            </div>
            <div className="flex justify-end items-center gap-3">
              <button
                disabled={mutate.isPending}
                className="btn btn-primary text-white"
                type="submit"
              >
                {mutate.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
