import React, { useMemo } from "react";
import useUploadDocument from "../../../../hooks/multimedia/useUploadDocument";
import { useFormik } from "formik";

import Select from "react-select";
import { nigeriaStates } from "../../../../constant";
import useSendKyc from "../../../../hooks/settings/useSendKyc";
import useGetKyc from "../../../../hooks/settings/useGetKyc";

const KYCVerificationUpdate = () => {
  const { data } = useGetKyc();

  const kycInfo = data?.data;

  console.log(kycInfo);

  const initialValues = {
    doc_front: kycInfo?.doc_front ?? null,
    front_upload: null,
    doc_front_name: "",
    doc_back: kycInfo?.doc_back ?? null,
    back_upload: null,
    doc_back_name: "",
    utility_doc: kycInfo?.utility_doc ?? null,
    utility_upload: null,

    utility_doc_name: null,

    location: kycInfo?.location ?? "",
    state: kycInfo?.state ?? "",
    city: kycInfo?.city ?? "",
    country: kycInfo?.country ?? "",
    id_type: kycInfo?.id_type ?? "",
  };

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

      const uploads = [val.front_upload, val.back_upload, val.utility_upload];

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
              doc_front: data?.data?.data[0]?.url ?? val.doc_front,
              doc_back: data?.data?.data[1]?.url ?? val.doc_back,
              utility_doc: data?.data?.data[2]?.url ?? val.utility_doc,
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
        <div>
          <label className="block mb-2 text-gray-700">ID Type</label>
          {/* <select
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
          </select> */}
          <Select
            options={[
              { label: "National ID", value: "national id" },
              { label: "Driver’s License", value: "driver’s license" },
              { label: "Passport", value: "passport" },
            ]}
            name="id_type"
            value={[
              { label: "National ID", value: "national id" },
              { label: "Driver’s License", value: "driver’s license" },
              { label: "Passport", value: "passport" },
            ]?.find((opt) => opt.value === values.id_type)}
            onChange={(selectedOption) => {
              setFieldValue("id_type", selectedOption.value);
            }}
            isSearchable={false}
            required
            placeholder="Select"
            className="w-full p-2 border border-gray-300 rounded-md mb-6"
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
        <div className="mb-6">
          {/* <label className="block text-gray-700 mb-4">
            {values?.id_type == "driver’s license"
              ? "Driver’s License"
              : values?.id_type == "national id"
              ? "National ID"
              : "Passport"}{" "}
          </label> */}
          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col w-full">
              {values?.doc_front ? (
                <a
                  href={values?.doc_front}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 flex justify-end cursor-pointer hover:underline"
                >
                  View file upload
                </a>
              ) : (
                <></>
              )}
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
                      setFieldValue("front_upload", file);
                      setFieldValue("doc_front_name", file?.name);

                      // You can also set it to state or Formik here
                    }
                  }}
                  id="front"
                  type="file"
                  required={values?.doc_front ? false : true}
                  className="hidden"
                />
                <span className="text-gray-700 flex items-center gap-2">
                  📤 Upload Front
                </span>
              </label>
            </div>
            <div className="flex flex-col w-full">
              {" "}
              {values?.doc_back ? (
                <a
                  href={values?.doc_back}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 flex justify-end cursor-pointer hover:underline"
                >
                  View file upload
                </a>
              ) : (
                <></>
              )}
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
                      setFieldValue("back_upload", file);
                      setFieldValue("doc_back_name", file?.name);

                      // You can also set it to state or Formik here
                    }
                  }}
                  id="doc_back"
                  type="file"
                  required={values?.doc_back ? false : true}
                  className="hidden"
                />
                <span className="text-gray-700 flex items-center gap-2">
                  📤 Upload Back
                </span>
              </label>
            </div>
          </div>
        </div>
        {/* Utility Bill Upload */}
        <div className="mb-6">
          <div className="justify-between flex mb-2">
            {" "}
            <label className="block text-gray-700">
              Utility Bill (Proof of Address)
            </label>
            {values?.utility_doc ? (
              <a
                href={values?.utility_doc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 flex justify-end cursor-pointer hover:underline"
              >
                View file upload
              </a>
            ) : (
              <></>
            )}
          </div>

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
                  setFieldValue("utility_upload", file);
                  setFieldValue("utility_doc_name", file?.name);

                  // You can also set it to state or Formik here
                }
              }}
              id="utility_doc"
              type="file"
              required={values?.utility_doc ? false : true}
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
            <label className="block text-gray-700 mb-2">Business Address</label>
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
