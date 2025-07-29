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
  phoneCode: "+234",
};

export default function SignInAsCustomer() {
  const { toastError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

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

  const personalImage =
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741615921/AoStyle/image_1_m2zq1t.png";
  const businessImage =
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741615921/AoStyle/image_1_m2zq1t.png";

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
            Welcome to OAStyles, a platform that simplifies tailoring processes;{" "}
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
                    checked={values.fabricVendorAgreement || false}
                    onChange={(e) =>
                      setFieldValue("fabricVendorAgreement", e.target.checked)
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
                      onClick={() => setShowAgreementModal(true)}
                      tabIndex={0}
                    >
                      CARYBIN and Tailor Agreement
                    </button>
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
                  className="w-full bg-gradient text-white py-4 rounded-lg font-medium cursor-pointer md:mt-8"
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
                <input
                  type="text"
                  placeholder="Enter your business address"
                  className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                  required
                  name={"location"}
                  value={values.location}
                  onChange={handleChange}
                />

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
                {/* Terms and Policies Agreement */}
                <div className="flex items-center mt-2 mb-2">
                  <input
                    value={values.checked}
                    onChange={handleChange}
                    type="checkbox"
                    id="agree"
                    required
                    className="mr-2"
                  />
                  <label htmlFor="agree" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="https://carybin.netlify.app/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gradient underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://carybin.netlify.app/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gradient underline"
                    >
                      Policies
                    </a>{" "}
                    from Carybin
                  </label>
                </div>

                <button
                  type="button"
                  className="text-purple-600 font-semibold mt-3 cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>

                <button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-gradient text-white py-4 rounded-lg font-medium cursor-pointer"
                >
                  {isPending
                    ? "Please wait..."
                    : "Sign Up As A Material Vendor"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
  function AgreementModal({ open, onClose }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
      if (open) {
        setIsLoading(true);
        setError(null);
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      const handleKeyDown = (event) => {
        if (!open) return;

        switch (event.key) {
          case "Escape":
            onClose();
            break;
          case "=":
          case "+":
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              handleZoomIn();
            }
            break;
          case "-":
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              handleZoomOut();
            }
            break;
          default:
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open]);

    const handleDownload = () => {
      const link = document.createElement("a");
      link.href = agreementPdf;
      link.download = "Agreement between Carybin and Fabric Vendors.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleZoomIn = () => {
      setZoom((prev) => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
      setZoom((prev) => Math.max(prev - 25, 50));
    };

    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };

    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setError("Failed to load PDF. Please try downloading the file instead.");
    };

    if (!open) return null;

    return (
      <div className="h-screen fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm bg-opacity-75 flex items-center justify-center p-4">
        <div
          className={`fadeInUp bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
            isFullscreen ? "w-full h-full" : "w-full max-w-6xl h-[90vh]"
          }`}
        >
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
                animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
              }
            `}
          </style>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-[#2B21E5] truncate">
                CARYBIN AND TAILOR AGREEMENT
              </h2>
              <span className="text-sm text-gray-500">{zoom}%</span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom Out"
                disabled={zoom <= 50}
              >
                <ZoomOut
                  size={18}
                  className={zoom <= 50 ? "text-gray-400" : "text-gray-600"}
                />
              </button>

              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom In"
                disabled={zoom >= 200}
              >
                <ZoomIn
                  size={18}
                  className={zoom >= 200 ? "text-gray-400" : "text-gray-600"}
                />
              </button>

              {/* <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download size={18} className="text-gray-600" />
              </button> */}

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={18} className="text-gray-600" />
                ) : (
                  <Maximize2 size={18} className="text-gray-600" />
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={18} className="text-red-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B21E5]"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                  <div className="text-red-500 text-xl">⚠️</div>
                  <p className="text-gray-600 max-w-md">{error}</p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-[#2B21E5] text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Download PDF Instead
                  </button>
                </div>
              </div>
            )}

            <div
              className="w-full h-full overflow-auto"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
                width: `${10000 / zoom}%`,
                height: `${10000 / zoom}%`,
              }}
            >
              <iframe
                src={`/agreements/Agreement between Carybin and Fabric Vendors.pdf#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                className="w-full h-full border-0"
                title="CARYBIN Fabric Vendor Agreement"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  minHeight: "600px",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t bg-gray-50 text-sm text-gray-500 rounded-b-lg">
            <div className="flex items-center space-x-4">
              <span>Use mouse wheel or zoom controls to adjust size</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Press ESC to close • Ctrl/Cmd + Plus/Minus to zoom</span>
              <button
                onClick={onClose}
                className="bg-gradient text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
