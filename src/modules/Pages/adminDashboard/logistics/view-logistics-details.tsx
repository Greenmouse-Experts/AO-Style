import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import useApproveKyc from "../../../../hooks/user/useApproveKyc";
import { useModalState } from "../../../../hooks/useModalState";
import RejectKycModal from "../tailor/RejectTailorKyc";
import { nigeriaStates } from "../../../../constant";
import Select from "react-select";
import {
  useCountries,
  useStates,
} from "../../../../hooks/location/useGetCountries";
export default function ViewLogisticsDetails() {
  // const marketRepoInfo = state?.info;

  const { isPending, approveKycMutate } = useApproveKyc();

  const { isOpen, closeModal, openModal } = useModalState();

  const location = useLocation();

  const id = location?.state?.info;

  const { data: countries, isLoading: loadingCountries } = useCountries();

  const countriesOptions =
    countries?.map((c) => ({ label: c.name, value: c.name })) || [];

  console.log(id);

  const { isPending: userIsPending, data } = useGetUser(id);

  const tailorInfo = {
    ...data?.data?.business,
    ...data?.data?.user,
    kyc: data?.data?.kyc ? { ...data?.data?.kyc } : null,
  };

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "personal";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleProceed = () => {
    if (activeTab === "personal") {
      if (tailorInfo?.business_name) {
        setActiveTab("business");
      } else {
        setActiveTab("kyc");
      }
    } else if (activeTab === "business") setActiveTab("kyc");
    else if (activeTab === "kyc") {
      // Handle KYC approval logic here
      approveKycMutate(
        {
          business_id: tailorInfo?.kyc?.id,
          is_approved: true,
        },
        {
          onSuccess: () => {},
        },
      );
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleBack = () => {
    if (activeTab === "business") setActiveTab("personal");
    else if (activeTab === "kyc") {
      if (tailorInfo?.business_name) {
        setActiveTab("business");
      } else {
        setActiveTab("personal");
      }
    }
  };

  console.log("Tailor Info:", tailorInfo?.business_name);

  const { data: states, isLoading: loadingStates } = useStates(
    tailorInfo?.kyc?.country,
  );

  const statesOptions =
    states?.map((c) => ({ label: c.name, value: c.name })) || [];

  const urlContainsTailors = location.pathname.includes("logistics")
    ? "View  Logistics"
    : "View Fabric Vendor";

  return (
    <React.Fragment>
      {" "}
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <h2 className="text-lg font-semibold mb-6">{urlContainsTailors}</h2>

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
          {tailorInfo?.business_name ? (
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
          ) : (
            <></>
          )}

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
                    {tailorInfo?.profile?.profile_picture ? (
                      <img
                        src={tailorInfo?.profile?.profile_picture}
                        alt="Profile"
                        className="w-24 h-24 mx-auto mb-4 rounded-full"
                      />
                    ) : (
                      <div
                        role="button"
                        className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-medium text-white"
                      >
                        {tailorInfo?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    {/* Upload profile picture */}
                  </label>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-4">Full Name</label>
                  <input
                    value={tailorInfo?.name}
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
                    value={tailorInfo?.email}
                    type="email"
                    placeholder="Enter the email address"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-4">
                    Phone Number
                  </label>
                  <input
                    value={tailorInfo?.phone}
                    type="text"
                    placeholder="Enter your phone number"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-4">
                    Alternate Phone Number
                  </label>
                  <input
                    value={tailorInfo?.alternative_phone}
                    type="text"
                    placeholder="Alternate phone number"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-4">
                    How did you hear about us?
                  </label>
                  <select
                    name={"referral_source"}
                    value={tailorInfo.referral_source}
                    className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg text-gray-500"
                  >
                    <option value="" disabled selected>
                      Select option
                    </option>
                    <option value="Social Media">Social Media</option>
                    <option value="Radio/TV Ads">Radio / TV Ads</option>
                    <option value="Blogs/Articles">Blogs/Articles</option>
                    <option value="Personal Referral">Personal Referral</option>
                    <option value="Just got here">Just got here</option>
                    <option value="Other">Other</option>
                  </select>
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
                value={tailorInfo?.business_name}
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
                value={tailorInfo?.business_registration_number}
                placeholder="Enter your business registration number"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-4">Business type</label>
              <select
                name={"business_type"}
                value={tailorInfo.business_type}
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg text-gray-500"
                required
              >
                <option value="" disabled selected>
                  Select your business type
                </option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="llc">Limited Liability Company (LLC)</option>
                <option value="corporation">
                  Corporation (C Corp & S Corp)
                </option>
                <option value="nonprofit">Nonprofit Organization</option>
                <option value="franchise">Franchise</option>
              </select>
            </div>
            <div className="">
              <label className="block text-gray-700 mb-4">
                Business Address
              </label>
              <input
                type="text"
                value={tailorInfo?.location}
                placeholder="Enter your business address"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              />
            </div>

            {/* <div>
              <label className="block text-gray-700 mb-4">State</label>
              <Select
                options={statesOptions}
                name="state"
                value={statesOptions?.find(
                  (opt) => opt.value === tailorInfo?.state
                )}
                onChange={(selectedOption) => {}}
                placeholder="Select"
                className="p-2 w-full mb-6 border border-[#CCCCCC] outline-none rounded-lg"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    outline: "none",
                    backgroundColor: "#fff",
                    "&:hover": {
                      border: "none",
                    },
                  }),
                  indicatorSeparator: () => ({
                    display: "none",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />{" "}
            </div>
            <div>
              <label className="block text-gray-700 mb-4">Country</label>
              <Select
                options={countriesOptions}
                name="country"
                value={countriesOptions?.find(
                  (opt) => opt.value === tailorInfo?.country
                )}
                onChange={(selectedOption) => {}}
                placeholder="Select"
                className="p-2 w-full mb-6 border border-[#CCCCCC] outline-none rounded-lg"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    outline: "none",
                    backgroundColor: "#fff",
                    "&:hover": {
                      border: "none",
                    },
                  }),
                  indicatorSeparator: () => ({
                    display: "none",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />{" "}
            </div> */}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <>
            <div>
              <label className="block mb-2 text-gray-700">ID Type</label>
              {/* <select
              value={tailorInfo?.id_type}
              className="w-full p-3 border border-gray-300 rounded-md mb-6"
            >
              <option>National ID</option>
              <option>Driver’s License</option>
              <option>Passport</option>
            </select> */}
              <Select
                options={[
                  { label: "National ID", value: "national id" },
                  { label: "Driver’s License", value: "driver’s license" },
                  { label: "Passport", value: "passport" },
                ]}
                name="id_type"
                value={[
                  { label: "National ID", value: "national id" },
                  { label: "Driver’s License", value: "driver’s license" },
                  { label: "Passport", value: "passport" },
                ]?.find((opt) => opt.value === tailorInfo?.kyc?.id_type)}
                onChange={(selectedOption) => {
                  // setFieldValue("id_type", selectedOption.value);
                }}
                isSearchable={false}
                required
                placeholder="Select"
                className="w-full p-2 border border-gray-300 rounded-md mb-6"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    outline: "none",
                    backgroundColor: "#fff",
                    "&:hover": {
                      border: "none",
                    },
                  }),
                  indicatorSeparator: () => ({
                    display: "none",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />{" "}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Front */}
              <div>
                <label className="block mb-2 text-gray-700">Upload Front</label>
                <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                  <input type="file" className="hidden" id="uploadFront" />
                  {tailorInfo?.kyc?.doc_front ? (
                    <a
                      href={tailorInfo?.kyc?.doc_front}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 flex justify-end cursor-pointer hover:underline"
                    >
                      View file upload
                    </a>
                  ) : (
                    <label
                      // htmlFor="uploadFront"
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
                  )}
                </div>
              </div>

              {/* Upload Back */}
              <div>
                <label className="block mb-2 text-gray-700">Upload Back</label>
                <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                  <input type="file" className="hidden" id="uploadBack" />

                  {tailorInfo?.kyc?.doc_back ? (
                    <>
                      {" "}
                      <a
                        href={tailorInfo?.kyc?.doc_back}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-end cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    </>
                  ) : (
                    <>
                      {" "}
                      <label
                        //   htmlFor="uploadBack"
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
                    </>
                  )}
                </div>
              </div>

              {/* Utility Bill (Proof of Address) */}
              <div className="col-span-1 md:col-span-2 mb-6">
                <label className="block mb-2 text-gray-700">
                  Utility Bill (Proof of Address)
                </label>
                <div className="w-full h-40 border border-gray-300 rounded-md flex items-center justify-center bg-white">
                  <input
                    type="file"
                    className="hidden"
                    id="uploadUtilityBill"
                  />
                  {tailorInfo?.kyc?.utility_doc ? (
                    <>
                      {" "}
                      <a
                        href={tailorInfo?.kyc?.utility_doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-end cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    </>
                  ) : (
                    <label
                      //   htmlFor="uploadUtilityBill"
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
                  )}
                </div>
              </div>

              {/* Location */}

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
            <div className="">
              <div className="w-full">
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name={"location"}
                  value={tailorInfo?.kyc?.location}
                  className="mb-6 w-full p-4  border border-[#CCCCCC] outline-none rounded-lg text-sm"
                  placeholder="address"
                />
              </div>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {activeTab !== "personal" && (
            <button
              onClick={handleBack}
              className="bg-gray-300 cursor-pointer text-gray-700 py-3 px-6 rounded-md hover:opacity-90"
            >
              Back
            </button>
          )}
          {activeTab === "personal" && (
            <button
              onClick={handleProceed}
              className="bg-gradient text-white cursor-pointer py-3 px-6 rounded-md hover:opacity-90"
            >
              {tailorInfo?.business_name
                ? "Proceed to Business Info"
                : " Proceed to KYC"}
            </button>
          )}
          {activeTab === "business" && (
            <button
              onClick={handleProceed}
              className="bg-gradient text-white cursor-pointer py-3 px-6 rounded-md hover:opacity-90"
            >
              Proceed to KYC
            </button>
          )}
          {activeTab === "kyc" && tailorInfo?.kyc?.is_approved === true ? (
            <button
              className="bg-gradient text-white cursor-pointer py-3 px-6 rounded-md hover:opacity-90"
              disabled
            >
              Approved
            </button>
          ) : activeTab === "kyc" &&
            tailorInfo?.kyc?.is_approved === false &&
            tailorInfo?.kyc?.reviewed_by ? (
            <button
              className="bg-gradient text-white cursor-pointer py-3 px-6 rounded-md hover:opacity-90"
              disabled
            >
              Rejected
            </button>
          ) : activeTab === "kyc" && tailorInfo?.kyc == null ? (
            <button
              className="bg-gradient text-white cursor-not-allowed py-3 px-6 rounded-md hover:opacity-90"
              disabled
            >
              Awaiting Submission
            </button>
          ) : activeTab === "kyc" &&
            tailorInfo?.kyc &&
            tailorInfo?.kyc?.is_approved !== true &&
            (!tailorInfo?.kyc?.reviewed_by ||
              (tailorInfo?.kyc?.is_approved === false &&
                !tailorInfo?.kyc?.reviewed_by)) ? (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  openModal();
                }}
                className="bg-gradient text-white cursor-pointer py-3 px-6 rounded-md hover:opacity-90"
              >
                Reject
              </button>
              <button
                disabled={isPending}
                onClick={handleProceed}
                className="bg-gradient text-white cursor-pointer py-3 px-6 rounded-md hover:opacity-90"
              >
                {isPending ? "Please wait..." : "Approve"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <RejectKycModal
        id={tailorInfo?.kyc?.id}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </React.Fragment>
  );
}
