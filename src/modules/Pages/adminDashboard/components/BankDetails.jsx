const BankDetails = () => {
  return (
    <div className="">
      <h2 className="text-xl font-medium mb-4">Bank Details</h2>
      <form className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-4">Account Name</label>
          <input
            type="text"
            placeholder="Enter your account name"
            required
            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Account Number */}
          <div>
            <label className="block text-gray-700 mb-4">Account Number</label>
            <input
              type="text"
              placeholder="Enter your account number"
              required
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-gray-700 mb-4">Bank Name</label>
            <select
              required
              className="w-full p-4 text-gray-500 border border-[#CCCCCC] outline-none rounded-lg"
            >
              <option value="">Choose your bank</option>
              <option value="bank1">First Bank</option>
              <option value="bank2">GTBank</option>
              <option value="bank3">Access Bank</option>
              <option value="bank4">Zenith Bank</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient cursor-pointer text-white"
        >
          Add Bank Details
        </button>
      </form>
      {/* Account Name */}
    </div>
  );
};

export default BankDetails;
