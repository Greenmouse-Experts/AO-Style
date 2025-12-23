import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SecuritySettings from "./components/SecuritySettings";
import BankDetails from "./components/BankDetails";
import KYCVerification from "./components/KYCVerification";
import { useFormik } from "formik";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateProfile from "../../../hooks/settings/useUpdateProfile";
import { removeStateSuffix } from "../../../lib/helper";
import { useCarybinAdminUserStore } from "../../../store/carybinAdminUserStore";
import PhoneInput from "react-phone-input-2";
import {
  useCountries,
  useStates,
} from "../../../hooks/location/useGetCountries";
import Select from "react-select";
import useGetDelivery from "../../../hooks/delivery/useGetDeliverySettings";
import useAddDelivery from "../../../hooks/delivery/useAddDelivery";
import useUpdateDelivery from "../../../hooks/delivery/useUpdateDelivery";
import useToast from "../../../hooks/useToast";
import { usePlacesWidget } from "react-google-autocomplete";
import ChargeCommision from "./charge/ChargeCommision";
import { AttentionTooltip } from "../../../components/ui/Tooltip";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("personalDetails");
  const [activeSection, setActiveSection] = useState("Profile");

  const { toastError } = useToast();

  const { carybinAdminUser } = useCarybinAdminUserStore();
  console.log("Admin User Data in Settings:", carybinAdminUser);
  console.log("Admin Profile:", carybinAdminUser?.profile);
  console.log("Admin Name:", carybinAdminUser?.name);
  console.log("Admin Email:", carybinAdminUser?.email);
  console.log("📞 Admin Phone Data:", carybinAdminUser?.phone);
  console.log(
    "📞 Admin Alternative Phone Data:",
    carybinAdminUser?.alternative_phone,
  );
  console.log("📞 Profile Phone Data:", carybinAdminUser?.profile?.phone);
  console.log(
    "📞 Profile Alternative Phone Data:",
    carybinAdminUser?.profile?.alternative_phone,
  );
  console.log(
    "🔍 Full Admin Object Keys:",
    Object.keys(carybinAdminUser || {}),
  );
  console.log(
    "🔍 Profile Object Keys:",
    Object.keys(carybinAdminUser?.profile || {}),
  );
  // Extract phone data with multiple fallback checks
  const extractPhoneData = () => {
    const adminData = carybinAdminUser;
    if (!adminData) return { phone: "", alternative_phone: "" };

    // Check if phone data is in profile object
    const profilePhone = adminData?.profile?.phone;
    const profileAltPhone = adminData?.profile?.alternative_phone;

    // Check if phone data is at root level
    const rootPhone = adminData?.phone;
    const rootAltPhone = adminData?.alternative_phone;

    console.log("🔍 Phone extraction debug:", {
      profilePhone,
      profileAltPhone,
      rootPhone,
      rootAltPhone,
    });

    // For admin users, the backend stores the primary phone in alternative_phone field
    // So we need to swap them to display correctly in the form
    return {
      phone: profileAltPhone || rootAltPhone || "",
      alternative_phone: profilePhone || rootPhone || "",
    };
  };

  const phoneData = extractPhoneData();

  const initialValues = {
    name: carybinAdminUser?.name ?? "",
    email: carybinAdminUser?.email ?? "",
    profile_picture: carybinAdminUser?.profile?.profile_picture ?? null,
    address: carybinAdminUser?.profile?.address ?? "",
    country: carybinAdminUser?.profile?.country ?? "",
    state: carybinAdminUser?.profile?.state ?? "",
    phone: phoneData.phone,
    alternative_phone: phoneData.alternative_phone,
    latitude: carybinAdminUser?.profile?.latitude ?? "",
    longitude: carybinAdminUser?.profile?.longitude ?? "",
  };

  const [profileIsLoading, setProfileIsLoading] = useState(false);

  const { isPending, uploadImageMutate } = useUploadImage();

  const { isPending: updateIsPending, updatePersonalMutate } =
    useUpdateProfile();

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
      console.log("🔍 Admin Settings Form Values:", val);
      console.log("📍 Coordinates being sent:", {
        latitude: val.latitude,
        longitude: val.longitude,
      });
      console.log("🔍 Missing Values Check:");
      console.log("  - Phone:", val.phone);
      console.log("  - Alternative Phone:", val.alternative_phone);
      console.log("  - State:", val.state);
      console.log("  - Country:", val.country);
      console.log("  - Latitude:", val.latitude);
      console.log("  - Longitude:", val.longitude);
      console.log("🗃️ Admin User Profile Data:", carybinAdminUser?.profile);

      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      // Remove "State" suffix if present before sending to backend
      const cleanedState = removeStateSuffix(val.state || carybinAdminUser?.profile?.state || "");
      
      // Filter data to match backend API structure
      const filteredData = {
        name: val.name,
        profile_picture: val.profile_picture,
        address: val.address,
        phone: val.phone || "",
        alternative_phone: val.alternative_phone || "",
        state: cleanedState || "",
        country: val.country || carybinAdminUser?.profile?.country || "",
        coordinates: {
          longitude:
            val.longitude && val.longitude !== ""
              ? val.longitude
              : carybinAdminUser?.profile?.longitude || "",
          latitude:
            val.latitude && val.latitude !== ""
              ? val.latitude
              : carybinAdminUser?.profile?.latitude || "",
        },
      };

      console.log("🚀 Filtered data being sent to backend:", filteredData);
      console.log(
        "📦 EXACT BODY BEING SENT TO BACKEND:",
        JSON.stringify(filteredData, null, 2),
      );

      updatePersonalMutate(filteredData, {
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
            },
          );
        },
      });
      e.target.value = "";
    }
  };

  const { data: countries, isLoading: loadingCountries, isError: countriesError } = useCountries();

  // Store Google Places values separately
  const [googleCountry, setGoogleCountry] = useState("");
  const [googleState, setGoogleState] = useState("");

  // Merge API countries with Google Places country if it exists
  const countriesOptions = useMemo(() => {
    const apiCountries = countries?.map((c) => ({ label: c.name, value: c.name })) || [];
    
    // If we have a Google Places country that's not in the API list, add it
    if (googleCountry && !apiCountries.find(c => c.value.toLowerCase() === googleCountry.toLowerCase())) {
      return [...apiCountries, { label: googleCountry, value: googleCountry }];
    }
    
    return apiCountries;
  }, [countries, googleCountry]);

  const { data: states, isLoading: loadingStates, isError: statesError } = useStates(values.country);

  // Merge API states with Google Places state if it exists
  const statesOptions = useMemo(() => {
    const apiStates = states?.map((c) => ({ label: c.name, value: c.name })) || [];
    
    // If we have a Google Places state that's not in the API list, add it
    if (googleState && !apiStates.find(s => s.value.toLowerCase() === googleState.toLowerCase())) {
      return [...apiStates, { label: googleState, value: googleState }];
    }
    
    return apiStates;
  }, [states, googleState]);

  // Helper function to find matching option (case-insensitive, handles variations)
  const findMatchingOption = (options, searchValue) => {
    if (!searchValue || !options || options.length === 0) {
      return null;
    }
    
    const normalizedSearch = searchValue.toLowerCase().trim();
    
    // Try exact match first
    let match = options.find(
      (option) =>
        option.value?.toLowerCase().trim() === normalizedSearch ||
        option.label?.toLowerCase().trim() === normalizedSearch
    );
    
    // If no exact match, try partial match (contains)
    if (!match) {
      match = options.find(
        (option) =>
          option.value?.toLowerCase().includes(normalizedSearch) ||
          option.label?.toLowerCase().includes(normalizedSearch) ||
          normalizedSearch.includes(option.value?.toLowerCase()) ||
          normalizedSearch.includes(option.label?.toLowerCase())
      );
    }
    
    return match || null;
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const { data } = useGetDelivery();

  const [delivery, setDelivery] = useState(undefined);

  useEffect(() => {
    if (data?.data?.data?.price_per_km) {
      setDelivery(data?.data?.data?.price_per_km);
    } else {
      setDelivery(undefined);
    }
  }, [data?.data?.data?.price_per_km]);

  // Match country value when countries are loaded (for Google Places autofill)
  useEffect(() => {
    if (values.country && countriesOptions.length > 0) {
      const matchedCountry = findMatchingOption(countriesOptions, values.country);
      if (matchedCountry) {
        if (matchedCountry.value !== values.country) {
          console.log("🔄 Matching country value:", values.country, "->", matchedCountry.value);
          setFieldValue("country", matchedCountry.value);
        } else {
          console.log("✅ Country already correctly set:", values.country);
        }
      } else {
        console.warn("⚠️ Country not found in options. Value:", values.country, "Available options:", countriesOptions.slice(0, 5).map(c => c.value));
      }
    }
  }, [countriesOptions, values.country, setFieldValue]);

  // Match state value when states are loaded (for Google Places autofill)
  useEffect(() => {
    if (values.state && statesOptions.length > 0 && values.country) {
      const matchedState = findMatchingOption(statesOptions, values.state);
      if (matchedState) {
        // Update if the matched value is different from current value
        if (matchedState.value !== values.state) {
          console.log("🔄 Matching state value:", values.state, "->", matchedState.value);
          setFieldValue("state", matchedState.value);
        } else {
          console.log("✅ State already matched:", values.state);
        }
      } else {
        console.warn("⚠️ State not found in options:", values.state, "Available:", statesOptions.map(s => s.value));
      }
    }
  }, [statesOptions, values.state, values.country, setFieldValue]);

  const { isPending: deliveryIsPending, addDeliveryMutate } = useAddDelivery();

  const { isPending: updateDeliveryIsPending, updateDeliveryMutate } =
    useUpdateDelivery();

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

      console.log("🌍 Extracted location data from Google:", { state, country });

      // Store Google Places values for dropdown options
      if (country) {
        setGoogleCountry(country);
        setFieldValue("country", country);
        console.log("📍 Setting country from Google:", country);
      }
      
      if (state) {
        setGoogleState(state);
        setFieldValue("state", state);
        console.log("📍 Setting state from Google:", state);
      }

      // Set address and coordinates
      setFieldValue("address", place.formatted_address);
      setFieldValue("latitude", lat ? lat.toString() : "");
      setFieldValue("longitude", lng ? lng.toString() : "");
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
          <Link to="/admin" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Settings
        </p>
      </div>
      <div className="flex flex-col md:flex-row bg-gray-100">
        {/* Sidebar */}
        <div className="w-full md:w-1/5 bg-white md:mb-0 mb-6 h-fit p-4 rounded-lg">
          <ul className="space-y-2 text-gray-600">
            {["Profile", "Security", "Charges"].map((item) => (
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
                        <label className="flex items-center gap-2 text-gray-700 mb-4">
                          Pick Address from Google Suggestions
                          <AttentionTooltip
                            content="Select from Google dropdown"
                            position="top"
                          />
                        </label>
                        <input
                          type="text"
                          ref={ref}
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                          placeholder="Start typing your address and select from Google suggestions..."
                          required
                          name="address"
                          maxLength={150}
                          title="Start typing your address and select from the Google dropdown suggestions for accurate location"
                          onChange={(e) => {
                            setFieldValue("address", e.currentTarget.value);
                            setFieldValue("latitude", "");
                            setFieldValue("longitude", "");
                            // Clear Google values when address is manually edited
                            if (!e.currentTarget.value || e.currentTarget.value !== values.address) {
                              setGoogleCountry("");
                              setGoogleState("");
                              setFieldValue("country", "");
                              setFieldValue("state", "");
                            }
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
                          value={(() => {
                            if (!values.country) return null;
                            const matched = findMatchingOption(countriesOptions, values.country);
                            if (!matched && values.country) {
                              // If no match but we have a value, create an option for it
                              console.log("🔍 Country dropdown - Creating option for:", values.country);
                              return { label: values.country, value: values.country };
                            }
                            return matched;
                          })()}
                          onChange={(selectedOption) => {
                            setFieldValue("country", selectedOption?.value || "");
                            // Clear Google values when manually changed
                            if (selectedOption?.value !== googleCountry) {
                              setGoogleCountry("");
                            }
                            // Clear state when country changes
                            if (selectedOption?.value !== values.country) {
                              setFieldValue("state", "");
                              setGoogleState("");
                            }
                          }}
                          placeholder="Select Country"
                          className="w-full"
                          isLoading={loadingCountries}
                          isDisabled={true}
                          noOptionsMessage={() => countriesError ? "Error loading countries" : "No countries found"}
                          styles={{
                            control: (base) => ({
                              ...base,
                              border: "1px solid #CCCCCC",
                              boxShadow: "none",
                              outline: "none",
                              backgroundColor: "#fff",
                              minHeight: "54px",
                              padding: "0 4px",
                              "&:hover": {
                                border: "1px solid #CCCCCC",
                              },
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              padding: "0 12px",
                            }),
                            input: (base) => ({
                              ...base,
                              margin: "0",
                              padding: "0",
                            }),
                            indicatorSeparator: () => ({
                              display: "none",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-4">
                          State
                        </label>
                        <Select
                          options={statesOptions}
                          value={(() => {
                            if (!values.state) return null;
                            const matched = findMatchingOption(statesOptions, values.state);
                            if (!matched && values.state) {
                              // If no match but we have a value, create an option for it
                              console.log("🔍 State dropdown - Creating option for:", values.state);
                              return { label: values.state, value: values.state };
                            }
                            return matched;
                          })()}
                          onChange={(selectedOption) => {
                            setFieldValue("state", selectedOption?.value || "");
                            // Clear Google value when manually changed
                            if (selectedOption?.value !== googleState) {
                              setGoogleState("");
                            }
                          }}
                          placeholder="Select State"
                          className="w-full"
                          isLoading={loadingStates}
                          isDisabled={true}
                          noOptionsMessage={() => {
                            if (!values.country) return "Please select a country first";
                            if (statesError) return "Error loading states";
                            return "No states found";
                          }}
                          styles={{
                            control: (base) => ({
                              ...base,
                              border: "1px solid #CCCCCC",
                              boxShadow: "none",
                              outline: "none",
                              backgroundColor: "#fff",
                              minHeight: "54px",
                              padding: "0 4px",
                              "&:hover": {
                                border: "1px solid #CCCCCC",
                              },
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              padding: "0 12px",
                            }),
                            input: (base) => ({
                              ...base,
                              margin: "0",
                              padding: "0",
                            }),
                            indicatorSeparator: () => ({
                              display: "none",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-500">
                        💡 To update Country or State, please update the address field above.
                      </p>
                    </div>

                    {/* Coordinates Display */}
                    {(values.latitude || values.longitude) && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div>
                          <label className="block text-gray-700 mb-2 text-sm font-medium">
                            Latitude
                          </label>
                          <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600">
                            {values.latitude || "Not set"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2 text-sm font-medium">
                            Longitude
                          </label>
                          <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600">
                            {values.longitude || "Not set"}
                          </div>
                        </div>
                        <div className="col-span-2">
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
              </div>
            </div>
          )}
          {activeSection == "Charges" && <ChargeCommision />}
          {/* {activeSection === "KYC" && (
                        <div className="">
                            <KYCVerification />
                        </div>
                    )} */}

          {/* {activeSection === "Bank Details" && (
                        <div className="">
                            <BankDetails />
                        </div>
                    )} */}

          {activeSection === "Security" && (
            <div className="">
              <SecuritySettings />
            </div>
          )}
          {activeSection === "Delivery" && (
            <div>
              <h2 className="text-xl font-medium mb-4">Delivery</h2>

              {/* Tab Content */}
              <div className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-4">
                      Delivery Price (per km)
                    </label>
                    <input
                      type="number"
                      className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                      name={"delivery_price"}
                      value={delivery}
                      onChange={(e) => {
                        setDelivery(e.target.value);
                      }}
                      required
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (data?.data?.data?.id) {
                        updateDeliveryMutate({
                          id: data?.data?.data?.id,
                          price_per_km: +delivery,
                        });
                      } else {
                        addDeliveryMutate({
                          price_per_km: +delivery,
                        });
                      }
                    }}
                    disabled={
                      deliveryIsPending || !delivery || updateDeliveryIsPending
                    }
                    className="mt-4 cursor-pointer disabled:cursor-pointer bg-gradient text-white px-6 py-2 rounded-md"
                  >
                    {deliveryIsPending || updateDeliveryIsPending
                      ? "Please wait..."
                      : data?.data?.data?.id
                        ? "Update"
                        : "Add"}
                  </button>
                </div>
              </div>
            </div>
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
