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
      }, 800);
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
    <div
      id="cus-app"
      data-theme="nord"
      className="container mx-auto p-4 shadow-md"
    >
      <div className="card bg-base-100  rounded-lg">
        <div className="card-body">
          <div className="mb-2 border-b border-base-200 pb-2">
            <h2 className="text-2xl font-bold ">Admin Charges</h2>
          </div>

          <div className="md:hidden">
            {" "}
            {/* Mobile view */}
            {chargeData ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="card bg-base-200 shadow-lg p-4 rounded-lg border border-base-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-secondary">
                      Admin Charges
                    </h3>
                    <button
                      onClick={(e) => editDialogRef.current?.showModal()}
                      className="btn btn-sm btn-primary text-white hover:bg-primary-focus"
                      aria-label="Edit Charge"
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </button>
                  </div>
                  <div className="flex justify-between items-center mb-2 py-1 border-b border-base-300">
                    <span className="text-sm font-medium text-gray-600">
                      Fabric Vendor Fee:
                    </span>
                    <span className="text-sm font-semibold">
                      {chargeData.fabric_vendor_fee}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2 py-1 border-b border-base-300">
                    <span className="text-sm font-medium text-gray-600">
                      Fashion Designer Fee:
                    </span>
                    <span className="text-sm font-semibold">
                      {chargeData.fashion_designer_fee}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    {chargeData.is_active ? (
                      <div className="badge badge-success badge-lg">Active</div>
                    ) : (
                      <div className="badge badge-warning badge-lg">
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No charge data available.
              </p>
            )}
          </div>

          <div className="overflow-x-auto hidden md:block">
            {" "}
            {/* PC view */}
            <table className="table w-full rounded-lg bg-base-200 ">
              <thead>
                <tr className="">
                  <th className="">Fabric Vendor Fee (%)</th>
                  <th>Fashion Designer Fee (%)</th>
                  <th>Status</th>
                  <th className="">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargeData ? (
                  <tr>
                    <td>{chargeData.fabric_vendor_fee}</td>
                    <td>{chargeData.fashion_designer_fee}</td>
                    <td>
                      {chargeData.is_active ? (
                        <div className="badge badge-success badge-md">
                          Active
                        </div>
                      ) : (
                        <div className="badge badge-warning badge-md">
                          Inactive
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => editDialogRef.current?.showModal()}
                          className="btn btn-sm btn-primary text-white hover:bg-primary-focus"
                          aria-label="Edit Charge"
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      No charge data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <dialog id="edit_charge_modal" ref={editDialogRef} className="modal">
        <ToastContainer />
        <div className="modal-box p-6 bg-base-100 shadow-lg rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-primary">
            Edit Admin Charge
          </h3>
          <form method="dialog" className="space-y-4" onSubmit={onChargeSubmit}>
            <div className="mb-4">
              <label className="label block mb-1">
                <span className="label-text text-gray-600">
                  Fabric Vendor Fee (%)
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 3.5"
                className="input input-bordered w-full focus:ring-primary focus:border-primary"
                name="fabric_vendor_fee"
                id="fabric_vendor_fee"
                defaultValue={chargeData?.fabric_vendor_fee}
              />
            </div>
            <div className="mb-6">
              <label className="label block mb-1">
                <span className="label-text text-gray-600">
                  Fashion Designer Fee (%)
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 5.0"
                className="input input-bordered w-full focus:ring-primary focus:border-primary"
                name="fashion_designer_fee"
                id="fashion_designer_fee"
                defaultValue={chargeData?.fashion_designer_fee}
              />
            </div>
            <div className="flex justify-end items-center gap-3 pt-4 border-t border-base-300">
              <button
                className="btn btn-outline hover:text-primary"
                onClick={() => editDialogRef.current?.close()}
              >
                Cancel
              </button>
              <button
                disabled={mutate.isPending}
                className="btn btn-primary text-white hover:bg-primary-focus"
                type="submit"
              >
                {mutate.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
