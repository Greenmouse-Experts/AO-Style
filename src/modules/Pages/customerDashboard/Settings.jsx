import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SecuritySettings from "./components/SecuritySettings";
import BankDetails from "./components/BankDetails";

import { useFormik } from "formik";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateProfile from "../../../hooks/settings/useUpdateProfile";
import BankDetailsUpdate from "../tailorDashboard/components/BankDetails";

import { ChevronDown } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import {
  useCountries,
  useStates,
} from "../../../hooks/location/useGetCountries";
import useToast from "../../../hooks/useToast";
import { usePlacesWidget } from "react-google-autocomplete";

const Settings = () => {
  const query = new URLSearchParams(useLocation().search);

  const q = query.get("q");

  const [activeTab, setActiveTab] = useState("personalDetails");
  const [bodyTab, setBodyTab] = useState("upperBody");
  const [activeSection, setActiveSection] = useState(q ?? "Profile");
  const { data: countries, isLoading: loadingCountries } = useCountries();

  const countriesOptions =
    countries?.map((c) => ({ label: c.name, value: c.name })) || [];

  const { carybinUser } = useCarybinUserStore();

  console.log(carybinUser);

  const initialValues = {
    name: carybinUser?.name ?? "",
    email: carybinUser?.email ?? "",
    alternative_phone: carybinUser?.alternative_phone ?? "",
    profile_picture: carybinUser?.profile?.profile_picture ?? null,
    address: carybinUser?.profile?.address ?? "",
    country: carybinUser?.profile?.country ?? "",
    state: carybinUser?.profile?.state ?? "",
    phone: carybinUser?.phone ?? "",
    height: carybinUser?.profile?.measurement?.full_body?.height ?? "",
    height_unit:
      carybinUser?.profile?.measurement?.full_body?.height_unit ?? "cm",
    dress_length:
      carybinUser?.profile?.measurement?.full_body?.dress_length ?? "",
    dress_length_unit:
      carybinUser?.profile?.measurement?.full_body?.dress_length_unit ?? "",
    waist_circumference_lower:
      carybinUser?.profile?.measurement?.lower_body?.waist_circumference ?? "",
    waist_circumference_lower_unit:
      carybinUser?.profile?.measurement?.lower_body?.waist_circumference_unit ??
      "cm",
    hip_circumference:
      carybinUser?.profile?.measurement?.lower_body?.hip_circumference ?? "",
    hip_circumference_unit:
      carybinUser?.profile?.measurement?.lower_body?.hip_circumference_unit ??
      "cm",
    thigh_circumference:
      carybinUser?.profile?.measurement?.lower_body?.thigh_circumference ?? "",
    thigh_circumference_unit:
      carybinUser?.profile?.measurement?.lower_body?.thigh_circumference_unit ??
      "cm",
    knee_circumference:
      carybinUser?.profile?.measurement?.lower_body?.knee_circumference ?? "",
    knee_circumference_unit:
      carybinUser?.profile?.measurement?.lower_body?.knee_circumference_unit ??
      "cm",
    trouser_length:
      carybinUser?.profile?.measurement?.lower_body?.trouser_length ?? "",
    trouser_length_unit:
      carybinUser?.profile?.measurement?.lower_body?.trouser_length_unit ??
      "cm",
    bust_circumference:
      carybinUser?.profile?.measurement?.upper_body?.bust_circumference ?? "",
    bust_circumference_unit:
      carybinUser?.profile?.measurement?.upper_body?.bust_circumference_unit ??
      "cm",
    shoulder_width:
      carybinUser?.profile?.measurement?.upper_body?.shoulder_width ?? "",
    shoulder_width_unit:
      carybinUser?.profile?.measurement?.upper_body?.shoulder_width_unit ??
      "cm",
    armhole_circumference:
      carybinUser?.profile?.measurement?.upper_body?.armhole_circumference ??
      "",
    armhole_circumference_unit:
      carybinUser?.profile?.measurement?.upper_body
        ?.armhole_circumference_unit ?? "cm",
    sleeve_length:
      carybinUser?.profile?.measurement?.upper_body?.sleeve_length ?? "",
    sleeve_length_unit:
      carybinUser?.profile?.measurement?.upper_body?.sleeve_length_unit ?? "cm",
    bicep_circumference:
      carybinUser?.profile?.measurement?.upper_body?.bicep_circumference ?? "",
    bicep_circumference_unit:
      carybinUser?.profile?.measurement?.upper_body?.bicep_circumference_unit ??
      "",
    wrist_circumference:
      carybinUser?.profile?.measurement?.upper_body?.wrist_circumference ?? "",
    wrist_circumference_unit:
      carybinUser?.profile?.measurement?.upper_body?.wrist_circumference_unit ??
      "cm",
    waist_circumference_upper:
      carybinUser?.profile?.measurement?.upper_body?.waist_circumference ?? "",
    waist_circumference_unit_upper:
      carybinUser?.profile?.measurement?.upper_body?.waist_circumference_unit ??
      "",
    latitude: carybinUser?.profile?.coordinates?.latitude ?? "",
    longitude: carybinUser?.profile?.coordinates?.longitude ?? "",
  };

  const { isPending, uploadImageMutate } = useUploadImage();

  const [profileIsLoading, setProfileIsLoading] = useState(false);

  const { isPending: updateIsPending, updatePersonalMutate } =
    useUpdateProfile();

  const { toastError, toastSuccess } = useToast();

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
      console.log("Form submission values:", val);
      console.log("Coordinates being sent:", {
        latitude: val.latitude,
        longitude: val.longitude,
        hasCoordinates: !!(val.latitude && val.longitude),
      });
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      updatePersonalMutate(
        {
          ...val,
          alternative_phone: val.alternative_phone,
          phone: val.phone,
          measurement: {
            upper_body: {
              ...(val?.bust_circumference && {
                bust_circumference: val?.bust_circumference,
                bust_circumference_unit: val?.bust_circumference_unit,
              }),
              shoulder_width: val?.shoulder_width,
              shoulder_width_unit: val?.bust_circumference_unit,
              armhole_circumference: val?.armhole_circumference,
              armhole_circumference_unit: val?.bust_circumference_unit,
              sleeve_length: val?.sleeve_length,
              sleeve_length_unit: val?.bust_circumference_unit,
              bicep_circumference: val?.bicep_circumference,
              bicep_circumference_unit: val?.bust_circumference_unit,
              wrist_circumference: val?.wrist_circumference, // ← ADD THIS
              wrist_circumference_unit: val?.wrist_circumference_unit, // ← ADD THIS
              waist_circumference: val?.waist_circumference_upper,
              waist_circumference_unit: val?.bust_circumference_unit,
            },
            lower_body: {
              waist_circumference: val?.waist_circumference_lower,
              waist_circumference_unit: val?.bust_circumference_unit,
              hip_circumference: val?.hip_circumference,
              hip_circumference_unit: val?.bust_circumference_unit,
              thigh_circumference: val?.thigh_circumference,
              thigh_circumference_unit: val?.bust_circumference_unit,
              knee_circumference: val?.knee_circumference,
              knee_circumference_unit: val?.bust_circumference_unit,
              trouser_length: val?.trouser_length,
              trouser_length_unit: val?.bust_circumference_unit,
            },
            full_body: {
              height: val?.height,
              height_unit: val?.bust_circumference_unit,
              dress_length: val?.dress_length,
              dress_length_unit: val?.bust_circumference_unit,
            },
          },
          coordinates: {
            longitude: val.longitude,
            latitude: val.latitude,
          },
        },
        {
          onSuccess: () => {
            // Auto-navigate to next body measurement tab
            if (bodyTab === "upperBody") {
              setBodyTab("lowerBody");
            } else if (bodyTab === "lowerBody") {
              setBodyTab("fullBody");
            } else if (bodyTab === "fullBody") {
              toastSuccess("Full body measurements updated successfully!");
            } else {
              toastSuccess("Profile updated successfully!");
              console.log("Profile updated successfully!");
            }
          },
        },
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
                toastSuccess("Profile picture updated successfully!");
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
      console.log("🗺️ Google Place Selected:", place);
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      console.log("📍 Setting coordinates from Google Places:", { lat, lng });

      // Extract state and country from address components
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

      console.log("🌍 Extracted location data:", { state, country });

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
            {["Profile", "Security"].map((item) => (
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

                    {/* Mobile responsive grid - single column on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          onChange={(value, data) => {
                            // Ensure Nigeria always uses +234
                            if (data.countryCode === "ng") {
                              // If user is typing after +234, keep their input
                              if (value && value.startsWith("+234")) {
                                setFieldValue("phone", value);
                              } else {
                                // Default to +234 for Nigeria
                                setFieldValue("phone", value);
                              }
                            } else {
                              // For other countries, handle normally
                              const formattedValue = value.startsWith("+")
                                ? value
                                : "+" + value;
                              setFieldValue("phone", formattedValue);
                            }
                          }}
                          onCountryChange={(countryCode) => {
                            // Force +234 when Nigeria is selected
                            if (countryCode === "ng") {
                              setFieldValue("phone", "+234");
                            }
                          }}
                          defaultCountry="ng"
                          onlyCountries={["ng"]}
                          containerClass="w-full disabled:bg-gray-100"
                          dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                          buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                          inputClass="!w-full px-4 font-sans disabled:bg-gray-100 !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                    {/* Mobile responsive grid - single column on mobile */}
                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                          onChange={(value, data) => {
                            // Ensure Nigeria always uses +234
                            if (data.countryCode === "ng") {
                              // If user is typing after +234, keep their input
                              if (value && value.startsWith("+234")) {
                                setFieldValue("phone", value);
                              } else {
                                // Default to +234 for Nigeria
                                setFieldValue("phone", value);
                              }
                            } else {
                              // For other countries, handle normally
                              const formattedValue = value.startsWith("+")
                                ? value
                                : "+" + value;
                              setFieldValue("phone", formattedValue);
                            }
                          }}
                          onCountryChange={(countryCode) => {
                            // Force +234 when Nigeria is selected
                            if (countryCode === "ng") {
                              setFieldValue("phone", "+234");
                            }
                          }}
                          defaultCountry="ng"
                          onlyCountries={["ng"]}
                          containerClass="w-full disabled:bg-gray-100"
                          dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                          buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                          inputClass="!w-full px-4 font-sans disabled:bg-gray-100 !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    </div>*/}

                    {/* Coordinates Display - Improved overflow handling */}
                    {(values.latitude || values.longitude) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div>
                          <label className="block text-gray-700 mb-2 text-sm font-medium">
                            Latitude
                          </label>
                          <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600 overflow-hidden">
                            <span className="break-all">
                              {values.latitude || "Not set"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 text-sm font-medium">
                            Longitude
                          </label>
                          <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600 overflow-hidden">
                            <span className="break-all">
                              {values.longitude || "Not set"}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1 lg:col-span-2">
                          <p className="text-xs text-blue-600">
                            📍 These coordinates are automatically set when you
                            select an address using Google Places autocomplete
                            above.
                          </p>
                        </div>
                      </div>
                    )}

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
                    <div className="border-b-4 border-[#D9D9D9] flex space-x-6 lg:space-x-10 text-gray-500 overflow-x-auto">
                      <button
                        className={`pb-2 whitespace-nowrap ${
                          bodyTab === "upperBody"
                            ? "border-b-1 border-purple-600 text-purple-600"
                            : ""
                        }`}
                        onClick={() => setBodyTab("upperBody")}
                      >
                        Upper Body
                      </button>
                      <button
                        className={`pb-2 whitespace-nowrap ${
                          bodyTab === "lowerBody"
                            ? "border-b-1 border-purple-600 text-purple-600"
                            : ""
                        }`}
                        onClick={() => setBodyTab("lowerBody")}
                      >
                        Lower Body
                      </button>
                      <button
                        className={`pb-2 whitespace-nowrap ${
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
                      <form
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8"
                        onSubmit={handleSubmit}
                      >
                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Bust Circumference [female]"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={
                                "Enter the circumference of your bust"
                              }
                              name={"bust_circumference"}
                              // required
                              value={values.bust_circumference}
                              onChange={handleChange}
                              className="flex-1 w-full appearance-none p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Shoulder Width"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter the width of your shoulder"}
                              name={"shoulder_width"}
                              required
                              value={values.shoulder_width}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Armhole Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={
                                "Enter the circumference of your armhole"
                              }
                              name={"armhole_circumference"}
                              required
                              value={values.armhole_circumference}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Sleeve Length"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter the length of your sleeve"}
                              name={"sleeve_length"}
                              required
                              value={values.sleeve_length}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Bicep Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={
                                "Enter the circumference of your bicep"
                              }
                              name={"bicep_circumference"}
                              required
                              value={values.bicep_circumference}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Wrist Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={
                                "Enter the circumference of your wrist"
                              }
                              name={"wrist_circumference"} // ← CHANGED
                              required
                              value={values.wrist_circumference} // ← CHANGED
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"wrist_circumference_unit"} // ← CHANGED
                                value={values.wrist_circumference_unit} // ← CHANGED
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1 lg:col-span-2">
                          <button
                            disabled={updateIsPending}
                            type="submit"
                            className="w-full lg:w-auto mt-4 bg-gradient text-white px-6 py-2 rounded-md"
                          >
                            {updateIsPending
                              ? "Please wait..."
                              : "Update Upper Body"}
                          </button>
                        </div>
                      </form>
                    )}
                    {bodyTab === "lowerBody" && (
                      <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"
                      >
                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Waist Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your waist measurement"}
                              name={"waist_circumference_lower"}
                              required
                              value={values.waist_circumference_lower}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Hip Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your hip measurement"}
                              name={"hip_circumference"}
                              required
                              value={values.hip_circumference}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Thigh Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your thigh measurement"}
                              name={"thigh_circumference"}
                              required
                              value={values.thigh_circumference}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Knee Circumference"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your knee measurement"}
                              name={"knee_circumference"}
                              required
                              value={values.knee_circumference}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-gray-700 mb-4">
                            {"Trouser Length (Waist to Ankle)"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your trouser length"}
                              name={"trouser_length"}
                              required
                              value={values.trouser_length}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 flex flex-col lg:flex-row justify-between gap-4 mt-2">
                          <button
                            disabled={updateIsPending}
                            type="submit"
                            className="w-full lg:w-auto bg-gradient text-white px-6 py-2 rounded-md"
                          >
                            {updateIsPending
                              ? "Please wait..."
                              : " Update Lower Body"}
                          </button>
                        </div>
                      </form>
                    )}
                    {bodyTab === "fullBody" && (
                      <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"
                      >
                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Height"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your height"}
                              name={"height"}
                              required
                              value={values.height}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-4">
                            {"Dress/Gown Length"}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={"Enter your desired length"}
                              name={"dress_length"}
                              required
                              value={values.dress_length}
                              onChange={handleChange}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                name={"bust_circumference_unit"}
                                value={values.bust_circumference_unit}
                                onChange={handleChange}
                              >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                                <option value="m">m</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-2 flex flex-col lg:flex-row justify-between gap-4 mt-2">
                          <button
                            disabled={updateIsPending}
                            type="submit"
                            className="w-full lg:w-auto bg-gradient text-white px-6 py-2 rounded-md"
                          >
                            {updateIsPending
                              ? "Please wait..."
                              : "Update Full Body"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "Security" && (
            <div>
              <SecuritySettings />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
