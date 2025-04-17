import React from "react";

const KYCVerification = () => {
  return (
    <div className="rounded-lg">
      <h2 className="text-xl font-medium mb-4">KYC Verification</h2>

      {/* ID Upload Section */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-4">National ID / Driver’s License / Passport</label>
        <div className="mt-2 flex flex-col sm:flex-row gap-4">
          <label className="w-full flex items-center justify-center p-3 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <input type="file" required className="hidden" />
            <span className="text-gray-700 flex items-center gap-2">📤 Upload Front</span>
          </label>

          <label className="w-full flex items-center justify-center p-3 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <input type="file" required className="hidden" />
            <span className="text-gray-700 flex items-center gap-2">📤 Upload Back</span>
          </label>
        </div>
      </div>

      {/* Utility Bill Upload */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-4">Utility Bill (Proof of Address)</label>
        <label className="mt-2 w-full flex items-center justify-center p-3 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <input type="file" required className="hidden" />
          <span className="text-gray-700 flex items-center gap-2">📤 Upload Utility Bill</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
          Save Draft
        </button>
        <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient text-white">
          Submit KYC
        </button>
      </div>
    </div>

  );
};

export default KYCVerification;
