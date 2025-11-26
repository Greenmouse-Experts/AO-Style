import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, useEffect } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import { useFormik } from "formik";
import useRegister from "./hooks/useSignUpMutate";
import useAcceptInvite from "./hooks/useAcceptInvite";
import useGetInviteInfo from "../../hooks/invitation/useGetInviteInfo";
import useToast from "../../hooks/useToast";
import { countryCodes } from "../../constant";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import Autocomplete from "react-google-autocomplete";
import { AttentionTooltip } from "../../components/ui/Tooltip";
import NotFoundPage from "../../components/ui/NotFoundPage";

// import agreementPdf from "./Agreement between Carybin and Fabric Vendors.pdf";

export default function SignInAsCustomer() {
  const { toastError } = useToast();
  
  // Check for invitation token
  const token = new URLSearchParams(window.location.search).get("token");
  
  const {
    data: inviteData,
    isPending: inviteInfoIsPending,
    error: inviteError,
    isError: inviteIsError,
  } = useGetInviteInfo(token);

  const initialValues = {
    name: inviteData?.name ?? "",
    email: inviteData?.email ?? "",
    phone: "",
    alternative_phone: "",
    password: "",
    password_confirmation: "",
    referral_source: "",
    business_name: "",
    business_type: "",
    location: "",
    latitude: "",
    longitude: "",
    state: "",
    phoneCode: "+234",
    fabricVendorAgreement: false,
    checked: false,
  };

  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [fabricVendorAgreement, setFabricVendorAgreement] = useState(false);
  const [termsAgreement, setTermsAgreement] = useState(false);

  const handleAgreementClick = (e) => {
    e.preventDefault();

    // Check if it's a mobile device (screen width less than 768px)
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // On mobile, open PDF directly in new tab
      // window.open(
      //   "https://gray-daphene-38.tiiny.site/Agreement-between-Carybin-and-Fabric-Vendors.pdf",
      //   "_blank",
      // );
      setShowAgreementModal(true);
    } else {
      // On desktop, show modal
      setShowAgreementModal(true);
    }
  };

  const {
    handleSubmit,
    touched,
    errors,
    setFieldValue,
    values,
    handleChange,
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
      const phoneno = `${val.phone}`;
      const altno = `${val.alternative_phone}`;

      if (values.password_confirmation !== values.password) {
        return toastError("Password must match");
      }

      if (step === 1) {
        setStep(2);
        return;
      }
      
      console.log("📤 Fabric Vendor - Submitting with state:", val.state);
      
      // If there's a token, use acceptInvite, otherwise use register
      if (token) {
        acceptInviteMutate({
          ...val,
          token,
          role: "fabric-vendor",
          phone: phoneno,
          alternative_phone: val?.alternative_phone === "" ? undefined : altno,
          location: val.location,
          state: val.state || "",
          coordinates: {
            longitude: val.longitude,
            latitude: val.latitude,
          },
          business: {
            business_name: val.business_name,
            business_type: val.business_type,
            business_registration_number: val.business_registration_number,
            location: val.location,
            state: val.state || "",
          },
        });
      } else {
        registerMutate({
          ...val,
          role: "fabric-vendor",
          phone: phoneno,
          alternative_phone: val?.alternative_phone === "" ? undefined : altno,
          allowOtp: true,
          location: val.location,
          state: val.state || "",
          coordinates: {
            longitude: val.longitude,
            latitude: val.latitude,
          },
          business: {
            business_name: val.business_name,
            business_type: val.business_type,
            business_registration_number: val.business_registration_number,
            location: val.location,
            state: val.state || "",
          },
        });
      }
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);
  const { isPending: acceptInviteIsPending, acceptInviteMutate } = useAcceptInvite();
  
  // Show error if invite token is invalid
  if (token && inviteIsError) {
    return <NotFoundPage />;
  }

  // Validation for Step 1
  const isStep1Valid = () => {
    return (
      values.name.trim() !== "" &&
      values.email.trim() !== "" &&
      values.phone.trim() !== "" &&
      values.password.trim() !== "" &&
      values.password_confirmation.trim() !== "" &&
      values.referral_source.trim() !== "" &&
      fabricVendorAgreement &&
      termsAgreement
    );
  };

  // Validation for Step 2
  const isStep2Valid = () => {
    return (
      values.business_name.trim() !== "" &&
      values.business_type.trim() !== "" &&
      values.location.trim() !== ""
    );
  };

  const personalImage =
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741617621/AoStyle/image_2_ezzekx.png";
  const businessImage =
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741617621/AoStyle/image_2_ezzekx.png";

  // Comprehensive Google Places debugging
  useEffect(() => {
    console.log(
      "🔑 Fabric Vendor - Google Maps API Key:",
      import.meta.env.VITE_GOOGLE_MAP_API_KEY ? "Available" : "Missing",
    );
    console.log(
      "🌐 Fabric Vendor - Google object available:",
      typeof window.google !== "undefined",
    );
    console.log(
      "📍 Fabric Vendor - Places library:",
      typeof window.google?.maps?.places !== "undefined",
    );

    if (typeof window.google === "undefined") {
      console.error(
        "❌ Google Maps JavaScript API not loaded for Fabric Vendor",
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full flex overflow-hidden h-screen">
        {/* Left Section - Image & Text */}
        <div className="hidden lg:flex w-1/2 relative h-full">
          <img
            src={step === 1 ? personalImage : businessImage}
            alt="Sign In"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-0 p-8 text-white w-full">
            <h2 className="text-xl font-medium">
              Join Our Marketplace – Sell Fabrics & Materials <br /> to
              Thousands of Customers!
            </h2>
            <p className="text-sm mt-2">
              Welcome to Carybin, a platform that simplifies tailoring
              processes; <br />
              from buying materials to finding a tailor for you.
            </p>
          </div>
        </div>

        {/* Right Section - Sign In Form */}
        <div className="w-full lg:w-1/2 md:w-1/1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link to="/">
                <img
                  src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                  alt="OA Styles"
                  className="h-20 w-auto mx-auto"
                />
              </Link>
            </div>
            <h2 className="text-2xl font-semibold lg:text-left md:text-center text-gray-800 mb-4">
              Sign Up As A <span className="text-[#2B21E5]">Fabric Vendor</span>
            </h2>
            <p className="text-gray-500 lg:text-left md:text-center text-sm mt-1">
              Fill the form below to create an account instantly
            </p>

            {/* Tabs Navigation */}
            <div className="flex mt-4 border-b border-[#D86BC3]">
              <button
                className={`flex-1 pb-2 text-center ${
                  step === 1
                    ? "border-b-4 border-[#D86BC3] font-medium"
                    : "text-gray-500"
                }`}
                onClick={() => setStep(1)}
              >
                Personal Details
              </button>
              <button
                className={`flex-1 pb-2 text-center ${
                  step === 2
                    ? "border-b-4 border-[#D86BC3] font-medium"
                    : "text-gray-500"
                }`}
                // onClick={() => setStep(2)}
              >
                Business Details
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {step === 1 ? (
                <>
                  <label className="block text-black">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    name={"name"}
                    required
                    value={values.name}
                    onChange={handleChange}
                    className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                  />
                  <label className="block text-black">Email Address</label>
                  <input
                    type="email"
                    name={"email"}
                    required
                    value={values.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                  />
                  <div className="mb-3">
                    <label className="block text-black mb-2">
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
                  </div>
                  <div className="mb-3">
                    <label className="block text-black mb-2">
                      Alternative Phone Number{" "}
                      <small className="text-[#CCCCCC]">(Optional)</small>
                    </label>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 ">
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
                  </div>
                  <label className="block text-black">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name={"password"}
                      required
                      value={values.password}
                      onChange={handleChange}
                      className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-5 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <label className="block text-black">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      name={"password_confirmation"}
                      required
                      value={values.password_confirmation}
                      onChange={handleChange}
                      className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-5 text-gray-500"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <label className="block text-gray-700 mb-3">
                    How did you hear about us?
                  </label>
                  <select
                    name={"referral_source"}
                    value={values.referral_source}
                    onChange={handleChange}
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
                  <div className="flex items-center mt-2 mb-2">
                    <input
                      type="checkbox"
                      id="fabricVendorAgreement"
                      name="fabricVendorAgreement"
                      required
                      className="mr-2"
                      checked={fabricVendorAgreement}
                      onChange={(e) =>
                        setFabricVendorAgreement(e.target.checked)
                      }
                    />
                    <label
                      htmlFor="fabricVendorAgreement"
                      className="text-sm text-gray-700"
                    >
                      I accept the{" "}
                      <button
                        type="button"
                        className="text-gradient underline cursor-pointer hover:text-purple-500 transition duration-200 ease-in-out"
                        onClick={handleAgreementClick}
                        tabIndex={0}
                      >
                        CARYBIN and Fabric Vendor Agreement
                      </button>
                    </label>
                  </div>
                  <div className="flex items-center mt-5 mb-2">
                    <input
                      type="checkbox"
                      id="agree"
                      required
                      className="mr-2"
                      checked={termsAgreement}
                      onChange={(e) => setTermsAgreement(e.target.checked)}
                    />
                    <label htmlFor="agree" className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a
                        href="https://beta.carybin.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gradient underline"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://beta.carybin.com/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gradient underline"
                      >
                        Policies
                      </a>{" "}
                      from Carybin
                    </label>
                  </div>
                  {/* Modal for Fabric Vendor Agreement */}
                  {typeof window !== "undefined" && (
                    <AgreementModal
                      open={showAgreementModal}
                      onClose={() => setShowAgreementModal(false)}
                    />
                  )}
                  <button
                    type="submit"
                    disabled={!isStep1Valid()}
                    className={`w-full py-4 rounded-lg font-medium mt-4 transition-all duration-200 ${
                      isStep1Valid()
                        ? "bg-gradient text-white cursor-pointer hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Proceed to Business Details
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-gray-700">Business Name</label>
                  <input
                    type="text"
                    name={"business_name"}
                    value={values.business_name}
                    onChange={handleChange}
                    placeholder="Business Name"
                    className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                    required
                  />
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
                    <option value="" disabled selected>
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
                  <label className="flex items-center gap-2 text-gray-700">
                    Pick Business Address from Google Suggestions
                    <AttentionTooltip
                      content="Select from Google dropdown"
                      position="top"
                    />
                  </label>
                  <Autocomplete
                    apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                    placeholder="Start typing your business address and select from Google suggestions..."
                    name="location"
                    title="Start typing your business address and select from the Google dropdown suggestions for accurate location"
                    value={values.location}
                    onChange={(e) => {
                      console.log(
                        "📝 Fabric Vendor - Address input changed:",
                        e.target.value,
                      );
                      setFieldValue("location", e.target.value);
                    }}
                    onPlaceSelected={(place) => {
                      console.log(
                        "🗺️ Fabric Vendor - Google Place Selected:",
                        place,
                      );
                      
                      const lat = place.geometry?.location?.lat();
                      const lng = place.geometry?.location?.lng();
                      
                      // Extract state from address_components
                      let state = "";
                      if (place.address_components) {
                        const stateComponent = place.address_components.find(
                          (component) =>
                            component.types.includes("administrative_area_level_1")
                        );
                        state = stateComponent ? stateComponent.long_name : "";
                      }
                      
                      console.log("📍 Fabric Vendor - Extracted data:", {
                        lat,
                        lng,
                        state,
                        formatted_address: place.formatted_address,
                      });

                      setFieldValue("location", place.formatted_address);
                      setFieldValue("latitude", lat ? lat.toString() : "");
                      setFieldValue("longitude", lng ? lng.toString() : "");
                      setFieldValue("state", state);
                    }}
                    options={{
                      componentRestrictions: { country: "ng" },
                      types: [],
                    }}
                    onFocus={() =>
                      console.log("🎯 Fabric Vendor - Address input focused")
                    }
                    onBlur={() =>
                      console.log("👋 Fabric Vendor - Address input blurred")
                    }
                    style={{ zIndex: 1 }}
                  />
                  {values.state && (
                    <div className="text-xs text-green-600 mt-1">
                      ✅ State detected: {values.state}
                    </div>
                  )}
                  <label className="block text-gray-700">
                    Business Registration Number (Optional)
                  </label>
                  <input
                    name={"business_registration_number"}
                    type="text"
                    onChange={handleChange}
                    value={values.business_registration_number}
                    placeholder="Enter your business registration number"
                    className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                  />
                  <button
                    type="button"
                    className="text-purple-600 font-semibold mt-3 cursor-pointer"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    disabled={(isPending || acceptInviteIsPending) || !isStep2Valid()}
                    type="submit"
                    className={`w-full py-4 rounded-lg font-medium transition-all duration-200 ${
                      !(isPending || acceptInviteIsPending) && isStep2Valid()
                        ? "bg-gradient text-white cursor-pointer hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {(isPending || acceptInviteIsPending)
                      ? "Please wait..."
                      : "Sign Up As A Fabric Vendor"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  //AGREEMENT MODAL
  function AgreementModal({ open, onClose }) {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      const handleKeyDown = (event) => {
        if (!open) return;
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
          <style>
            {`
              @keyframes fadeInUp {
                0% {
                  opacity: 0;
                  transform: translateY(40px) scale(0.98);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              .animate-fade-in-up {
                animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              }
            `}
          </style>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-purple-600">
              Service Level Agreement (SLA)
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-sm max-w-none">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Service Level Agreement (SLA)
                </h1>
                <p className="text-lg text-gray-600">
                  Between Carybin Limited and Fabric Vendors
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Effective Date:</strong> [Upon Sign Up]
                </p>
              </div>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Parties:
                </h3>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>
                    <strong>E-Commerce Platform Host:</strong> [Carybin Limited]
                  </li>
                  <li>
                    <strong>Fabric Vendors:</strong> [Insert Fabric Vendor
                    Name/Business Name]
                  </li>
                </ol>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  1. Purpose
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  This SLA defines the terms and conditions under which fabric
                  vendors will supply fabrics to customers and tailors through
                  the Carybin (Oastyles platform). It outlines performance
                  standards, responsibilities, and remedies for service
                  failures.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  2. Scope
                </h3>
                <p className="text-gray-700 mb-3">
                  This SLA covers the following services:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                  <li>Supply of fabrics as per customer orders.</li>
                  <li>Timely fulfillment and delivery of fabric orders.</li>
                  <li>Quality assurance for supplied fabrics.</li>
                  <li>Communication with customers and the platform.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  3. Service Levels and Performance Metrics
                </h3>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.1 Order Acknowledgment
                  </h4>
                  <p className="text-gray-700 ml-4">
                    Fabric vendors must acknowledge orders within{" "}
                    <strong>2 hours</strong> of receipt.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.2 Order Fulfillment Time
                  </h4>
                  <p className="text-gray-700 mb-2 ml-4">
                    Fabric orders must be filled and ready for pickup/delivery
                    within the agreed timeframe:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-8 text-gray-700">
                    <li>
                      <strong>Standard Orders:</strong> 2 hours.
                    </li>
                    <li>
                      <strong>Express Orders:</strong> Immediately
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.3 Quality Standards
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    <li>
                      Supplied fabrics must meet the quality standards as
                      uploaded on the platform.
                    </li>
                    <li>
                      Minimum defects are allowed (e.g., damage, incorrect
                      fabric type, or colour).
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.4 Communication
                  </h4>
                  <p className="text-gray-700 ml-4">
                    Fabric vendors must respond to customer inquiries or
                    requests for updates within <strong>12 hours</strong>{" "}
                    through the customer service.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  4. Responsibilities
                </h3>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    4.1 E-Commerce Platform Host
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    <li>
                      Provide accurate customer orders and specifications to the
                      fabric vendor.
                    </li>
                    <li>
                      Handle customer complaints and disputes related to
                      platform issues.
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    4.2 Fabric Vendors
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    <li>
                      Supply high-quality fabrics as per customer orders and as
                      uploaded on the platform.
                    </li>
                    <li>
                      Ensure timely fulfillment and delivery of fabric orders.
                    </li>
                    <li>
                      Communicate any delays or issues to customer service
                      through the platform, WhatsApp, or contact form promptly.
                    </li>
                    <li>
                      Package fabrics securely for pickup/delivery with
                      allocated official Carybin branding materials.
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  5. Dispute Resolution
                </h3>
                <p className="text-gray-700 leading-relaxed ml-4">
                  Disputes related to fabric supply (e.g., quality, delays) will
                  be resolved through the platforms despite the resolution
                  mechanism and the fabric vendor hereby agrees to have read and
                  therefore accepts the dispute resolution mechanism of the
                  platform and any decision given by the platform hosts.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  6. Penalties and Remedies
                </h3>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    6.1 Late Order Fulfillment
                  </h4>
                  <p className="text-gray-700 ml-4">
                    For orders fulfilled after the agreed time frame, the fabric
                    vendor will issue a <strong>10% discount</strong> on the
                    order value.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    6.2 Defective Fabrics
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    <li>
                      Defective fabrics will be replaced by the fabric vendor at
                      no additional cost to the customer.
                    </li>
                    <li>
                      If the defect cannot be resolved, the fabric vendor will
                      issue a <strong>full refund</strong> for the order.
                    </li>
                    <li>
                      Where the defective fabric is discovered by the tailor or
                      customer end, the cost of logistics is applied to the
                      vendor's account.
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    6.3 Failure to Communicate
                  </h4>
                  <p className="text-gray-700 ml-4">
                    Failure to respond to customer inquiries through the
                    platform host within the agreed timeframe will result in a{" "}
                    <strong>5% penalty</strong> on the order value.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  7. Termination
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                  <li>
                    This platform host reserves the right to terminate this SLA
                    may be terminated at any time with or without notice to the
                    Fabric vendor provided that the Vendor is not being owed by
                    the platform.
                  </li>
                  <li>Termination due to breach of terms will be immediate.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  8. Amendments
                </h3>
                <p className="text-gray-700 leading-relaxed ml-4">
                  Any changes to this SLA must be communicated to the Fabric
                  Vendor and asked to give consent failure of which the Vendor's
                  account may be suspended.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  9. Governing Law
                </h3>
                <p className="text-gray-700 ml-4">
                  This SLA is governed by the laws of Federal Republic of
                  Nigeria
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  10. Withdrawals
                </h3>
                <p className="text-gray-700 leading-relaxed ml-4">
                  The Fabric Vendor agrees to the platform's form policy of
                  withdrawals on bi-weekly basis but subjects to the terms and
                  conditions of the platform as maybe prescribed from time to
                  time
                </p>
              </section>

              <hr className="my-8 border-gray-300" />

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  11. Signatures
                </h3>
                <p className="text-gray-700 ml-4">
                  By ticking the box below, the Vendor agrees to these terms and
                  conditions outlined in this SLA.
                </p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">Press ESC to close</div>
            <button
              onClick={onClose}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}