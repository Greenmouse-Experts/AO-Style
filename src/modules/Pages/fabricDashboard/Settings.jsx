import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import useToast from "../../../hooks/useToast";
import { usePlacesWidget } from "react-google-autocomplete";
import { removeStateSuffix } from "../../../lib/helper";
import { AttentionTooltip } from "../../../components/ui/Tooltip";

const Settings = () => {
  const query = new URLSearchParams(useLocation().search);
  const q = query.get("q");

  const [activeTab, setActiveTab] = useState("personalDetails");
  const [activeSection, setActiveSection] = useState(q ?? "Profile");
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
    latitude: carybinUser?.profile?.coordinates?.latitude ?? "",
    longitude: carybinUser?.profile?.coordinates?.longitude ?? "",
  };

  const { isPending, uploadImageMutate } = useUploadImage();
  const [profileIsLoading, setProfileIsLoading] = useState(false);
  const { isPending: updateIsPending, updatePersonalMutate } =
    useUpdateProfile();
  const { toastError } = useToast();

  const { handleSubmit, values, handleChange, resetForm, setFieldValue } =
    useFormik({
      initialValues: initialValues,
      validateOnChange: false,
      validateOnBlur: false,
      enableReinitialize: true,
      onSubmit: (val) => {
        console.log("🔍 Fabric Vendor Settings Form Values:", val);
        if (!navigator.onLine) {
          toastError("No internet connection. Please check your network.");
          return;
        }
        // Remove "State" suffix if present before sending to backend
        const cleanedState = removeStateSuffix(val.state);
        
        updatePersonalMutate(
          {
            ...val,
            state: cleanedState || val.state || "",
            coordinates: {
              longitude: val.longitude || "",
              latitude: val.latitude || "",
            },
          },
          {
            onSuccess: () => {
              resetForm();
            },
          },
        );
      },
    });

  const { data: states, isLoading: loadingStates } = useStates(values.country);

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
            },
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
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      let state = "";
      let country = "";

      if (place.address_components) {
        place.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (types.includes("country")) {
            country = component.long_name;
          }
        });
      }

      setFieldValue("address", place.formatted_address);
      setFieldValue("latitude", lat ? lat.toString() : "");
      setFieldValue("longitude", lng ? lng.toString() : "");
      setFieldValue("state", state);
      setFieldValue("country", country);
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  const menuItems = ["Profile", "KYC", "Bank Details", "Security"];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Page Header */}
      <div className="bg-white px-4 sm:px-6 py-4 mb-4 sm:mb-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-medium mb-2">Settings</h1>
        <p className="text-sm text-gray-500">
          <Link to="/fabric" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row px-4 sm:px-6 gap-4 md:gap-6 max-w-7xl mx-auto">
        {/* Navigation Sidebar 
            - Mobile: Horizontal scrollable list
            - Desktop: Vertical sidebar
        */}
        <div className="w-full md:w-1/4 lg:w-1/5 bg-white md:bg-transparent md:h-fit rounded-lg shadow-sm md:shadow-none p-2 md:p-0 sticky top-4 z-10">
          <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-2 pb-2 md:pb-0 scrollbar-hide md:bg-white md:p-4 md:rounded-lg">
            {menuItems.map((item) => (
              <li
                key={item}
                className={`cursor-pointer px-4 py-2 sm:py-3 rounded-lg transition-colors duration-300 whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeSection === item
                    ? "font-medium text-purple-600 bg-purple-100"
                    : "hover:text-purple-600 text-gray-600 bg-gray-50 md:bg-transparent"
                }`}
                onClick={() => setActiveSection(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 lg:w-4/5 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          {activeSection === "Profile" && (
            <div>
              <h2 className="text-lg sm:text-xl font-medium mb-4">Profile</h2>
              
              {/* Profile Picture Section */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                {values.profile_picture ? (
                  <img
                    src={values.profile_picture}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-white">
                    {values?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex flex-col items-center sm:items-start">
                  <button
                    disabled={isPending || profileIsLoading}
                    onClick={handleButtonClick}
                    className="border px-4 py-2 text-sm text-purple-600 rounded-lg border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    {isPending || profileIsLoading
                      ? "Uploading..."
                      : "Change Picture"}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                    Max size: 5MB. Formats: JPG, PNG.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={uploadImage}
                  className="hidden"
                />
              </div>

              {/* Tabs */}
              <div className="mt-6 border-b border-gray-200">
                <div className="flex space-x-6 text-gray-500">
                  <button
                    className={`pb-2 text-sm sm:text-base font-medium transition-colors ${
                      activeTab === "personalDetails"
                        ? "border-b-2 border-purple-600 text-purple-600"
                        : "hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("personalDetails")}
                  >
                    Personal Details
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "personalDetails" && (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm font-medium">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 sm:p-4 border border-[#CCCCCC] outline-none rounded-lg focus:border-purple-500 transition-colors"
                        name={"name"}
                        value={values.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Phone & Email Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">
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
                            if (!value.startsWith("+")) {
                              value = "+" + value;
                            }
                            setFieldValue("phone", value);
                          }}
                          containerClass="w-full"
                          dropdownClass="flex flex-col gap-2 text-black"
                          buttonClass="bg-gray-50 border-r border-gray-300 rounded-l-lg hover:bg-gray-100"
                          inputClass="!w-full !h-[50px] sm:!h-[54px] !py-3 !text-base !border-[#CCCCCC] !rounded-lg focus:!border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full p-3 sm:p-4 border border-[#CCCCCC] outline-none rounded-lg focus:border-purple-500 transition-colors"
                          placeholder="Enter your email"
                          required
                          name={"email"}
                          value={values.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Alt Phone & Address Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">
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
                            if (!value.startsWith("+")) {
                              value = "+" + value;
                            }
                            setFieldValue("alternative_phone", value);
                          }}
                          containerClass="w-full"
                          dropdownClass="flex flex-col gap-2 text-black"
                          buttonClass="bg-gray-50 border-r border-gray-300 rounded-l-lg hover:bg-gray-100"
                          inputClass="!w-full !h-[50px] sm:!h-[54px] !py-3 !text-base !border-[#CCCCCC] !rounded-lg focus:!border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-gray-700 mb-2 text-sm font-medium">
                          Address (Google Maps)
                          <AttentionTooltip
                            content="Select from Google dropdown"
                            position="top"
                          />
                        </label>
                        <input
                          type="text"
                          ref={ref}
                          className="w-full p-3 sm:p-4 border border-[#CCCCCC] outline-none rounded-lg focus:border-purple-500 transition-colors"
                          placeholder="Type address..."
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

                    {/* Coordinates Display - Responsive Grid */}
                    {(values.latitude || values.longitude) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div>
                          <label className="block text-gray-700 mb-1 text-xs sm:text-sm font-medium">
                            Latitude
                          </label>
                          <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600 font-mono">
                            {values.latitude || "Not set"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-xs sm:text-sm font-medium">
                            Longitude
                          </label>
                          <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600 font-mono">
                            {values.longitude || "Not set"}
                          </div>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <p className="text-xs text-blue-600 flex items-start gap-1">
                            <span>📍</span> 
                            <span>Coordinates auto-detected from address selection.</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        disabled={updateIsPending}
                        type="submit"
                        className="w-full sm:w-auto cursor-pointer bg-purple-600 hover:bg-purple-700 transition-colors text-white px-8 py-3 rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {updateIsPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                            Updating...
                          </span>
                        ) : (
                          "Update Profile"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeSection === "KYC" && <KYCVerificationUpdate />}

          {activeSection === "Bank Details" && <BankDetailsUpdate />}

          {activeSection === "Security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings;