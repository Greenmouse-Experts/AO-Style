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
import { useCountries } from "../../../hooks/location/useGetCountries";
import useToast from "../../../hooks/useToast";
import { usePlacesWidget } from "react-google-autocomplete";
import { AttentionTooltip } from "../../../components/ui/Tooltip";

const Settings = () => {
  const query = new URLSearchParams(useLocation().search);
  const q = query.get("q");

  const [activeTab, setActiveTab] = useState("personalDetails");
  const [activeSection, setActiveSection] = useState(q ?? "Profile");
  const { data: countries } = useCountries();

  const { carybinUser } = useCarybinUserStore();

  const initialValues = {
    name: carybinUser?.name ?? "",
    email: carybinUser?.email ?? "",
    profile_picture: carybinUser?.profile?.profile_picture ?? null,
    address: carybinUser?.profile?.address ?? "",
    country: carybinUser?.profile?.country ?? "",
    state: carybinUser?.profile?.state ?? "",
    phone: carybinUser?.phone ?? "",
    alternative_phone: carybinUser?.alternative_phone ?? "",
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
        console.log("🚚 Logistics Settings - Form submission data:", val);
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
          },
        );
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
      {/* Header */}
      <div className="bg-white px-4 md:px-6 py-4 mb-4 md:mb-6 shadow-sm">
        <h1 className="text-xl md:text-2xl font-medium mb-1 md:mb-3">
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          <Link to="/logistics" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Settings
        </p>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Sidebar / Mobile Horizontal Menu */}
          <div className="w-full md:w-64 bg-white p-2 md:p-4 rounded-lg shadow-sm shrink-0 sticky top-4 z-10">
            <ul className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-1 pb-2 md:pb-0 hide-scrollbar">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className={`cursor-pointer px-4 py-2 md:py-3 rounded-lg text-sm md:text-base whitespace-nowrap transition-colors duration-300 flex-shrink-0 ${
                    activeSection === item
                      ? "font-medium text-purple-600 bg-purple-100"
                      : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveSection(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full bg-white p-4 md:p-8 rounded-lg shadow-sm min-w-0">
            {activeSection === "Profile" && (
              <div>
                <h2 className="text-lg md:text-xl font-medium mb-6">Profile</h2>
                
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
                  {values.profile_picture ? (
                    <img
                      src={values.profile_picture}
                      alt="Profile"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl md:text-2xl font-medium text-gray-500">
                      {values?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <button
                      disabled={isPending || profileIsLoading}
                      onClick={handleButtonClick}
                      className="px-4 py-2 text-sm text-purple-600 rounded-lg border border-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      {isPending || profileIsLoading
                        ? "Uploading..."
                        : "Change Picture"}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={uploadImage}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex space-x-6">
                    <button
                      className={`pb-2 text-sm md:text-base font-medium transition-colors relative ${
                        activeTab === "personalDetails"
                          ? "text-purple-600 border-b-2 border-purple-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("personalDetails")}
                    >
                      Personal Details
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div>
                  {activeTab === "personalDetails" && (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 md:p-4 border border-gray-300 focus:border-purple-500 outline-none rounded-lg text-sm md:text-base"
                          name={"name"}
                          value={values.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            containerClass="!w-full"
                            inputClass="!w-full !h-[50px] md:!h-[54px] !pl-[48px] !text-sm md:!text-base !border-gray-300 !rounded-lg focus:!border-purple-500"
                            buttonClass="!border-gray-300 !rounded-l-lg !bg-gray-50"
                            dropdownClass="!shadow-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full p-3 md:p-4 border border-gray-300 focus:border-purple-500 outline-none rounded-lg text-sm md:text-base"
                            placeholder="Enter your email address"
                            required
                            name={"email"}
                            value={values.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            containerClass="!w-full"
                            inputClass="!w-full !h-[50px] md:!h-[54px] !pl-[48px] !text-sm md:!text-base !border-gray-300 !rounded-lg focus:!border-purple-500"
                            buttonClass="!border-gray-300 !rounded-l-lg !bg-gray-50"
                            dropdownClass="!shadow-lg"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            Google Address
                            <AttentionTooltip
                              content="Select from Google dropdown"
                              position="top"
                            />
                          </label>
                          <input
                            type="text"
                            ref={ref}
                            className="w-full p-3 md:p-4 border border-gray-300 focus:border-purple-500 outline-none rounded-lg text-sm md:text-base"
                            placeholder="Start typing your address..."
                            required
                            name="address"
                            maxLength={150}
                            title="Start typing your address and select from the Google dropdown"
                            onChange={(e) => {
                              setFieldValue("address", e.currentTarget.value);
                              setFieldValue("latitude", "");
                              setFieldValue("longitude", "");
                              setFieldValue("state", "");
                              setFieldValue("country", "");
                            }}
                            value={values.address}
                          />
                        </div>
                      </div>

                      {/* Coordinates Feedback Block */}
                      {(values.latitude || values.longitude) && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <div>
                            <label className="block text-gray-700 mb-1 text-xs md:text-sm font-medium">
                              Latitude
                            </label>
                            <div className="w-full p-2 bg-white border border-blue-200 rounded text-xs md:text-sm text-gray-600 truncate">
                              {values.latitude || "Not set"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-1 text-xs md:text-sm font-medium">
                              Longitude
                            </label>
                            <div className="w-full p-2 bg-white border border-blue-200 rounded text-xs md:text-sm text-gray-600 truncate">
                              {values.longitude || "Not set"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-blue-600">
                              📍 Coordinates set automatically from Google Places.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          disabled={updateIsPending}
                          type="submit"
                          className="w-full md:w-auto bg-gradient text-white px-8 py-3 rounded-md font-medium transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {updateIsPending ? "Please wait..." : "Update Details"}
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
    </div>
  );
};

export default Settings;