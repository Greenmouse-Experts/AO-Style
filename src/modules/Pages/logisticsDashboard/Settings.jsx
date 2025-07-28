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
import KYCVerificationUpdate from "../adminDashboard/components/KYCVerification";
import PhoneInput from "react-phone-input-2";
import {
  useCountries,
  useStates,
} from "../../../hooks/location/useGetCountries";
import Select from "react-select";
import useToast from "../../../hooks/useToast";
import { usePlacesWidget } from "react-google-autocomplete";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("personalDetails");
  const [bodyTab, setBodyTab] = useState("upperBody");
  const [activeSection, setActiveSection] = useState("Profile");

  const { data: countries, isLoading: loadingCountries } = useCountries();

  const countriesOptions =
    countries?.map((c) => ({ label: c.name, value: c.name })) || [];

  const { carybinUser } = useCarybinUserStore();

  const initialValues = {
    name: carybinUser?.name ?? "",
    email: carybinUser?.email ?? "",
    profile_picture: carybinUser?.profile?.profile_picture ?? null,
    address: carybinUser?.profile?.address ?? "",
    country: carybinUser?.profile?.country ?? "",
    state: carybinUser?.profile?.state ?? "",
    phone: carybinUser?.phone ?? "",
  };

  const { isPending, uploadImageMutate } = useUploadImage();

  const [profileIsLoading, setProfileIsLoading] = useState(false);

  const { isPending: updateIsPending, updatePersonalMutate } =
    useUpdateProfile();

  const { toastError } = useToast();

  const {
    handleSubmit,
    values,
    handleChange,
    resetForm,
    setFieldValue,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      updatePersonalMutate(
        {
          ...val,
          coordinates: {
            longitude: val.longitude,
            latitude: val.latitude,
          },
        },
        {
          onSuccess: () => {
            resetForm();
          },
        }
      );
    },
  });

  const { data: states, isLoading: loadingStates } = useStates(values.country);

  const statesOptions =
    states?.map((c) => ({ label: c.name, value: c.name })) || [];

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

  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      setFieldValue("address", place.formatted_address);
      setFieldValue("latitude", place.geometry?.location?.lat().toString());
      setFieldValue("longitude", place.geometry?.location?.lng().toString());
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Settings</h1>
        <p className="text-gray-500">
          <Link to="/logistics" className="text-blue-500 hover:underline">
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
                        <PhoneInput
                          country={"ng"}
                          value={values.phone}
                          inputProps={{
                            name: "phone",
                            required: true,
                          }}
                          onChange={(value) => {
                            // Ensure `+` is included and validate
                            if (!value.startsWith("+")) {
                              value = "+" + value;
                            }
                            setFieldValue("phone", value);
                          }}
                          containerClass="w-full disabled:bg-gray-100"
                          dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                          buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                          inputClass="!w-full px-4 font-sans disabled:bg-gray-100  !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-4">
                          Alternate Phone Number
                        </label>
                        <PhoneInput
                          country={"ng"}
                          value={values.alternative_phone}
                          inputProps={{
                            name: "alternative_phone",
                            required: true,
                          }}
                          onChange={(value) => {
                            // Ensure `+` is included and validate
                            if (!value.startsWith("+")) {
                              value = "+" + value;
                            }
                            setFieldValue("alternative_phone", value);
                          }}
                          containerClass="w-full disabled:bg-gray-100"
                          dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                          buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                          inputClass="!w-full px-4 font-sans disabled:bg-gray-100  !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-4">
                          Address
                        </label>
                        <input
                          type="text"
                          ref={ref}
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                          placeholder="Enter full detailed address"
                          required
                          name="address"
                          maxLength={150}
                          onChange={(e) => {
                            setFieldValue("address", e.currentTarget.value);
                            setFieldValue("latitude", "");
                            setFieldValue("longitude", "");
                          }}
                          value={values.address}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-4">
                          Country
                        </label>
                        <Select
                          options={countriesOptions}
                          name="country"
                          value={countriesOptions?.find(
                            (opt) => opt.value === values.country
                          )}
                          onChange={(selectedOption) => {
                            setFieldValue("country", selectedOption.value);
                          }}
                          placeholder="Select"
                          className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
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
                        <label className="block text-gray-700 mb-4">
                          State
                        </label>
                        <Select
                          options={statesOptions}
                          name="state"
                          value={statesOptions?.find(
                            (opt) => opt.value === values.state
                          )}
                          onChange={(selectedOption) => {
                            setFieldValue("state", selectedOption.value);
                          }}
                          placeholder="Select"
                          className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
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
              </div>
            </div>
          )}

          {activeSection === "KYC" && (
            <div className="">
              <KYCVerificationUpdate />
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
