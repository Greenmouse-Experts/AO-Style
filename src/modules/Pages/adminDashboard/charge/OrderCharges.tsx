import { useMutation, useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { toast, ToastContainer } from "react-toastify";
import { SyntheticEvent, useRef } from "react";

interface OrderDeliveryFeeInterface {
  statusCode: number;
  data: {
    id: string;
    name: string;
    description: string | null;
    charge_amount: string;
    charge_type: string;
    minimum_order: string | null;
    maximum_order: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  };
}

export default function OrderDeliveryFeeSettings() {
  const query = useQuery<OrderDeliveryFeeInterface>({
    queryKey: ["OrderDeliveryFee"],
    queryFn: async () => {
      let resp = await CaryBinApi.get(
        "/delivery-setting/fetch-order-charge-details",
      );
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
      toast.error("Error updating order delivery fee");
    },
    onSuccess: () => {
      toast.success("Order delivery fee updated successfully");
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
        Error loading order delivery fee. Please try again later.
      </div>
    );
  }

  const onOrderFeeSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);

    const orderFeeData = {
      name: formData.get("name"),
      charge_amount: Number(formData.get("charge_amount")),
      charge_type: formData.get("charge_type"),
    };

    toast.promise(async () => await mutate.mutateAsync(orderFeeData), {
      pending: "Updating order delivery fee...",
      success: "Order delivery fee updated!",
      error: "Failed to update order delivery fee",
    });
  };

  const orderData = query.data?.data;

  return (
    <div id="cus-app" data-theme="nord" className="container mx-auto p-4">
      <div className="card bg-base-100 rounded-md">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title text-xl font-bold">Order Delivery Fee</h2>
          </div>

          <form
            method="dialog"
            className="space-y-4"
            onSubmit={onOrderFeeSubmit}
          >
            <div>
              <label className="label block mb-1">
                <span className="label-text">Charge Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                name="name"
                defaultValue={orderData?.name}
              />
            </div>

            <div>
              <label className="label block mb-1">
                <span className="label-text">Charge Amount (₦)</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                name="charge_amount"
                defaultValue={orderData?.charge_amount}
              />
            </div>

            <div>
              <label className="label block mb-1">
                <span className="label-text">Charge Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                name="charge_type"
                defaultValue={orderData?.charge_type}
              >
                <option value="FIXED">Fixed</option>
                <option value="PERCENTAGE">Percentage</option>
              </select>
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
