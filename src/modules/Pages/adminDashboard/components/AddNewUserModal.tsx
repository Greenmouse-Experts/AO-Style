import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { toast } from "react-toastify";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";

const AddNewUser = ({ isOpen, onClose }: any) => {
  const { data: userData } = useGetBusinessDetails();
  const [addAddress, setAddAddress] = useState(false);
  const mutate = useMutation({
    mutationFn: async (data: any) => {
      // First request to get the businesses
      const busiRes = await CaryBinApi.get("/onboard/fetch-businesses?q=user");

      const businessId = busiRes.data.data[0]?.id;
      if (!businessId) {
        throw new Error("No business found");
      }

      // Second request using the businessId
      const resp = await CaryBinApi.post("/contact/invite", {
        ...data,
        business_id: businessId,
      });

      return resp.data;
    },
    onSuccess: () => {
      toast.success("invite sent successfully");
      setTimeout(() => toast.dismiss(), 600);
      setTimeout(() => onClose(), 800);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while sending invite",
      );
    },
  });
  const onsubmit = (e) => {
    e.preventDefault();
    let business_id = userData?.data?.id;
    const data = {
      business_id: business_id,
      email: e.target.email.value,
      name: e.target.name.value,
      role: e.target.role.value,
    };
    mutate.mutateAsync(data);
    setAddAddress(false);
    e.target.reset();
  };

  return (
    isOpen && (
      <div className="fixed bg-black/80 shadow inset-0 flex justify-center items-center z-[9999] backdrop-blur-sm">
        <div className="bg-white m-4 shadow-2xl rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
          {/* Header */}

          <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3 mb-4">
            <h2 className="text-lg font-semibold">Add a New User</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          {/* form starts here*/}
          <form
            onSubmit={onsubmit}
            id="cus-app"
            data-theme="nord"
            className="bg-white "
          >
            <input
              type="hidden"
              id="business_id"
              name="business_id"
              // value="cb6ee0bb-8ce9-46ad-a93a-d5474398d32c"
            />
            <fieldset className="form-control w-full mb-4">
              <label htmlFor="email" className="label mb-1">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input input-bordered w-full"
                placeholder="carybin+logistics-agent009@gmail.com"
              />
            </fieldset>
            <fieldset className="form-control w-full mb-4">
              <label htmlFor="name" className="label mb-1">
                <span className="label-text">Name (Optional)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input input-bordered w-full"
                placeholder="carybin Logic 009"
              />
            </fieldset>
            <fieldset className="form-control w-full mb-4">
              <label htmlFor="role" className="label mb-1">
                <span className="label-text">Role</span>
              </label>
              <select
                id="role"
                name="role"
                className="select select-bordered w-full"
              >
                <option value="USER">User</option>
                <option value="MARKET_REP">Market Representative</option>
                <option value="LOGISTICS_AGENT" selected>
                  Logistics Agent
                </option>
                <option value="FABRIC_VENDOR">Fabric Vendor</option>
                <option value="FASHION_DESIGNER">Fashion Designer</option>
              </select>
            </fieldset>
            {/* form ends here*/}

            <div className="space-y-3">
              {/* Buttons */}
              <div className="flex justify-between ">
                <button
                  onClick={onClose}
                  className="border px-4 py-2 rounded-md text-gray-600"
                >
                  Cancel
                </button>
                <button
                  disabled={mutate.isPending}
                  className=" btn btn-accent  text-white"
                >
                  {mutate.isPending ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AddNewUser;
