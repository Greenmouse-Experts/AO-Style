import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SecuritySettings from "./components/SecuritySettings";
import BankDetails from "./components/BankDetails";
import KYCVerification from "./components/KYCVerification";
import { useFormik } from "formik";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateProfile from "../../../hooks/settings/useUpdateProfile";
import BankDetailsUpdate from "../tailorDashboard/components/BankDetails";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("personalDetails");
  const [bodyTab, setBodyTab] = useState("upperBody");
  const [activeSection, setActiveSection] = useState("Profile");

  const { carybinUser } = useCarybinUserStore();

  const initialValues = {
    name: carybinUser?.name ?? "",
    email: carybinUser?.email ?? "",
    profile_picture: carybinUser?.profile?.profile_picture ?? null,
    address: carybinUser?.profile?.address ?? "",
    country: "",
    state: "",
    phone: carybinUser?.phone ?? "",
  };

  const { isPending, uploadImageMutate } = useUploadImage();

  const [profileIsLoading, setProfileIsLoading] = useState(false);

  const { isPending: updateIsPending, updatePersonalMutate } =
    useUpdateProfile();

  const {
    handleSubmit,
    values,
    handleChange,
    resetForm,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      updatePersonalMutate(val, {
        onSuccess: () => {
          resetForm();
        },
      });
    },
  });

  const fileInputRef = useRef(null);

  const uploadImage = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("image", file);
      uploadImageMutate(formData, {
        onSuccess: (data) => {
          setProfileIsLoading(true);
          updatePersonalMutate(
            { ...values, profile_picture: data?.data?.data?.url },
            {
              onSuccess: () => {
                setProfileIsLoading(false);
              },
            }
          );
        },
      });
      e.target.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Settings</h1>
        <p className="text-gray-500">
          <Link to="/customer" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Settings
        </p>
      </div>
      <div className="flex flex-col md:flex-row bg-gray-100">
        {/* Sidebar */}
        <div className="w-full md:w-1/5 bg-white md:mb-0 mb-6 h-fit p-4 rounded-lg">
          <ul className="space-y-2 text-gray-600">
            {["Profile", "KYC", "Bank Details", "Security"].map((item) => (
              <li
                key={item}
                className={`cursor-pointer px-4 py-3 rounded-lg transition-colors duration-300 ${
                  activeSection === item
                    ? "font-medium text-purple-600 bg-purple-100"
                    : "hover:text-purple-600"
                }`}
                onClick={() => setActiveSection(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-4/5 bg-white p-6 rounded-lg md:ml-6">
          {activeSection === "Profile" && (
            <div>
              <h2 className="text-xl font-medium mb-4">Profile</h2>
              <div className="mt-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                {values.profile_picture ? (
                  <img
                    src={values.profile_picture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <>
                    {" "}
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                      {values?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </>
                )}
                <button
                  disabled={isPending || profileIsLoading}
                  onClick={handleButtonClick}
                  className="border px-4 py-2 text-purple-600 rounded-lg border-purple-600"
                >
                  {isPending || profileIsLoading
                    ? "Please wait..."
                    : " Change Picture"}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={uploadImage}
                  className="hidden"
                />
              </div>

              {/* Tabs */}
              <div className="mt-6  flex space-x-6 text-gray-500">
                <button
                  className={`pb-2 ${
                    activeTab === "personalDetails"
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("personalDetails")}
                >
                  Personal Details
                </button>
                <button
                  className={`pb-2 ${
                    activeTab === "bodyMeasurement"
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("bodyMeasurement")}
                >
                  Body Measurement
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "personalDetails" && (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-gray-700 mb-4">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        name={"name"}
                        value={values.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-4">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                          placeholder="0700 000 0000"
                          required
                          name={"phone"}
                          value={values.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-4">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                          placeholder="Enter your email address"
                          required
                          name={"email"}
                          value={values.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-4">
                        Address
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        placeholder="Enter full detailed address"
                        required
                        name={"address"}
                        value={values.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-4">
                          State
                        </label>
                        <input
                          type="text"
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                          placeholder="Enter the state"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-4">
                          Country
                        </label>
                        <input
                          type="text"
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                          placeholder="Enter the country"
                          required
                        />
                      </div>
                    </div>
                    <button
                      disabled={updateIsPending}
                      type="submit"
                      className="mt-4 cursor-pointer bg-gradient text-white px-6 py-2 rounded-md"
                    >
                      {updateIsPending ? "Please wait..." : "Update"}
                    </button>
                  </form>
                )}

                {activeTab === "bodyMeasurement" && (
                  <div>
                    <div className="border-b-4 border-[#D9D9D9] flex space-x-10 text-gray-500">
                      <button
                        className={`pb-2 ${
                          bodyTab === "upperBody"
                            ? "border-b-1 border-purple-600 text-purple-600"
                            : ""
                        }`}
                        onClick={() => setBodyTab("upperBody")}
                      >
                        Upper Body
                      </button>
                      <button
                        className={`pb-2 ${
                          bodyTab === "lowerBody"
                            ? "border-b-1 border-purple-600 text-purple-600"
                            : ""
                        }`}
                        onClick={() => setBodyTab("lowerBody")}
                      >
                        Lower Body
                      </button>
                      <button
                        className={`pb-2 ${
                          bodyTab === "fullBody"
                            ? "border-b-1 border-purple-600 text-purple-600"
                            : ""
                        }`}
                        onClick={() => setBodyTab("fullBody")}
                      >
                        Full Body
                      </button>
                    </div>

                    {bodyTab === "upperBody" && (
                      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Neck Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Neck Circumference"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Shoulder Width
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Shoulder Width"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Chest Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Chest Circumference"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Waist Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Waist Circumference"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Sleeve Length
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Sleeve Length"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Bicep Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Bicep Circumference"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Wrist Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Wrist Circumference"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Shirt Length
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Shirt Length"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                          <button
                            type="submit"
                            className="w-full sm:w-auto mt-4 bg-gradient text-white px-6 py-2"
                          >
                            Update Upper Body
                          </button>
                        </div>
                      </form>
                    )}
                    {bodyTab === "lowerBody" && (
                      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Waist Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter the circumference of your waist"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            Hip Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter the circumference of your hip"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            Thigh Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter the circumference of your thigh"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            Knee Circumference
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter the circumference of your knee"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-gray-700 mb-4">
                            Trouser Length (Waist to Ankle)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter your trouser length"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between gap-4 mt-2">
                          <button className="w-full sm:w-auto bg-gray-400 text-white px-6 py-2">
                            Back
                          </button>
                          <button
                            type="submit"
                            className="w-full sm:w-auto bg-gradient text-white px-6 py-2"
                          >
                            Update Lower Body
                          </button>
                        </div>
                      </form>
                    )}
                    {bodyTab === "fullBody" && (
                      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-gray-700 mb-4">
                            Full Height
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter the circumference of your waist"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            Agbada Length
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
                              placeholder="Enter the circumference of your hip"
                              required
                            />
                            <span className="absolute right-3 top-1/2 border-l border-[#CCCCCC] pl-2 transform -translate-y-1/2 text-gray-500">
                              cm
                            </span>
                          </div>
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between gap-4 mt-2">
                          <button className="w-full sm:w-auto bg-gray-400 text-white px-6 py-2">
                            Back
                          </button>
                          <button
                            type="submit"
                            className="w-full sm:w-auto bg-gradient text-white px-6 py-2"
                          >
                            Update Lower Body
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "KYC" && (
            <div className="">
              <KYCVerification />
            </div>
          )}

          {activeSection === "Bank Details" && (
            <div className="">
              <BankDetailsUpdate />
            </div>
          )}

          {activeSection === "Security" && (
            <div className="">
              <SecuritySettings />
            </div>
          )}
          {activeSection === "Settings" && (
            <h2 className="text-xl font-medium">General Settings</h2>
          )}
          {activeSection === "Support" && (
            <h2 className="text-xl font-medium">Support & Help</h2>
          )}
        </div>
      </div>
    </>
  );
};
export default Settings;
