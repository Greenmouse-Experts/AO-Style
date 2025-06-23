import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import useRegister from "./hooks/useSignUpMutate";
import useGetInviteInfo from "../../hooks/marketRep/useGetInviteInfo";

import NotFoundPage from "../../components/ui/NotFoundPage";
import Loader from "../../components/ui/Loader";
import { useFormik } from "formik";
import useAcceptInvite from "./hooks/useAcceptInvite";
import { countryCodes } from "../../constant";

import Select from "react-select";
import useToast from "../../hooks/useToast";

export default function MarketRepInvite() {
  const { toastError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  const {
    data: getAllMarketRepData,
    isPending: inviteInfoIsPending,
    error,
    isError,
  } = useGetInviteInfo(token);

  const initialValues = {
    name: getAllMarketRepData?.name ?? "",
    email: getAllMarketRepData?.email ?? "",
    phone: "",
    alternative_phone: "",
    password: "",
    password_confirmation: "",
    referral_source: "",
    location: "",
    years_of_experience: "",
    phoneCode: "+234",
  };

  const { isPending, acceptInviteMutate } = useAcceptInvite();

  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

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
      const phoneno = `${val.phoneCode + val.phone}`;
      const altno = `${val.altCode + val.alternative_phone}`;

      if (values.password_confirmation !== values.password) {
        return toastError("Password must match");
      }

      acceptInviteMutate(
        {
          ...val,
          token,
          role: "market-representative",
          phone: phoneno,
          alternative_phone: val?.alternative_phone === "" ? undefined : altno,
        },
        {
          onSuccess: () => {
            resetForm();
          },
        }
      );
    },
  });

  // if (inviteInfoIsPending) {
  //   return (
  //     <div className="m-auto flex h-screen items-center justify-center">
  //       <Loader />
  //     </div>
  //   );
  // }

  if (isError || error) {
    return <NotFoundPage />;
  }
  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 relative h-full">
        <img
          src="https://res.cloudinary.com/diqa0sakr/image/upload/v1745811955/image_1_wfjpsw.jpg"
          alt="Sign In"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-0 p-8 text-white w-full">
          <h2 className="text-xl font-medium">
            Earn Money by onboarding Fabric Vendors and Fashion Designers!
          </h2>
          <p className="text-sm mt-2">
            Welcome to OAStyles, a platform that simplifies tailoring processes;{" "}
            <br />
            from buying materials to finding a tailor for you.
          </p>
        </div>
      </div>

      {/* Right Section - Sign In Form */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto p-4 sm:p-8">
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Become a Market Rep
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Fill the form become a Market rep on OAStyles
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

              <div className="flex items-center gap-2 ">
                {/* Country Code Dropdown */}
                <Select
                  options={options}
                  name="phoneCode"
                  value={options?.find((opt) => opt.value === values.phoneCode)}
                  onChange={(selectedOption) =>
                    setFieldValue("phoneCode", selectedOption.value)
                  }
                  placeholder="Select"
                  className="p-2 w-28 border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
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
                {/* Phone Input */}
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="flex-1 p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  value={values.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-black mb-2">
                Alternative Phone Number{" "}
                <small className="text-[#CCCCCC]">(Optional)</small>
              </label>

              <div className="flex items-center gap-2 ">
                {/* Country Code Dropdown */}
                <Select
                  options={options}
                  name="altCode"
                  value={options?.find((opt) => opt.value === values.altCode)}
                  onChange={(selectedOption) =>
                    setFieldValue("altCode", selectedOption.value)
                  }
                  placeholder="Select"
                  className="p-2 w-34 border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
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
                <input
                  type="tel"
                  name={"alternative_phone"}
                  value={values.alternative_phone}
                  onChange={handleChange}
                  placeholder="Alternative Phone Number"
                  className="w-full p-4 border border-[#CCCCCC] outline-none  rounded-lg"
                />
              </div>
            </div>

            <label className="block text-black">
              Years of Experience in Sales
            </label>

            <input
              type="numeric"
              name={"years_of_experience"}
              required
              value={values.years_of_experience}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, "");
                setFieldValue("years_of_experience", onlyNums);
              }}
              placeholder="Years of experience"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />

            <label className="block text-black">Address</label>
            <input
              type="text"
              name={"location"}
              value={values.location}
              onChange={handleChange}
              placeholder="Enter your home address"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              required
            />

            {/* <div>
              <HowDidYouHearAboutUs />
            </div> */}

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

            <button
              disabled={isPending}
              className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal"
              type="submit"
            >
              {isPending ? "Please wait..." : "Sign Up As A Market Rep"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600">
              Login
            </Link>
          </p>

          <div className="flex items-center mt-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500">Or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button className="w-full mt-4 flex items-center justify-center border border-[#CCCCCC] hover:bg-gradient-to-r from-purple-500 to-pink-50 hover:text-white p-4 rounded-lg">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 mr-2"
            />
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
