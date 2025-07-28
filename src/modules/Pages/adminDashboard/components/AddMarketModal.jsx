import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import useAddMarketRep from "../../../../hooks/marketRep/useAddMarketRep";
import useToast from "../../../../hooks/useToast";

const initialValues = {
  email: "",
  name: "",
};

const AddMarketModal = ({ isOpen, onClose, businessId }) => {
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isPending, addMarketRepMutate } = useAddMarketRep();
  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    resetForm,
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
      addMarketRepMutate(
        { ...val, business_id: businessId },
        {
          onSuccess: () => {
            onClose();
            resetForm();
          },
        }
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#CCCCCC] pb-3 mb-4">
          <h2 className="text-lg font-semibold">Add a Market Rep</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-black">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              name={"name"}
              required
              value={values.name}
              onChange={handleChange}
            />
          </div>

          <div>
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
          </div>

          {/* <div>
            <label className="block text-black">Phone Number</label>
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-black">
              Alternative Phone Number <small className="text-[#CCCCCC]">(Optional)</small>
            </label>
            <input
              type="tel"
              placeholder="Alternative Phone Number"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-black">Years of Experience in Sales</label>
            <select
              className="w-full p-4 border border-[#CCCCCC] text-gray-500 outline-none mb-3 rounded-lg"
              required
            >
              <option value="">Choose your years of experience</option>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3+ Years</option>
            </select>
          </div>

          <div>
            <label className="block text-black">Address</label>
            <input
              type="text"
              placeholder="Enter your home address"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-black">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-black">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div> */}

          <button
            disabled={isPending}
            className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal"
            type="submit"
          >
            {isPending ? "Please wait..." : " Sign Up As A Market Rep"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMarketModal;
