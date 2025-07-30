import React from "react";

const KYCVerification = () => {
  return (
    <div className="rounded-lg">
      {/* <h2 className="text-xl font-medium mb-4">KYC Verification</h2> */}

      <form action="">
        {/* ID Upload Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-4">
            National ID / Driver’s License / Passport
          </label>
          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <label className="w-full flex items-center justify-center p-4 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <input type="file" required className="hidden" />
              <span className="text-gray-700 flex items-center gap-2">
                📤 Upload Front
              </span>
            </label>

            <label className="w-full flex items-center justify-center p-4 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <input type="file" required className="hidden" />
              <span className="text-gray-700 flex items-center gap-2">
                📤 Upload Back
              </span>
            </label>
          </div>
        </div>

        {/* Utility Bill Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-4">
            Utility Bill (Proof of Address)
          </label>
          <label className="mt-2 w-full flex items-center justify-center p-4 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <input type="file" required className="hidden" />
            <span className="text-gray-700 flex items-center gap-2">
              📤 Upload Utility Bill
            </span>
          </label>
        </div>

        {/* Location */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-3">Location</label>
            <input
              type="text"
              placeholder="Enter your location"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-700">ID Type</label>
            <select
              className="w-full p-4 border border-gray-300 rounded-md mb-6"
              required
            >
              <option>National ID</option>
              <option>Driver’s License</option>
              <option>Passport</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
            Save Draft
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient text-white cursor-pointer"
          >
            Submit KYC
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCVerification;
