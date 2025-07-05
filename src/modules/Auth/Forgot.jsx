import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import useForgotPassword from "./hooks/useForgotPassword";

const initialValues = {
  email: "",
};

export default function SignInCustomer() {
  const { isPending, forgotPasswordMutate } = useForgotPassword();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    resetForm,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      forgotPasswordMutate(val, {
        onSuccess: () => {
          resetForm();
        },
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
          Reset your Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter the email address associated with your account to recieve a
          reset password link
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-gray-700">Email Address</label>
          <input
            type="email"
            name={"email"}
            value={values.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-gradient cursor-pointer text-white py-3 rounded-lg font-semibold"
          >
            {isPending ? "Please wait..." : "Get Reset Link"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Remembered Password ?{" "}
            <Link to="/login" className="text-[#DB6DC0] hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
