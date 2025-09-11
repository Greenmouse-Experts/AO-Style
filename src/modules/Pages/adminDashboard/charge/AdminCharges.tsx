import { useMutation, useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { Pencil } from "lucide-react";
import { SyntheticEvent, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";

interface AdminChargesInterface {
  statusCode: number;
  data: {
    id: string;
    fabric_vendor_fee: string;
    fashion_designer_fee: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  };
}

export default function AdminCharges() {
  const query = useQuery<AdminChargesInterface>({
    queryKey: ["AdminCharges"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/charge-setting");
      return resp.data;
    },
  });
  const mutate = useMutation({
    mutationFn: async (data: any) => {
      let resp = await CaryBinApi.put(
        "/charge-setting/" + query.data?.data.id,
        {
          ...data,
        },
      );
      return resp.data;
    },
    onError: (e) => {
      toast.error("error occured");
    },
    onSuccess: (e) => {
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
        Error loading admin charges. Please try again later.
      </div>
    );
  }

  const onChargeSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);
    const chargeData = {
      fabric_vendor_fee: Number(formData.get("fabric_vendor_fee")),
      fashion_designer_fee: Number(formData.get("fashion_designer_fee")),
    };
    toast.promise(async () => await mutate.mutateAsync(chargeData), {
      pending: "pending",
      success: "success",
    });
  };

  const chargeData = query.data?.data;

  return (
    <div id="cus-app" data-theme="nord" className="container mx-auto p-4">
      <div className="card bg-base-100 rounded-md">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title text-xl font-bold">
              Vendor & Tailor Charges
            </h2>
          </div>

          <form method="dialog" className="space-y-4" onSubmit={onChargeSubmit}>
            <div className="mb-4">
              <label className="label block mb-1">
                <span className="label-text">Fabric Vendor Fee (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 3.5"
                className="input input-bordered w-full"
                name="fabric_vendor_fee"
                id="fabric_vendor_fee"
                defaultValue={chargeData?.fabric_vendor_fee}
              />
            </div>
            <div className="mb-6">
              <label className="label block mb-1">
                <span className="label-text">Fashion Designer Fee (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 5.0"
                className="input input-bordered w-full"
                name="fashion_designer_fee"
                id="fashion_designer_fee"
                defaultValue={chargeData?.fashion_designer_fee}
              />
            </div>
            <div className="flex justify-end items-center gap-3">
              <button
                disabled={mutate.isPending}
                className="btn btn-primary text-white"
                type="submit"
              >
                {mutate.isPending ? "Saving" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
