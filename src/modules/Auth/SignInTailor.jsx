import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import { useFormik } from "formik";
import useRegister from "./hooks/useSignUpMutate";
import useToast from "../../hooks/useToast";
import { countryCodes } from "../../constant";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import Autocomplete from "react-google-autocomplete";

const initialValues = {
  name: "",
  email: "",
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
  phoneCode: "+234",
  fabricVendorAgreement: false,
  checked: false,
};

export default function SignInAsCustomer() {
  const { toastError } = useToast();

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
      //   "https://gray-daphene-38.tiiny.site/Agreement-between-Carybin-and-Tailor.pdf",
      //   "_blank",
      // );
      setShowAgreementModal(true);
    } else {
      // On desktop, show modal
      setShowAgreementModal(true);
    }
  };

  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
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
      const phoneno = `${val.phone}`;
      const altno = `${val.alternative_phone}`;

      if (values.password_confirmation !== values.password) {
        return toastError("Password must match");
      }
      if (step === 1) {
        setStep(2);
        return;
      }
      registerMutate({
        ...val,
        role: "fashion-designer",
        phone: phoneno,
        alternative_phone: val?.alternative_phone === "" ? undefined : altno,
        allowOtp: true,
        location: val.location,
        coordinates: {
          longitude: val.longitude,
          latitude: val.latitude,
        },
        business: {
          business_name: val.business_name,
          business_type: val.business_type,
          business_registration_number: val.business_registration_number,
          location: val.location,
        },
      });
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);

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
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741615921/AoStyle/image_1_m2zq1t.png";
  const businessImage =
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741615921/AoStyle/image_1_m2zq1t.png";

  // Comprehensive Google Places debugging
  useEffect(() => {
    console.log(
      "🔑 Tailor - Google Maps API Key:",
      import.meta.env.VITE_GOOGLE_MAP_API_KEY ? "Available" : "Missing",
    );
    console.log(
      "🌐 Tailor - Google object available:",
      typeof window.google !== "undefined",
    );
    console.log(
      "📍 Tailor - Places library:",
      typeof window.google?.maps?.places !== "undefined",
    );

    if (typeof window.google === "undefined") {
      console.error("❌ Google Maps JavaScript API not loaded for Tailor");
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section - Image & Text */}
      <div className="hidden lg:flex w-1/2 h-screen relative">
        <img
          src={step === 1 ? personalImage : businessImage}
          alt="Sign In"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/70 to-transparent w-full">
          <h2 className="text-xl font-medium">
            Showcase Your Talent – Get Hired <br /> to Create Stunning Outfits!
          </h2>
          <p className="text-sm mt-2">
            Welcome to Carybin, a platform that simplifies tailoring processes;{" "}
            <br />
            from buying materials to finding a tailor for you.
          </p>
        </div>
      </div>

      {/* Right Section - Sign In Form */}
      <div className="w-full lg:w-1/2 md:w-1/1 h-screen overflow-y-auto p-4 sm:p-8">
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
            Sign Up As A{" "}
            <span className="text-[#2B21E5]">Tailor/Fashion Designer</span>
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
              //   onClick={() => setStep(2)}
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
                  <label className="block text-black mb-2">Phone Number</label>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 ">
                    {/* Country Code Dropdown */}
                    {/* <Select
                      options={options}
                      name="phoneCode"
                      value={options.find(
                        (opt) => opt.value === values.phoneCode
                      )}
                      onChange={(selectedOption) =>
                        setFieldValue("phoneCode", selectedOption.value)
                      }
                      placeholder="Select"
                      className="p-2 md:w-28 border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
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
                    />{" "} */}
                    {/* Phone Input */}
                    {/* <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      className="flex-1 p-4 border border-[#CCCCCC] outline-none rounded-lg"
                      value={values.phone}
                      onChange={handleChange}
                      required
                    /> */}
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
                    {/* Country Code Dropdown */}
                    {/* <Select
                      options={options}
                      name="altCode"
                      value={options.find(
                        (opt) => opt.value === values.altCode
                      )}
                      onChange={(selectedOption) =>
                        setFieldValue("altCode", selectedOption.value)
                      }
                      placeholder="Select"
                      className="p-2 md:w-34 border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
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
                    /> */}
                    {/* <input
                      type="tel"
                      name={"alternative_phone"}
                      value={values.alternative_phone}
                      onChange={handleChange}
                      placeholder="Alternative Phone Number"
                      className="w-full p-4 border border-[#CCCCCC] outline-none  rounded-lg"
                    /> */}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* <HowDidYouHearAboutUs /> */}

                <label className="block text-gray-700 mb-3">
                  {" "}
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
                    onChange={(e) => setFabricVendorAgreement(e.target.checked)}
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
                      CARYBIN and Tailor Agreement
                    </button>
                  </label>
                </div>
                {/* Terms and Policies Agreement */}
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
                {/* MODAL */}
                {typeof window !== "undefined" && (
                  <AgreementModal
                    open={showAgreementModal}
                    onClose={() => setShowAgreementModal(false)}
                  />
                )}
                <button
                  type="submit"
                  disabled={!isStep1Valid()}
                  className={`w-full py-4 rounded-lg font-medium md:mt-8 transition-all duration-200 ${
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

                <label className="block text-gray-700">Business Address</label>
                <Autocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  placeholder="Enter full detailed address"
                  name="location"
                  value={values.location}
                  onChange={(e) => {
                    console.log(
                      "📝 Tailor - Address input changed:",
                      e.target.value,
                    );
                    setFieldValue("location", e.target.value);
                  }}
                  onPlaceSelected={(place) => {
                    console.log("🗺️ Tailor - Google Place Selected:", place);
                    const lat = place.geometry?.location?.lat();
                    const lng = place.geometry?.location?.lng();
                    console.log("📍 Tailor - Setting coordinates:", {
                      lat,
                      lng,
                    });

                    setFieldValue("location", place.formatted_address);
                    setFieldValue("latitude", lat ? lat.toString() : "");
                    setFieldValue("longitude", lng ? lng.toString() : "");
                  }}
                  options={{
                    componentRestrictions: { country: "ng" },
                    types: [],
                  }}
                  onFocus={() =>
                    console.log("🎯 Tailor - Address input focused")
                  }
                  onBlur={() =>
                    console.log("👋 Tailor - Address input blurred")
                  }
                  style={{ zIndex: 1 }}
                />
                {/* {values.latitude && values.longitude && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Location coordinates set: {values.latitude},{" "}
                    {values.longitude}
                  </div>
                )}*/}

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
                  disabled={isPending || !isStep2Valid()}
                  type="submit"
                  className={`w-full py-4 rounded-lg font-medium transition-all duration-200 ${
                    !isPending && isStep2Valid()
                      ? "bg-gradient text-white cursor-pointer hover:opacity-90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isPending
                    ? "Please wait..."
                    : "Sign Up As A Tailor/Fashion Designer"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
  //AGREEMENT MODAL
  function AgreementModal({ open, onClose, agreementType = "tailor" }) {
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

    const isFabricVendor = agreementType === "fabric";
    const isTailor = agreementType === "tailor";

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
            <h2 className="text-xl font-semibold text-purple-500">
              {isTailor
                ? "Service Level Agreement (SLA) - Tailors"
                : "Service Level Agreement (SLA) - Fabric Vendors"}
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
                  {isTailor
                    ? "Between Carybin Limited and The Tailor"
                    : "Between Carybin Limited and Fabric Vendors"}
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
                    <strong>{isTailor ? "Tailors:" : "Fabric Vendors:"}</strong>{" "}
                    {isTailor
                      ? "[Business Name as provided by vendor]"
                      : "[Insert Fabric Vendor Name/Business Name]"}
                  </li>
                </ol>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  1. Purpose
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {isTailor
                    ? "This SLA defines the terms and conditions under which tailors will provide custom tailoring services to customers through the e-commerce platform. It outlines performance standards, responsibilities, and remedies for service failures."
                    : "This SLA defines the terms and conditions under which fabric vendors will supply fabrics to customers and tailors through the Carybin (Oastyles platform). It outlines performance standards, responsibilities, and remedies for service failures."}
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
                  {isTailor ? (
                    <>
                      <li>Custom tailoring services for customers.</li>
                      <li>
                        Timely completion and delivery of tailored products.
                      </li>
                      <li>Quality assurance for tailored products.</li>
                      <li>Communication with customers and the platform.</li>
                    </>
                  ) : (
                    <>
                      <li>Supply of fabrics as per customer orders.</li>
                      <li>Timely fulfillment and delivery of fabric orders.</li>
                      <li>Quality assurance for supplied fabrics.</li>
                      <li>Communication with customers and the platform.</li>
                    </>
                  )}
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
                    {isTailor ? "Tailors" : "Fabric vendors"} must acknowledge
                    orders within <strong>2 hours</strong> of receipt.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.2 Order {isTailor ? "Completion" : "Fulfillment"} Time
                  </h4>
                  <p className="text-gray-700 mb-2 ml-4">
                    {isTailor
                      ? "Tailored products must be completed and ready for pickup/delivery within the agreed timeframe:"
                      : "Fabric orders must be filled and ready for pickup/delivery within the agreed timeframe:"}
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-8 text-gray-700">
                    {isTailor ? (
                      <>
                        <li>
                          <strong>Standard Orders:</strong> 7-10 business days.
                        </li>
                        <li>
                          <strong>Express Orders:</strong> 3-5 business days (if
                          applicable).
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <strong>Standard Orders:</strong> 2 hours.
                        </li>
                        <li>
                          <strong>Express Orders:</strong> Immediately
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.3 Quality Standards
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    {isTailor ? (
                      <>
                        <li>
                          Tailored products must meet the quality standards
                          agreed upon with the customer and the Platform host.
                        </li>
                        <li>
                          A maximum of <strong>2% defect rate</strong> is
                          allowed (e.g., incorrect measurements, stitching
                          issues).
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          Supplied fabrics must meet the quality standards as
                          uploaded on the platform.
                        </li>
                        <li>
                          Minimum defects are allowed (e.g., damage, incorrect
                          fabric type, or colour).
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    3.4 Communication
                  </h4>
                  <p className="text-gray-700 ml-4">
                    {isTailor ? "Tailors" : "Fabric vendors"} must respond to
                    customer inquiries or requests for updates within{" "}
                    <strong>12 hours</strong>
                    {isTailor ? "." : " through the customer service."}
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
                      Provide accurate customer orders and specifications to the{" "}
                      {isTailor ? "tailor" : "fabric vendor"}.
                    </li>
                    <li>
                      Handle customer complaints and disputes related to
                      platform issues.
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    4.2 {isTailor ? "Tailors" : "Fabric Vendors"}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    {isTailor ? (
                      <>
                        <li>
                          Deliver high-quality tailoring services within the
                          agreed timelines.
                        </li>
                        <li>
                          Communicate any delays or issues to customers and the
                          platform promptly.
                        </li>
                        <li>
                          Ensure accurate measurements and specifications are
                          followed.
                        </li>
                        <li>
                          Package tailored products securely for
                          pickup/delivery.
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          Supply high-quality fabrics as per customer orders and
                          as uploaded on the platform.
                        </li>
                        <li>
                          Ensure timely fulfillment and delivery of fabric
                          orders.
                        </li>
                        <li>
                          Communicate any delays or issues to customer service
                          through the platform, WhatsApp, or contact form
                          promptly.
                        </li>
                        <li>
                          Package fabrics securely for pickup/delivery with
                          allocated official Carybin branding materials.
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  5. Dispute Resolution
                </h3>
                <p className="text-gray-700 leading-relaxed ml-4">
                  {isTailor
                    ? "Disputes related to tailoring (e.g., quality, delays) will be resolved through the platform's dispute resolution mechanism (Refer to term and conditions), and the Tailor hereby agrees, to have read, and therefore accepts the dispute resolution mechanism of the platform, and any decision given by the platform hosts."
                    : "Disputes related to fabric supply (e.g., quality, delays) will be resolved through the platforms despite the resolution mechanism and the fabric vendor hereby agrees to have read and therefore accepts the dispute resolution mechanism of the platform and any decision given by the platform hosts."}
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  6. Penalties and Remedies
                </h3>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    6.1 Late Order {isTailor ? "Completion" : "Fulfillment"}
                  </h4>
                  <p className="text-gray-700 ml-4">
                    For orders {isTailor ? "completed" : "fulfilled"} after the
                    agreed time frame, the{" "}
                    {isTailor ? "tailor" : "fabric vendor"} will issue a{" "}
                    <strong>10% discount</strong> on the order value
                    {isTailor ? " to the customer" : ""}.
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    6.2 Defective {isTailor ? "Products" : "Fabrics"}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                    <li>
                      Defective{" "}
                      {isTailor
                        ? "products will be repaired or replaced by the tailor"
                        : "fabrics will be replaced by the fabric vendor"}{" "}
                      at no additional cost to the customer.
                    </li>
                    <li>
                      If the defect cannot be resolved, the{" "}
                      {isTailor ? "tailor" : "fabric vendor"} will issue a{" "}
                      <strong>full refund</strong> for the order.
                    </li>
                    {!isTailor && (
                      <li>
                        Where the defective fabric is discovered by the tailor
                        or customer end, the cost of logistics is applied to the
                        vendor's account.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    6.3 Failure to Communicate
                  </h4>
                  <p className="text-gray-700 ml-4">
                    Failure to respond to customer inquiries
                    {isTailor ? "" : " through the platform host"} within the
                    agreed timeframe will result in a{" "}
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
                    may be terminated at any time with or without notice to the{" "}
                    {isTailor ? "Tailor" : "Fabric vendor"} provided that the{" "}
                    {isTailor ? "Tailor" : "Vendor"} is not being owed by the
                    platform.
                  </li>
                  <li>Termination due to breach of terms will be immediate.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  8. Amendments
                </h3>
                <p className="text-gray-700 leading-relaxed ml-4">
                  Any changes to this SLA must be communicated to the{" "}
                  {isTailor ? "Tailor" : "Fabric Vendor"} and asked to give
                  consent failure of which the{" "}
                  {isTailor ? "Tailor's" : "Vendor's"} account may be suspended.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  9. Governing Law
                </h3>
                <p className="text-gray-700 ml-4">
                  This SLA is governed by the laws of{" "}
                  {isTailor
                    ? "the Federal Republic of Nigeria."
                    : "Federal Republic of Nigeria"}
                </p>
              </section>

              {!isTailor && (
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
              )}

              <hr className="my-8 border-gray-300" />

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {isTailor ? "10" : "11"}. Signatures
                </h3>
                <p className="text-gray-700 ml-4">
                  By ticking the box below, the {isTailor ? "Vendor" : "Vendor"}{" "}
                  agrees to these terms and conditions outlined in this SLA.
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
