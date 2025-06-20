import React, { useMemo } from "react";
import useUploadDocument from "../../../../hooks/multimedia/useUploadDocument";
import { useFormik } from "formik";

import Select from "react-select";
import { nigeriaStates } from "../../../../constant";
import useSendKyc from "../../../../hooks/settings/useSendKyc";

const initialValues = {
  doc_front: null,
  doc_front_name: "",

  doc_back: null,
  doc_back_name: "",
  utility_doc: null,
  utility_doc_name: null,

  location: "",
  state: "",
  city: "",
  country: "",
  id_type: "",
};

const KYCVerificationUpdate = () => {
  const { isPending, sendKycMutate } = useSendKyc();

  const { isPending: uploadIsPending, uploadDocumentMutate } =
    useUploadDocument();

  const {
    handleSubmit,
    touched,
    errors,
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
      // Prepare FormData for each file to upload

      const uploads = [val.doc_front, val.doc_back, val.utility_doc];

      const formData = new FormData();

      // Append all files as `documents[]`
      uploads.forEach((file) => {
        if (file) {
          formData.append("documents", file);
        }
      });

      uploadDocumentMutate(formData, {
        onSuccess: (data) => {
          sendKycMutate(
            {
              ...val,
              doc_front: data?.data?.data[0]?.url,
              doc_back: data?.data?.data[1]?.url,
              utility_doc: data?.data?.data[2]?.url,
            },
            {
              onSuccess: () => {
                resetForm();
              },
            }
          );
        },
      });
    },
  });

  return (
    <div className="rounded-lg">
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {" "}
        <h2 className="text-xl font-medium mb-4">KYC Verification</h2>
        {/* ID Upload Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-4">
            National ID / Driver’s License / Passport
          </label>
          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <label
              htmlFor="front"
              className="w-full flex flex-col items-center justify-center p-3 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {values.doc_front_name ? (
                <div className="">{values.doc_front_name}</div>
              ) : (
                ""
              )}
              <input
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFieldValue("doc_front", file);
                    setFieldValue("doc_front_name", file?.name);

                    // You can also set it to state or Formik here
                  }
                }}
                id="front"
                type="file"
                required
                className="hidden"
              />
              <span className="text-gray-700 flex items-center gap-2">
                📤 Upload Front
              </span>
            </label>
            <label
              htmlFor="doc_back"
              className="w-full flex flex-col items-center justify-center p-3 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {values.doc_back_name ? (
                <div className="">{values.doc_back_name}</div>
              ) : (
                ""
              )}
              <input
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFieldValue("doc_back", file);
                    setFieldValue("doc_back_name", file?.name);

                    // You can also set it to state or Formik here
                  }
                }}
                id="doc_back"
                type="file"
                required
                className="hidden"
              />
              <span className="text-gray-700 flex items-center gap-2">
                📤 Upload Back
              </span>
            </label>
          </div>
        </div>
        {/* Utility Bill Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-4">
            Utility Bill (Proof of Address)
          </label>
          <label
            htmlFor="utility_doc"
            className="w-full flex flex-col items-center justify-center p-3 border border-[#CCCCCC] border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {values.utility_doc_name ? (
              <div className="">{values.utility_doc_name}</div>
            ) : (
              ""
            )}
            <input
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFieldValue("utility_doc", file);
                  setFieldValue("utility_doc_name", file?.name);

                  // You can also set it to state or Formik here
                }
              }}
              id="utility_doc"
              type="file"
              required
              className="hidden"
            />
            <span className="text-gray-700 flex items-center gap-2">
              📤 Upload Back
            </span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Country</label>
            <Select
              options={[{ value: "Nigeria", label: "Nigeria" }]}
              name="country"
              value={[{ value: "Nigeria", label: "Nigeria" }]?.find(
                (opt) => opt.value === values.country
              )}
              onChange={(selectedOption) =>
                setFieldValue("country", selectedOption.value)
              }
              placeholder="Select"
              className="p-2 w-full mb-6 border border-[#CCCCCC] outline-none rounded-lg"
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

          <div>
            <label className="block text-gray-700 mb-2">State</label>
            <Select
              options={nigeriaStates}
              name="state"
              value={nigeriaStates?.find((opt) => opt.value === values.state)}
              onChange={(selectedOption) =>
                setFieldValue("state", selectedOption.value)
              }
              placeholder="Select"
              className="p-2 w-full mb-6 border border-[#CCCCCC] outline-none rounded-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">City</label>
            <input
              type="text"
              name={"city"}
              required
              value={values.city}
              onChange={handleChange}
              className="mb-6 w-full p-4  border border-[#CCCCCC] outline-none rounded-lg text-sm"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name={"location"}
              required
              value={values.location}
              onChange={handleChange}
              className="mb-6 w-full p-4  border border-[#CCCCCC] outline-none rounded-lg text-sm"
              placeholder="address"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-gray-700">ID Type</label>
          <select
            name="id_type"
            value={values.id_type}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-md mb-6"
            required
          >
            <option value="" disabled>
              Select
            </option>
            <option value={"national id"}>National ID</option>
            <option value={"driver’s license"}>Driver’s License</option>
            <option value={"passport"}>Passport</option>
          </select>
        </div>
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
          Save Draft
        </button> */}
          <button
            disabled={uploadIsPending || isPending}
            type="submit"
            className="w-full cursor-pointer sm:w-auto px-6 py-3 rounded-lg bg-gradient text-white"
          >
            {uploadIsPending || isPending ? "Please wait..." : "Submit KYC"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCVerificationUpdate;
