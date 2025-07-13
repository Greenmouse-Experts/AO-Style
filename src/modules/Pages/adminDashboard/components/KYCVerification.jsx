import React, { useMemo } from "react";
import useUploadDocument from "../../../../hooks/multimedia/useUploadDocument";
import { useFormik } from "formik";

import Select from "react-select";
import { nigeriaStates } from "../../../../constant";
import useSendKyc from "../../../../hooks/settings/useSendKyc";
import useGetKyc from "../../../../hooks/settings/useGetKyc";
import useUploadImage from "../../../../hooks/multimedia/useUploadImage";

const KYCVerificationUpdate = () => {
  const { data } = useGetKyc();

  const kycInfo = data?.data;

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
    isPending: uploadFrontIsPending,
    uploadImageMutate: uploadFrontMutate,
  } = useUploadImage();

  const {
    isPending: uploadBackIsPending,
    uploadImageMutate: uploadBackMutate,
  } = useUploadImage();

  const {
    isPending: uploadUtilityIsPending,
    uploadImageMutate: uploadUtilityMutate,
  } = useUploadImage();

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

      sendKycMutate(
        {
          ...val,
        },
        {
          onSuccess: () => {
            resetForm();
          },
        }
      );
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div
              onClick={() => document.getElementById("doc_front").click()}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
            >
              <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                <span>⬆️</span> <span>Upload Front</span>
              </p>

              <input
                type="file"
                name="doc_front"
                onChange={(e) => {
                  if (e.target.files) {
                    if (e.target.files[0].size > 5 * 1024 * 1024) {
                      alert("File size exceeds 5MB limit");
                      return;
                    }
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append("image", file);
                    uploadFrontMutate(formData, {
                      onSuccess: (data) => {
                        setFieldValue("doc_front", data?.data?.data?.url);
                      },
                    });
                    e.target.value = "";
                  }
                }}
                className="hidden"
                id="doc_front"
              />

              {uploadFrontIsPending ? (
                <p className="cursor-pointer text-gray-400">please wait... </p>
              ) : values.doc_front ? (
                <a
                  onClick={(e) => e.stopPropagation()}
                  href={values.doc_front}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                >
                  View file upload
                </a>
              ) : (
                <></>
              )}
            </div>

            <div
              onClick={() => document.getElementById("doc_back").click()}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
            >
              <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
                <span>⬆️</span> <span>Upload Back</span>
              </p>

              <input
                type="file"
                name="doc_front"
                onChange={(e) => {
                  if (e.target.files) {
                    if (e.target.files[0].size > 5 * 1024 * 1024) {
                      alert("File size exceeds 5MB limit");
                      return;
                    }
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append("image", file);
                    uploadBackMutate(formData, {
                      onSuccess: (data) => {
                        setFieldValue("doc_back", data?.data?.data?.url);
                      },
                    });
                    e.target.value = "";
                  }
                }}
                className="hidden"
                id="doc_back"
              />

              {uploadBackIsPending ? (
                <p className="cursor-pointer text-gray-400">please wait... </p>
              ) : values.doc_back ? (
                <a
                  onClick={(e) => e.stopPropagation()}
                  href={values.doc_back}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                >
                  View file upload
                </a>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        {/* Utility Bill Upload */}
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-4">
            Utility Bill (Proof of Address)
          </label>
          <div
            onClick={() => document.getElementById("utility_doc").click()}
            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg flex flex-col items-center"
          >
            <p className="cursor-pointer flex flex-col items-center space-y-2 text-gray-500">
              <span>⬆️</span> <span>Upload Utility Bill</span>
            </p>

            <input
              type="file"
              name="utility_doc"
              onChange={(e) => {
                if (e.target.files) {
                  if (e.target.files[0].size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5MB limit");
                    return;
                  }
                  const file = e.target.files[0];
                  const formData = new FormData();
                  formData.append("image", file);
                  uploadUtilityMutate(formData, {
                    onSuccess: (data) => {
                      setFieldValue("utility_doc", data?.data?.data?.url);
                    },
                  });
                  e.target.value = "";
                }
              }}
              className="hidden"
              id="utility_doc"
            />
            {uploadUtilityIsPending ? (
              <p className="cursor-pointer text-gray-400">please wait... </p>
            ) : values.utility_doc ? (
              <a
                onClick={(e) => e.stopPropagation()}
                href={values.utility_doc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 flex justify-center cursor-pointer hover:underline"
              >
                View file upload
              </a>
            ) : (
              <></>
            )}
          </div>
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
