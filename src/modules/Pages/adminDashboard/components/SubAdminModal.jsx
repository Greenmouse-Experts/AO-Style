import React from "react";
import { useState, useEffect } from "react";
import useCreateSubAdmin from "../../../../hooks/admin/useCreateSubAdmin";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import useGetAdminRoles from "../../../../hooks/admin/useGetAdminRoles";
import Select from "react-select";
import useEditAdminRole from "../../../../hooks/admin/useEditAdminRole";
import useToast from "../../../../hooks/useToast";

const SubAdminModal = ({ isOpen, onClose, newCategory }) => {
  console.log(newCategory?.admin_role?.id);
  const { isPending: createIsPending, createSubAdminMutate } =
    useCreateSubAdmin();

  const { isPending: editIsPending, editAdminRoleMutate } = useEditAdminRole();

  const [showPassword, setShowPassword] = useState(false);

  const { data, isPending } = useGetAdminRoles({
    "pagination[limit]": 1000,
    "pagination[page]": 1,
  });

  const options = data?.data?.map((role) => ({
    label: role.title,
    value: role.id,
  }));

  const initialValues = {
    name: newCategory?.name ?? "",
    email: newCategory?.email ?? "",
    password: "",
    confirm_password: "",
    phone: newCategory?.phone ?? "",
    admin_role_id: newCategory?.admin_role?.id ?? "",
    role: "owner-administrator",
  };

  const { toastError } = useToast();

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
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      if (newCategory) {
        editAdminRoleMutate(
          { user_id: newCategory?.id, admin_role_id: val.admin_role_id },
          {
            onSuccess: () => {
              resetForm();
              onClose();
            },
          }
        );
      } else {
        createSubAdminMutate(val, {
          onSuccess: () => {
            resetForm();
            onClose();
          },
        });
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
      onClick={() => {
        onClose();
        resetForm();
      }}
    >
      <div
        className="bg-white rounded-LG p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {newCategory ? "Edit" : "Add a New"} Admin
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Admin Information
          </h3>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Admin Name
                </label>
                <input
                  type="text"
                  name="name"
                  disabled={newCategory ? true : false}
                  value={values.name}
                  onChange={handleChange}
                  className="w-full p-4 border disabled:bg-gray-100 border-[#CCCCCC] outline-none rounded-lg"
                  placeholder="Enter the admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Admin Email
                </label>
                <input
                  disabled={newCategory ? true : false}
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className="w-full p-4 border disabled:bg-gray-100 border-[#CCCCCC] outline-none rounded-lg"
                  placeholder="Enter the admin email"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  name={"password"}
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  placeholder="Enter the password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-13 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Phone
                </label>

                <PhoneInput
                  country={"ng"}
                  disabled={newCategory ? true : false}
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
                {/* <div className="flex items-center border border-gray-300 rounded-md">
                  <select
                    name="countryCode"
                    value="+234"
                    onChange={handleInputChange}
                    className="p-4 border-r border-gray-300 rounded-l-md text-sm bg-gradient text-white"
                  >
                    <option value="+234">+234</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+81">+81</option>
                    <option value="+33">+33</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-4 rounded-r-md outline-none text-sm"
                    placeholder="8023456789"
                  />
                </div> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Admin Role
                </label>
                <Select
                  options={options}
                  name="admin_role_id"
                  value={options?.find(
                    (opt) => opt.value === values.admin_role_id
                  )}
                  onChange={(selectedOption) =>
                    setFieldValue("admin_role_id", selectedOption.value)
                  }
                  placeholder="Select"
                  className="p-2 w-full border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
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
              </div>
            </div>
            <div className="flex justify-between mt-6 space-x-4">
              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="w-full bg-purple-400 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createIsPending || editIsPending}
                className="w-full bg-gradient cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {createIsPending || editIsPending
                  ? "Please wait..."
                  : newCategory
                  ? "Edit "
                  : "Add Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubAdminModal;
