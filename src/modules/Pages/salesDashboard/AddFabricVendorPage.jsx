import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import Select from "react-select";

import { nigeriaStates } from "../../../constant";
import { countryCodes } from "../../../constant";

import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useToast from "../../../hooks/useToast";
import PhoneInput from "react-phone-input-2";
import useAddFabricVendor from "../../../hooks/marketRep/useAddFabricVendor";
// import { usePlacesWidget } from "react-google-autocomplete";
import CustomLocationInput from "../../../components/customLocationInput";
import CustomBackbtn from "../../../components/CustomBackBtn";
import { useLoadScript } from "@react-google-maps/api";

/**
 * If the user navigates between tabs (steps), previously entered address/location fields are now *retained* and Google Autocomplete remains functional.
 * Uses input refs and manual value management for Google Autocomplete fields.
 * Address/Location state is kept within Formik values, and input values are always *controlled* from Formik's state.
 *
 * Google Autocomplete ref is managed with useRef for stability on input re-mount.
 */

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  business_name: "",
  gender: "",
  phoneCode: "+234",
  phone: "",
  tags: [],
  price: "",
  weight_per_unit: "",
  local_name: "",
  manufacturer_name: "",
  material_type: "",
  alternative_names: "",
  fabric_texture: "",
  feel_a_like: "",
  quantity: "",
  minimum_yards: "",
  available_colors: "",
  fabric_colors: "",
  photos: [],
  video_url: "",
  original_price: "",
  sku: "",
  multimedia_url: "",
  address: "",
  location: "",
  business_type: "",
  business_registration_number: "",
  city: "",
  country: "",
  state: "",
  latitude: "",
  longitude: "",
  business_country: "",
  business_state: "",
  business_city: "",
  business_latitude: "",
  business_longitude: "",
  doc_front: "",
  doc_back: "",
  utility_doc: "",
  id_type: "",
};

