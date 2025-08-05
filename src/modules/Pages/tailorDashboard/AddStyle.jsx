import React, { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ModalThanks from "./components/ModalThanks";
import { useFormik } from "formik";
import Select from "react-select";
import { usePlacesWidget } from "react-google-autocomplete";

import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";

import useCreateStyleProduct from "../../../hooks/style/useCreateStyle";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";

import useGetProducts from "../../../hooks/product/useGetProduct";

import useUploadImage from "../../../hooks/multimedia/useUploadImage";

import useToast from "../../../hooks/useToast";
import useUpdateStyle from "../../../hooks/style/useUpdateStyle";
import useUpdateAdminStyle from "../../../hooks/style/useUpdateAdminStyle";
import useCreateAdminStyle from "../../../hooks/style/useCreateAdminStyle";

export default function StyleForm() {
  const { toastError } = useToast();
  const location = useLocation();

  const isAdminAddRoute = location.pathname === "/admin/style/add-product";

  const isAdminEditRoute = location.pathname === "/admin/style/edit-product";

  const styleInfo = location?.state?.info;

  const initialValues = {
    type: "STYLE",
    name: styleInfo?.name ?? "",
    category_id: styleInfo?.category?.id ?? "",
    description: styleInfo?.description ?? "",
    gender: styleInfo?.gender ?? "",
    tags: styleInfo?.tags ?? [],
    price: styleInfo?.price ?? "",
    weight_per_unit: "",
    local_name: "",
    manufacturer_name: "",
    material_type: "",
    alternative_names: "",
    fabric_texture: "",
    feel_a_like: "",
    quantity: "",
    minimum_yards: "",
    minimum_fabric_qty: styleInfo?.style?.minimum_fabric_qty ?? "",
    available_colors: "",
    fabric_colors: "",
    photos: [],
    video_url: styleInfo?.style?.video_url ?? "",
    original_price: "",
    sku: styleInfo?.sku ?? "",
    multimedia_url: "",
    estimated_sewing_time: styleInfo?.style?.estimated_sewing_time ?? "",
    front_url: styleInfo?.style?.photos[0] ?? "",
    back_url: styleInfo?.style?.photos[1] ?? "",
    right_url: styleInfo?.style?.photos[2] ?? "",
    left_url: styleInfo?.style?.photos[3] ?? "",
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sewingTime, setSewingTime] = useState("");

  const { data: businessDetails } = useGetBusinessDetails();

  const { isPending, createStyleProductMutate } = useCreateStyleProduct(
    businessDetails?.data?.id,
  );

  const { isPending: createIsPending, createAdminStyleProductMutate } =
    useCreateAdminStyle();

  const navigate = useNavigate();

  const { isPending: uploadVideoIsPending, uploadVideoMutate } =
    useUploadVideo();

  const {
    isPending: uploadFrontIsPending,
    uploadImageMutate: uploadFrontMutate,
  } = useUploadImage();

  const {
    isPending: uploadBackIsPending,
    uploadImageMutate: uploadBackMutate,
  } = useUploadImage();

  const {
    isPending: uploadRightIsPending,
    uploadImageMutate: uploadRightMutate,
  } = useUploadImage();

  const {
    isPending: uploadLeftIsPending,
    uploadImageMutate: uploadLeftMutate,
  } = useUploadImage();

  const { isPending: updateIsPending, updateStyleMutate } = useUpdateStyle();

  const { isPending: updateAdminIsPending, updateAdminStyleMutate } =
    useUpdateAdminStyle();

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
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      if (
        !values.front_url ||
        !values.back_url ||
        !values.left_url ||
        !values.right_url
      ) {
        toastError("Please upload all required images.");
        return;
      }
      if (styleInfo) {
        if (isAdminEditRoute) {
          updateAdminStyleMutate(
            {
              id: styleInfo?.id,
              product: {
                type: val.type,
                name: val.name,
                category_id: val.category_id,
                sku: val.sku,
                description: val.description,
                gender: val.gender,
                tags: val.tags,
                price: val.price?.toString(),
                original_price: val.price?.toString(),
                status: styleInfo?.status,
              },
              style: {
                estimated_sewing_time: val.estimated_sewing_time,
                minimum_fabric_qty: val.minimum_fabric_qty,
                photos: [
                  val.front_url,
                  val.back_url,
                  val.right_url,
                  val.left_url,
                ],

                video_url: val.video_url,
              },
            },
            {
              onSuccess: () => {
                resetForm();
                navigate(-1);
              },
            },
          );
        } else {
          updateStyleMutate(
            {
              id: styleInfo?.id,
              business_id: businessDetails?.data?.id,
              product: {
                type: val.type,
                name: val.name,
                category_id: val.category_id,
                sku: val.sku,
                description: val.description,
                gender: val.gender,
                tags: val.tags,
                price: val.price?.toString(),
                original_price: val.price?.toString(),
                status: styleInfo?.status,
              },
              style: {
                estimated_sewing_time: val.estimated_sewing_time,
                minimum_fabric_qty: val.minimum_fabric_qty,
                photos: [
                  val.front_url,
                  val.back_url,
                  val.right_url,
                  val.left_url,
                ],

                video_url: val.video_url,
              },
            },
            {
              onSuccess: () => {
                resetForm();
                navigate(-1);
              },
            },
          );
        }
      } else {
        if (isAdminAddRoute) {
          createAdminStyleProductMutate(
            {
              product: {
                type: val.type,
                name: val.name,
                category_id: val.category_id,
                sku: val.sku,
                description: val.description,
                gender: val.gender,
                tags: val.tags,
                price: val.price?.toString(),
                original_price: val.price?.toString(),
              },
              style: {
                estimated_sewing_time: val.estimated_sewing_time,
                minimum_fabric_qty: val.minimum_fabric_qty,
                photos: [
                  val.front_url,
                  val.back_url,
                  val.right_url,
                  val.left_url,
                ],

                video_url: val.video_url,
              },
            },
            {
              onSuccess: () => {
                resetForm();
                navigate(-1);
              },
            },
          );
        } else {
          createStyleProductMutate(
            {
              product: {
                type: val.type,
                name: val.name,
                category_id: val.category_id,
                sku: val.sku,
                description: val.description,
                gender: val.gender,
                tags: val.tags,
                price: val.price?.toString(),
                original_price: val.price?.toString(),
              },
              style: {
                estimated_sewing_time: val.estimated_sewing_time,
                minimum_fabric_qty: val.minimum_fabric_qty,
                photos: [
                  val.front_url,
                  val.back_url,
                  val.right_url,
                  val.left_url,
                ],

                video_url: val.video_url,
              },
            },
            {
              onSuccess: () => {
                resetForm();
                navigate(-1);
              },
            },
          );
        }
      }
    },
  });

  // Mock function to fetch sewing time based on category
  useEffect(() => {
    const sewingTimes = {
      casual: 3,
      formal: 5,
      traditional: 7,
    };
    setSewingTime(sewingTimes[selectedCategory] || "");
  }, [selectedCategory]);

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setFieldValue("tags", [...tags, tagInput.trim()]);

      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setFieldValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const { data: styleCategory } = useGetProducts({
    "pagination[limit]": 10000,
    type: "style",
  });

  const categoryList = styleCategory?.data
    ? styleCategory?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      setFieldValue("location", place.formatted_address);
      setFieldValue("latitude", place.geometry?.location?.lat().toString());
      setFieldValue("longitude", place.geometry?.location?.lng().toString());
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  return (
    <>
      <div className="bg-white p-6 mb-6 rounded-lg">
        <h1 className="text-xl md:text-2xl font-medium mb-3">
          {styleInfo && !isAdminEditRoute
            ? "Edit"
            : isAdminEditRoute
              ? "View"
              : "Add"}{" "}
          Styles
        </h1>
        <p className="text-gray-500 text-sm">
          <Link to="/tailor" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; My Catalog &gt;{" "}
          {styleInfo && !isAdminEditRoute
            ? "Edit"
            : isAdminEditRoute
              ? "View"
              : "Add"}{" "}
          Style
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg max-w-2xl">
        <h1 className="text-lg font-semibold text-black mb-4">
          {styleInfo && !isAdminEditRoute
            ? "Edit"
            : isAdminEditRoute
              ? "View"
              : "Submit New"}{" "}
          Style
        </h1>

        <div className="space-y-4">
          <form onSubmit={handleSubmit}>
            {/* Style Name */}
            <div>
              <label className="block text-gray-700 mb-4">Style Name</label>
              <input
                type="text"
                name={"name"}
                value={values.name}
                onChange={handleChange}
                placeholder="Enter the name of style"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                required
              />
            </div>
            {/* SKU (Disabled) */}
            {/* <div>
              <label className="block text-gray-700 mb-4 mt-4">SKU</label>
              <input
                type="text"
                required


                name="sku"
                value={values.sku}
                onChange={handleChange}
                placeholder="Enter the unique identifier"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              />
            </div> */}
            {/* Style Description */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Style Description
              </label>
              <textarea
                placeholder="Enter the style description"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 outline-none"
                type="text"
                required
                name={"description"}
                value={values.description}
                onChange={handleChange}
              />
            </div>
            {/* Style Category and Estimated Sewing Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-4 mt-4">
                  Style Category
                </label>
                <Select
                  options={categoryList}
                  name="category_id"
                  value={categoryList?.find(
                    (opt) => opt.value == values.category_id,
                  )}
                  onChange={(selectedOption) => {
                    setFieldValue("category_id", selectedOption.value);
                  }}
                  required
                  placeholder="Choose style"
                  className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
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
                <label className="block text-gray-700 mb-4 mt-4">
                  Estimated Sewing Time (days)
                </label>
                <input
                  type="number"
                  name={"estimated_sewing_time"}
                  required
                  min={0}
                  value={values.estimated_sewing_time}
                  onChange={handleChange}
                  placeholder="Estimated sewing time"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>
            {/* Gender */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">Gender</label>
              <Select
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Unisex", value: "unisex" },
                ]}
                name="gender"
                isSearchable={false}
                value={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Unisex", value: "unisex" },
                ]?.find((opt) => opt.value === values.gender)}
                onChange={(selectedOption) => {
                  setFieldValue("gender", selectedOption.value);
                }}
                required
                placeholder="Choose suitability gender"
                className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
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
            {/* Photo Uploads */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Upload Style Photos
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  {/* ⓘ Icon with tooltip */}
                  <div className="absolute top-2 right-2 group">
                    <div className="text-gray-500 text-sm cursor-pointer">
                      ⓘ
                    </div>
                    <div className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 whitespace-nowrap">
                      Note: This is the first Style to appear on home page
                    </div>
                  </div>

                  {/* Upload Box */}
                  <div
                    onClick={() => document.getElementById("front").click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
                  >
                    <UploadCloud
                      className="mx-auto text-gray-400 mb-4"
                      size={32}
                    />
                    <p className="text-xs mb-2">
                      Front Side Style
                      <br />
                      (Less than 5MB)
                    </p>

                    <input
                      type="file"
                      id="front"
                      accept="image/*"
                      className="mt-2 w-full hidden"
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
                              setFieldValue("front_url", data?.data?.data?.url);
                            },
                          });
                          e.target.value = "";
                        }
                      }}
                    />

                    {uploadFrontIsPending ? (
                      <p className="cursor-pointer text-gray-400">
                        please wait...{" "}
                      </p>
                    ) : values.front_url ? (
                      <a
                        href={values.front_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    ) : null}

                    {values?.front_url && (
                      <>
                        <img
                          src={values.front_url}
                          className="mx-auto h-40"
                          alt=""
                        />
                      </>
                    )}
                  </div>
                </div>
                <div
                  onClick={() => document.getElementById("back").click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
                >
                  <UploadCloud
                    className="mx-auto text-gray-400 mb-4"
                    size={32}
                  />
                  <p className="text-xs mb-2">
                    Back Side Style
                    <br />
                    (Less than 5MB)
                  </p>
                  <input
                    type="file"
                    id="back"
                    accept="image/*"
                    className="mt-2 w-full hidden"
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
                            setFieldValue("back_url", data?.data?.data?.url);
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />
                  {uploadBackIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.back_url ? (
                    <a
                      href={values.back_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                    >
                      View file upload
                    </a>
                  ) : (
                    <></>
                  )}
                  {values?.back_url && (
                    <>
                      <img
                        src={values.back_url}
                        className="mx-auto h-40"
                        alt=""
                      />
                    </>
                  )}
                </div>
                <div
                  onClick={() => document.getElementById("right").click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
                >
                  <UploadCloud
                    className="mx-auto text-gray-400 mb-4"
                    size={32}
                  />
                  <p className="text-xs mb-2">
                    Right Side Style
                    <br />
                    (Less than 5MB)
                  </p>
                  <input
                    type="file"
                    id="right"
                    accept="image/*"
                    className="mt-2 w-full hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        uploadRightMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValue("right_url", data?.data?.data?.url);
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />
                  {uploadRightIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.right_url ? (
                    <a
                      href={values.right_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                    >
                      View file upload
                    </a>
                  ) : (
                    <></>
                  )}
                  {values?.right_url && (
                    <>
                      <img
                        src={values.front_url}
                        className="mx-auto h-40"
                        alt=""
                      />
                    </>
                  )}
                </div>
                <div
                  onClick={() => document.getElementById("left").click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer"
                >
                  <UploadCloud
                    className="mx-auto text-gray-400 mb-4"
                    size={32}
                  />
                  <p className="text-xs mb-2">
                    Left Side Style
                    <br />
                    (Less than 5MB)
                  </p>
                  <input
                    type="file"
                    id="left"
                    accept="image/*"
                    className="mt-2 w-full hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        uploadLeftMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValue("left_url", data?.data?.data?.url);
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />
                  {uploadLeftIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.left_url ? (
                    <a
                      href={values.left_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                    >
                      View file upload
                    </a>
                  ) : (
                    <></>
                  )}
                  {values?.left_url && (
                    <>
                      <img
                        src={values.left_url}
                        className="mx-auto h-40"
                        alt=""
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Upload a video of the style (max length of 10secs)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
                {/* Only this triggers file upload */}
                <div
                  //   onClick={() => document.getElementById("uploadVideo").click()}
                  className="flex flex-col items-center"
                >
                  <UploadCloud
                    className="mx-auto text-gray-400 mb-4"
                    size={32}
                  />
                  <label
                    htmlFor="uploadVideo"
                    className="text-xs mb-2 cursor-pointer"
                  >
                    Upload video (Less than 10MB)
                  </label>
                </div>

                <input
                  type="file"
                  id="uploadVideo"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert("File size exceeds 10MB limit");
                        return;
                      }
                      const formData = new FormData();
                      formData.append("video", file);
                      uploadVideoMutate(formData, {
                        onSuccess: (data) => {
                          setFieldValue("video_url", data?.data?.data?.url);
                          e.target.value = "";
                        },
                      });
                    }
                  }}
                />

                {uploadVideoIsPending ? (
                  <p className="text-gray-400 mt-2">please wait...</p>
                ) : values.video_url ? (
                  <a
                    href={values.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 mt-2 block hover:underline"
                  >
                    View file upload
                  </a>
                ) : null}
                {values?.video_url && (
                  <>
                    <video
                      controls
                      src={values.video_url}
                      className="mt-4 mx-auto  h-40"
                      alt=""
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Minimum Fabric Quantity Required (Yards)
              </label>
              <input
                type="number"
                name={"minimum_fabric_qty"}
                value={values.minimum_fabric_qty}
                onChange={handleChange}
                placeholder="Enter the minimum fabric required for this style"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                required
              />
            </div>
            {/* Tags */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Tags (max 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {values?.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-blue-800 hover:text-blue-900"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              {tags.length < 5 && (
                <input
                  type="text"
                  placeholder="Add a tag and press Enter (max 5)"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  value={tagInput}
                  onChange={handleTagInput}
                  onKeyDown={handleTagAdd}
                />
              )}
            </div>
            {/* Price */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">Price</label>
              <div className="flex items-center gap-2">
                <span className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                  NGN
                </span>
                <input
                  type="number"
                  name={"price"}
                  min={0}
                  value={values.price}
                  onChange={handleChange}
                  placeholder="Enter amount per unit"
                  className="flex-1 p-4 border border-[#CCCCCC] rounded-lg px-4 py-2 outline-none"
                  required
                />
              </div>
            </div>
            {/* Location */}
            {/* <div>
              <label className="block text-gray-700 mb-4 mt-4">Location</label>
              <input
                type="text"
                ref={(c) => {
                  if (c) ref.current = c.input;
                }}
                value={values.location}
                name="location"
                onChange={(val) => {
                  setFieldValue("location", val.currentTarget.value);
                  setFieldValue("latitude", "");
                  setFieldValue("longitude", "");
                }}
                placeholder="Enter the coordinates of the shop"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              />
            </div> */}
            {/* Modal and Submit Button */}
            <ModalThanks
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />

            {isAdminEditRoute ? (
              <></>
            ) : (
              <>
                {" "}
                <button
                  disabled={
                    isPending ||
                    uploadVideoIsPending ||
                    uploadFrontIsPending ||
                    uploadBackIsPending ||
                    uploadRightIsPending ||
                    uploadLeftIsPending ||
                    updateIsPending ||
                    updateAdminIsPending ||
                    createIsPending
                  }
                  type="submit"
                  className="bg-gradient text-white px-6 py-2 rounded w-full md:w-fit mt-4 cursor-pointer"
                >
                  {isPending ||
                  updateIsPending ||
                  updateAdminIsPending ||
                  createIsPending
                    ? "Please wait..."
                    : styleInfo
                      ? "Edit Style"
                      : "Submit Style"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
