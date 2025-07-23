import { useState } from "react";

const AddCustomerModal = ({ isOpen, onClose }) => {
  const [addAddress, setAddAddress] = useState(false);

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3 mb-4">
            <h2 className="text-lg font-semibold">Add a New Customer</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                name={"name"}
                required
                // value={values.name}
                // onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                placeholder="Email Address"
              />
            </div>

            {/* Phone Number */}
            {/* <div className="flex gap-2">
              <div className="flex items-center p-0 px-3 border border-[#CCCCCC] rounded-lg">
                🇳🇬 +234
              </div>
              <input
                type="tel"
                className="flex-1 px-3 w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                placeholder="8023456789"
              />
            </div>
 */}
            {/* Toggle for Address */}
            {/* <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Add Address</label>
              <input
                type="checkbox"
                className="toggle-checkbox p-3"
                checked={addAddress}
                onChange={() => setAddAddress(!addAddress)}
              />
            </div>
 */}
            {/* Address Fields (Hidden Until Add Address is Enabled) */}
            {addAddress && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">
                    Building No., Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                    placeholder="Building No., Street Address"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                    placeholder="City"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="w-1/2 px-3 p-3 text-gray-600 border border-[#CCCCCC] outline-none rounded-lg">
                    <option>Country</option>
                    <option>Nigeria</option>
                  </select>
                  <select className="w-1/2 px-3 p-3 text-gray-600 border border-[#CCCCCC] outline-none rounded-lg">
                    <option>State</option>
                    <option>Lagos</option>
                  </select>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={onClose}
                className="border px-4 py-2 rounded-md text-gray-600"
              >
                Cancel
              </button>
              <button className="bg-gradient text-white px-4 py-2 rounded-md">
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AddCustomerModal;
