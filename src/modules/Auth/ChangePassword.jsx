import { Link } from "react-router-dom";
import { useFormik } from "formik";
import useChangePassword from "./hooks/useChangePassword";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import useToast from "../../hooks/useToast";

const initialValues = {
  new_password: "",
  new_password_confirmation: "",
};

export default function ChangePassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isPending, changePasswordMutate } = useChangePassword();
  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
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
      changePasswordMutate({
        ...val,
        reset_token: new URLSearchParams(window.location.search).get("token"),
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient">
      <div className="max-w-lg w-full bg-white rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
              alt="OAStyles Logo"
              className="h-20"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-medium text-black mb-4">
          Change Password
        </h2>
        {/* <p className="text-gray-500 text-sm mb-6">
          Enter the email address associated with your account to recieve a
          reset password link
        </p> */}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-black">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              name={"new_password"}
              required
              value={values.new_password}
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
          <label className="block text-black">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              name={"new_password_confirmation"}
              required
              value={values.new_password_confirmation}
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
            type="submit"
            className="w-full bg-gradient cursor-pointer text-white py-3 rounded-lg font-semibold"
          >
            {isPending ? "Please wait..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
