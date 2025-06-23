import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AddTailorForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "personal";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleProceed = () => {
    if (activeTab === "personal") setActiveTab("business");
    else if (activeTab === "business") setActiveTab("kyc");
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleBack = () => {
    if (activeTab === "business") setActiveTab("personal");
    else if (activeTab === "kyc") setActiveTab("business");
  };

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <h2 className="text-lg font-semibold mb-6">
        Add Tailor/Fashion Designers
      </h2>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`py-2 px-4 ${
            activeTab === "personal"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setActiveTab("business")}
          className={`py-2 px-4 ${
            activeTab === "business"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          Business Info
        </button>
        <button
          onClick={() => setActiveTab("kyc")}
          className={`py-2 px-4 ${
            activeTab === "kyc"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500"
          }`}
        >
          KYC
        </button>
      </div>

      {/* Personal Info Tab */}
      {activeTab === "personal" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className="block text-gray-700 mb-4">
                Profile Picture
              </label>
              <div className="w-40 h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                <input type="file" className="hidden" id="upload" />
                <label
                  htmlFor="upload"
                  className="cursor-pointer text-gray-400"
                >
                  <img
                    src="https://randomuser.me/api/portraits/men/7.jpg"
                    alt="Profile"
                    className="w-24 h-24 mx-auto mb-4 rounded-full"
                  />
                  Upload profile picture
                </label>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-4">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter the fashion designer name"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-4">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter the email address"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 mb-4">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter the vendor password"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
                <span
                  className="absolute right-3 top-14 text-gray-400 cursor-pointer"
                  onClick={togglePassword}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <div className="relative">
                <label className="block text-gray-700 mb-4">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter the vendor password"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
                <span
                  className="absolute right-3 top-14 text-gray-400 cursor-pointer"
                  onClick={toggleConfirmPassword}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
          </div>

          {/* <div className="mt-8">
                        <button
                            onClick={handleProceed}
                            className="w-full md:w-auto bg-gradient text-white py-3 px-6 rounded-md hover:opacity-90"
                        >
                            Proceed to Business Info
                        </button>
                    </div> */}
        </div>
      )}

      {/* Business Info Tab */}
      {activeTab === "business" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-4">Business Name</label>
            <input
              type="text"
              placeholder="Enter the vendor business name"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4">
              Business Registration Number (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter your business registration number"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4">Phone Number</label>
            <input
              type="text"
              placeholder="Enter your phone number"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4">City</label>
            <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
              <option>Choose the city</option>
              <option>Lagos</option>
              <option>Abuja</option>
              <option>Port Harcourt</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 mb-4">Business Address</label>
            <input
              type="text"
              placeholder="Enter your business address"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-4">State</label>
            <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
              <option>Choose the state</option>
              <option>Lagos</option>
              <option>Abuja</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-4">Country</label>
            <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
              <option>Choose the country</option>
              <option>Nigeria</option>
              <option>Ghana</option>
            </select>
          </div>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === "kyc" && (
        <>
          <div>
            <label className="block mb-2 text-gray-700">ID Type</label>
            <select className="w-full p-3 border border-gray-300 rounded-md mb-6">
              <option>National ID</option>
              <option>Driver’s License</option>
              <option>Passport</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Front */}
            <div>
              <label className="block mb-2 text-gray-700">Upload Front</label>
              <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                <input type="file" className="hidden" id="uploadFront" />
                <label
                  htmlFor="uploadFront"
                  className="cursor-pointer text-gray-400"
                >
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 5v14m7-7H5" />
                  </svg>
                  Upload Front
                </label>
              </div>
            </div>

            {/* Upload Back */}
            <div>
              <label className="block mb-2 text-gray-700">Upload Back</label>
              <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                <input type="file" className="hidden" id="uploadBack" />
                <label
                  htmlFor="uploadBack"
                  className="cursor-pointer text-gray-400"
                >
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 5v14m7-7H5" />
                  </svg>
                  Upload Back
                </label>
              </div>
            </div>

            {/* Utility Bill (Proof of Address) */}
            <div className="col-span-1 md:col-span-2">
              <label className="block mb-2 text-gray-700">
                Utility Bill (Proof of Address)
              </label>
              <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                <input type="file" className="hidden" id="uploadUtilityBill" />
                <label
                  htmlFor="uploadUtilityBill"
                  className="cursor-pointer text-gray-400"
                >
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 5v14m7-7H5" />
                  </svg>
                  Upload Utility Bill
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 mb-4">Location</label>
              <input
                type="text"
                placeholder="Enter the location"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                required
              />
            </div>

            {/* Address */}
            {/* <div>
                            <label className="block text-gray-700 mb-4">Address</label>
                            <input
                                type="text"
                                placeholder="Enter the Address"
                                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                                required
                            />
                        </div> */}
          </div>
        </>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {activeTab !== "personal" && (
          <button
            onClick={handleBack}
            className="bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:opacity-90"
          >
            Back
          </button>
        )}
        <button
          onClick={handleProceed}
          className="bg-gradient text-white py-3 px-6 rounded-md hover:opacity-90"
        >
          {activeTab === "kyc"
            ? "Submit"
            : activeTab === "business"
            ? "Proceed to KYC"
            : "Proceed to Business Info"}
        </button>
      </div>
    </div>
  );
};

export default AddTailorForm;