export default function AddFabricVendorPage() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const libraries = ["places"];

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBstumBKZoQNTHm3Y865tWEHkkFnNiHGGE", // Replace with your API key
    libraries,
  });

  // For plain country code options list
  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

  // Handle file upload
  const {
    isPending: uploadPictureIsPending,
    uploadImageMutate: uploadPictureMutate,
  } = useUploadImage();
  const {
    isPending: uploadFrontIsPending,
    uploadImageMutate: uploadFrontMutate,
  } = useUploadImage();
  const {
    isPending: uploadBackIsPending,
    uploadImageMutate: uploadBackMutate,
  } = useUploadImage();
  const {
    isPending: uploadUtilityIsPending,
    uploadImageMutate: uploadUtilityMutate,
  } = useUploadImage();

  const { toastError } = useToast();
  const navigate = useNavigate();

  const { isPending, addMarketRepFabricVendorMutate } = useAddFabricVendor();

  const isExact = currentPath === "/sales/add-fashion-designers";

  // KEEP text input refs for Google Autocomplete (so re-mount doesn't break autocomplete);
  // These refs are just for wiring Google Autocomplete to a controlled input.
  const addressInputRef = useRef(null);

  // Google Places API loader (manual binding to ref, so it's not re-initialized on re-mount)
  const applyGoogleAutocomplete = (inputRef, cb) => {
    if (!window.google || !inputRef?.current) return;
    // Prevent double-initialization
    if (inputRef.current.__autocomplete) return;
     
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: "ng" },
        types: [],
      },
    );
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      cb(place);
    });
    inputRef.current.__autocomplete = autocomplete;
  };

  // Needed for extracting address fields from google place object
  function getAddressComponent(components, type) {
    if (!Array.isArray(components)) return "";
    const component = components.find((c) => c.types.includes(type));
    return component?.long_name || "";
  }

  // Formik
  const { handleSubmit, setFieldValue, values, handleChange } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      const phoneno = `${val.phone}`;
      if (step === 1) {
        if (values.confirmPassword !== values.password) {
          return toastError("Password must match");
        }
        setStep(2);
      }
      if (step === 2) setStep(3);
      if (step === 3) {
        const payload = {
          role: isExact ? "fashion-designer" : "fabric-vendor",
          profile: {
            name: val?.name,
            email: val?.email,
            password: val?.password,
            phone: phoneno,
            profile_picture: val?.profile_picture,
            bio: "",
            date_of_birth: "",
            gender: val?.gender,
            address: val.address,
            state: val.state,
            coordinates: {
              latitude: val?.business_latitude || val?.latitude || "",
              longitude: val?.business_longitude || val?.longitude || "",
            },
          },
          business: {
            business_name: val?.business_name,
            business_type: val?.business_type,
            location: val?.location,
            country: val?.business_country || val?.country,
            state: val?.business_state || val?.state,
            // coordinates: {
            //   latitude: val?.business_latitude || val?.latitude || "",
            //   longitude: val?.business_longitude || val?.longitude || "",
            // },
          },
          kyc: {
            doc_front: val?.doc_front,
            doc_back: val?.doc_back,
            utility_doc: val?.utility_doc,
            location: val?.location,
            state: val?.state,
            city: val?.city,
            country: val?.country,
            id_type: val?.id_type,
          },
        };
        console.log(
          "Here is the uload payload for market rep adding dabroc vendor",
          payload,
        );
        addMarketRepFabricVendorMutate(payload, {
          onSuccess: () => {
            navigate(-1);
          },
        });
      }
    },
  });

  // Initialize Google Autocomplete on the address field (personal tab)
  // Use effect on mount & value change to re-sync Formik and input/UI
  useEffect(() => {
    if (!isLoaded || !addressInputRef.current) return;

    if (step === 1) {
      applyGoogleAutocomplete(addressInputRef, (place) => {
        const components = place.address_components || [];
        console.log("🗺️ Google Place selected:", place);

        // Set formatted address
        setFieldValue("address", place.formatted_address || "");

        // Extract and set coordinates
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          console.log("📍 Coordinates extracted:", { lat, lng });
          setFieldValue("latitude", lat.toString());
          setFieldValue("longitude", lng.toString());
        }

        // Extract and set address components
        const state = getAddressComponent(
          components,
          "administrative_area_level_1",
        );
        const city =
          getAddressComponent(components, "locality") ||
          getAddressComponent(components, "administrative_area_level_2");
        const country = getAddressComponent(components, "country");

        console.log("🏘️ Address components extracted:", {
          state,
          city,
          country,
        });

        if (state) setFieldValue("state", state);
        if (city) setFieldValue("city", city);
        if (country) setFieldValue("country", country);
      });

      if (addressInputRef.current) {
        addressInputRef.current.value = values.address || "";
      }
    }
  }, [step, isLoaded, setFieldValue, values.address]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <svg
          className="animate-spin h-10 w-10 text-[#A14DF6]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="">
      <CustomBackbtn />
      <div className="bg-white px-6 py-4 mb-6 relative">
        <h1 className="text-2xl font-medium mb-3">
          Add {isExact ? "Add Tailor/Fashion Designers" : "Fabric Vendor"}
        </h1>
        <p className="text-gray-500">
          <Link to="/sales" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; {isExact ? "Fashion Designers" : "Fabric Vendors"} &gt; Add
          {isExact ? "Fashion Designers" : "Fabric Vendors"}{" "}
        </p>
      </div>
      {/* Tabs Section */}
      <div className="mt-6 bg-white p-4 rounded-md">
        <div className="flex pb-2 text-sm font-medium">
          {["Personal Info", "Business Info", "KYC"].map((tab, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setStep(index + 1)}
              className={`w-1/3 text-center pb-2 ${
                step === index + 1
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {step === 1 && (
            <div className="p-4">
              <label className="block text-gray-600 font-medium mb-4">
                Profile Picture
              </label>
              <div
                onClick={() => document.getElementById("profile").click()}
                className="border border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center"
              >
                <Upload size={30} className="text-gray-400" />
                <p className="cursor-pointer text-gray-500 mt-2">
                  {"Upload profile picture"}
                </p>
                <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  className="mt-2 w-full hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      if (e.target.files[0].size > 5 * 1024 * 1024) {
                        alert("File size exceeds 5MB limit");
                        return;
                      }
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("image", file);
                      uploadPictureMutate(formData, {
                        onSuccess: (data) => {
                          setFieldValue(
                            "profile_picture",
                            data?.data?.data?.url,
                          );
                        },
                      });
                      e.target.value = "";
                    }
                  }}
                />
                {uploadPictureIsPending ? (
                  <p className="cursor-pointer text-gray-400">
                    please wait...{" "}
                  </p>
                ) : values.profile_picture ? (
                  <a
                    onClick={(e) => e.stopPropagation()}
                    href={values.profile_picture}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                  >
                    View picture upload
                  </a>
                ) : (
                  <></>
                )}
              </div>
              {/* Full Name & Email */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-600 font-medium mb-4">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter the vendor full name"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-600 font-medium mb-4">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    required
                    onChange={handleChange}
                    placeholder="Enter the vendor email address"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
              </div>
              {/* Password & Confirm Password */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2 relative">
                  <label className="block text-gray-600 font-medium mb-4">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    required
                    onChange={handleChange}
                    placeholder="Enter the vendor password"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-10 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="w-full sm:w-1/2 relative">
                  <label className="block text-gray-600 font-medium mb-4">
                    Confirm Password
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={values.confirmPassword}
                    required
                    onChange={handleChange}
                    placeholder="Re-enter the vendor password"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-10 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full relative mt-4">
                <label className="block text-gray-600 font-medium mb-4">
                  Address
                </label>
                {/* Google Autocomplete manual, keep the value in Formik & always display current value */}
                <input
                  ref={addressInputRef}
                  value={values.address}
                  placeholder="address here"
                  name="address"
                  type="text"
                  onChange={(e) => {
                    setFieldValue("address", e.currentTarget.value);
                  }}
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  autoComplete="off"
                />

                {/* Debug display for coordinates and state */}
                {(values.latitude || values.longitude || values.state) && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      🗺️ Captured Location Data:
                    </p>
                    {values.state && (
                      <p className="text-xs text-blue-700">
                        State: {values.state}
                      </p>
                    )}
                    {values.city && (
                      <p className="text-xs text-blue-700">
                        City: {values.city}
                      </p>
                    )}
                    {values.latitude && values.longitude && (
                      <p className="text-xs text-blue-700">
                        Coordinates: {values.latitude}, {values.longitude}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                disabled={uploadPictureIsPending}
                type="submit"
                className="mt-6 cursor-pointer w-full bg-[#A14DF6] text-white py-3 cursor-pointer rounded-md"
              >
                Proceed to Business Info
              </button>
            </div>
          )}
          {/* Business Info Section */}
          {step === 2 && (
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Business Information</h2>
              {/* Business Name & Registration Number */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-gray-600 font-medium mb-4">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={values.business_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter the vendor business name"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-gray-600 font-medium mb-4">
                    Business Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="business_registration_number"
                    value={values.business_registration_number}
                    onChange={handleChange}
                    placeholder="Enter your business registration number"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>
              </div>
              {/* Phone Number & Market Location */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="w-full relative">
                  <label className="block text-gray-600 font-medium mb-4">
                    Phone Number
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 ">
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
                      containerClass="w-full disabled:bg-gray-100"
                      dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                      buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                      inputClass="!w-full px-4 font-sans disabled:bg-gray-100  !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* Business Address */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                <div className="mt-4 w-full">
                  <label className="block text-gray-700 mb-3">
                    Business Type
                  </label>
                  <select
                    name={"business_type"}
                    value={values.business_type}
                    onChange={handleChange}
                    className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg text-gray-500"
                    required
                  >
                    <option value="" disabled>
                      Select your business type
                    </option>
                    <option value="sole-proprietorship">
                      Sole Proprietorship
                    </option>
                    <option value="partnership">Partnership</option>
                    <option value="llc">Limited Liability Company (LLC)</option>
                    <option value="corporation">
                      Corporation (C Corp & S Corp)
                    </option>
                    <option value="nonprofit">Nonprofit Organization</option>
                    <option value="franchise">Franchise</option>
                  </select>
                </div>
                <div className="mt-3 w-full">
                  <CustomLocationInput
                    setFieldValue={setFieldValue}
                    value={values.location}
                  />

                  {/* Debug display for business coordinates */}
                  {(values.business_latitude ||
                    values.business_longitude ||
                    values.business_state) && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium mb-1">
                        🏢 Business Location Data:
                      </p>
                      {values.business_state && (
                        <p className="text-xs text-green-700">
                          Business State: {values.business_state}
                        </p>
                      )}
                      {values.business_city && (
                        <p className="text-xs text-green-700">
                          Business City: {values.business_city}
                        </p>
                      )}
                      {values.business_latitude &&
                        values.business_longitude && (
                          <p className="text-xs text-green-700">
                            Business Coordinates: {values.business_latitude},{" "}
                            {values.business_longitude}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>
              {/* City & State Dropdowns */}
              <div className="mt-2 mb-4">
                <p className="text-sm text-gray-500">
                  💡 To update Country or State, please update the Business Address field above.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                <div className="w-full">
                  <label className="block text-gray-700 mb-2">
                    Country
                  </label>
                  <Select
                    options={[{ value: "Nigeria", label: "Nigeria" }]}
                    name="country"
                    value={
                      [{ value: "Nigeria", label: "Nigeria" }]?.find(
                        (opt) => opt.value === values.country,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setFieldValue("country", selectedOption.value)
                    }
                    placeholder="Select"
                    className="p-2 w-full mb-6 border border-[#CCCCCC] outline-none rounded-lg"
                    isDisabled={true}
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "none",
                        boxShadow: "none",
                        outline: "none",
                        backgroundColor: "#fff",
                        "&:hover": { border: "none" },
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />{" "}
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 mb-2">
                    State
                  </label>
                  <Select
                    options={nigeriaStates}
                    name="state"
                    value={(() => {
                      // Try exact match first
                      let match = nigeriaStates?.find(
                        (opt) => opt.value === values.state,
                      );
                      
                      // If no exact match, try case-insensitive match
                      if (!match && values.state) {
                        match = nigeriaStates?.find(
                          (opt) => opt.value.toLowerCase() === values.state.toLowerCase() ||
                                   opt.label.toLowerCase() === values.state.toLowerCase() ||
                                   opt.value.toLowerCase().includes(values.state.toLowerCase()) ||
                                   values.state.toLowerCase().includes(opt.value.toLowerCase().replace(" state", ""))
                        );
                      }
                      
                      // If still no match but we have a value, create an option for it
                      if (!match && values.state) {
                        return { label: values.state, value: values.state };
                      }
                      
                      return match || null;
                    })()}
                    onChange={(selectedOption) =>
                      setFieldValue("state", selectedOption.value)
                    }
                    placeholder="Select"
                    className="p-2 w-full mb-6 border border-[#CCCCCC] outline-none rounded-lg"
                    isDisabled={true}
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "none",
                        boxShadow: "none",
                        outline: "none",
                        backgroundColor: "#fff",
                        "&:hover": { border: "none" },
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />{" "}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                <div className=" w-full">
                  <label className="block text-gray-600 font-medium mb-4">
                    Business city
                  </label>
                  <input
                    type="text"
                    name={"city"}
                    value={values.city}
                    onChange={handleChange}
                    placeholder="Enter your business city"
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-gray-700 mb-4">Gender</label>
                  <Select
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Unisex", value: "unisex" },
                    ]}
                    name="gender"
                    isSearchable={false}
                    value={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Unisex", value: "unisex" },
                    ]?.find((opt) => opt.value === values.gender)}
                    onChange={(selectedOption) => {
                      setFieldValue("gender", selectedOption.value);
                    }}
                    required
                    placeholder="Choose suitability gender"
                    className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "none",
                        boxShadow: "none",
                        outline: "none",
                        backgroundColor: "#fff",
                        "&:hover": { border: "none" },
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />{" "}
                </div>
              </div>
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-300 cursor-pointer text-gray-700 px-6 py-3 rounded-md"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-gradient cursor-pointer text-white px-6 py-3 rounded-md"
                >
                  Proceed to KYC
                </button>
              </div>
            </div>
          )}
          {/* KYC Section */}
          {step === 3 && (
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">KYC Verification</h2>
              {/* ID Upload */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-4">
                  National ID / Driver’s License / Passport
                </label>
                <div>
                  <label className="block mb-2 text-gray-700">ID Type</label>
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
                    ]?.find((opt) => opt.value === values.id_type)}
                    onChange={(selectedOption) => {
                      setFieldValue("id_type", selectedOption.value);
                    }}
                    isSearchable={false}
                    required
                    placeholder="Select"
                    className="w-full p-2 border border-gray-300 rounded-md mb-6"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "none",
                        boxShadow: "none",
                        outline: "none",
                        backgroundColor: "#fff",
                        "&:hover": { border: "none" },
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />{" "}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div
                    onClick={() => document.getElementById("doc_front").click()}
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
                  >
                    <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                      <span>⬆️</span> <span>Upload Front</span>
                    </p>
                    <input
                      type="file"
                      name="doc_front"
                      onChange={(e) => {
                        if (e.target.files) {
                          if (e.target.files[0].size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit");
                            return;
                          }
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append("image", file);
                          uploadFrontMutate(formData, {
                            onSuccess: (data) => {
                              setFieldValue("doc_front", data?.data?.data?.url);
                            },
                          });
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                      id="doc_front"
                    />
                    {uploadFrontIsPending ? (
                      <p className="cursor-pointer text-gray-400">
                        please wait...{" "}
                      </p>
                    ) : values.doc_front ? (
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={values.doc_front}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    ) : null}
                  </div>
                  <div
                    onClick={() => document.getElementById("doc_back").click()}
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
                  >
                    <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                      <span>⬆️</span> <span>Upload Back</span>
                    </p>
                    <input
                      type="file"
                      name="doc_back"
                      onChange={(e) => {
                        if (e.target.files) {
                          if (e.target.files[0].size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit");
                            return;
                          }
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append("image", file);
                          uploadBackMutate(formData, {
                            onSuccess: (data) => {
                              setFieldValue("doc_back", data?.data?.data?.url);
                            },
                          });
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                      id="doc_back"
                    />
                    {uploadBackIsPending ? (
                      <p className="cursor-pointer text-gray-400">
                        please wait...{" "}
                      </p>
                    ) : values.doc_back ? (
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={values.doc_back}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* Utility Bill Upload */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-4">
                  Utility Bill (Proof of Address)
                </label>
                <div
                  onClick={() => document.getElementById("utility_doc").click()}
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
                >
                  <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                    <span>⬆️</span> <span>Upload Utility Bill</span>
                  </p>
                  <input
                    type="file"
                    name="utility_doc"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        uploadUtilityMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValue("utility_doc", data?.data?.data?.url);
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                    id="utility_doc"
                  />
                  {uploadUtilityIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.utility_doc ? (
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={values.utility_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                    >
                      View file upload
                    </a>
                  ) : null}
                </div>
              </div>
              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-300 cursor-pointer text-gray-700 px-6 py-3 rounded-md w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  disabled={
                    isPending ||
                    uploadFrontIsPending ||
                    uploadBackIsPending ||
                    uploadUtilityIsPending
                  }
                  type="submit"
                  className="bg-gradient cursor-pointer text-white px-6 py-3 rounded-md w-full sm:w-auto"
                >
                  {isPending ? "Please wait..." : " Submit"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
