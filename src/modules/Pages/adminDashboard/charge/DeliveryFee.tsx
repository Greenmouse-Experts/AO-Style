import { useMutation, useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { toast, ToastContainer } from "react-toastify";
import { SyntheticEvent, useRef } from "react";

interface DeliverySettingInterface {
  statusCode: number;
  data: {
    id: string;
    price_per_km: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  };
}

export default function DeliveryFeeSettings() {
  const query = useQuery<DeliverySettingInterface>({
    queryKey: ["DeliverySetting"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/delivery-setting");
      return resp.data;
    },
  });

  const mutate = useMutation({
    mutationFn: async (data: any) => {
      let resp = await CaryBinApi.put(
        `/delivery-setting/${query.data?.data.id}`,
        data,
      );
      return resp.data;
    },
    onError: () => {
      toast.error("Error updating delivery fee");
    },
    onSuccess: () => {
      toast.success("Delivery fee updated successfully");
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
        Error loading delivery fee. Please try again later.
      </div>
    );
  }

  const onDeliveryFeeSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);

    const deliveryData = {
      price_per_km: Number(formData.get("price_per_km")),
    };

    toast.promise(async () => await mutate.mutateAsync(deliveryData), {
      pending: "Updating delivery fee...",
      success: "Delivery fee updated!",
      error: "Failed to update delivery fee",
    });
  };

  const deliveryData = query.data?.data;

  return (
    <div id="cus-app" data-theme="nord" className="container mx-auto p-4">
      <div className="card bg-base-100 rounded-md">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title text-xl font-bold">Delivery Fee</h2>
          </div>

          <form
            method="dialog"
            className="space-y-4"
            onSubmit={onDeliveryFeeSubmit}
          >
            <div className="mb-6">
              <label className="label block mb-1">
                <span className="label-text">Price per KM (₦)</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                className="input input-bordered w-full"
                name="price_per_km"
                id="price_per_km"
                defaultValue={deliveryData?.price_per_km}
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
