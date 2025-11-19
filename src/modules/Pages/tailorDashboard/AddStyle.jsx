import React, { useState, useEffect, useRef } from "react";
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
import CustomBackbtn from "../../../components/CustomBackBtn";

// Custom hook for form auto-save functionality
const useFormAutoSave = (formId, initialValues, isEditMode = false) => {
  const [savedData, setSavedData] = useState({});
  const storageKey = `form_autosave_${formId}`;

  // Load saved data on component mount
  useEffect(() => {
    if (!isEditMode) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          setSavedData(parsedData);
        }
      } catch (error) {
        console.error("Error loading saved form data:", error);
        // Clear corrupted data
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, isEditMode]);

  // Save data function
  const saveFormData = (data) => {
    if (!isEditMode) {
      try {
        // Only save non-empty, meaningful data
        const filteredData = Object.entries(data).reduce(
          (acc, [key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
              if (Array.isArray(value) && value.length > 0) {
                acc[key] = value;
              } else if (!Array.isArray(value)) {
                acc[key] = value;
              }
            }
            return acc;
          },
          {},
        );

        if (Object.keys(filteredData).length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(filteredData));
          setSavedData(filteredData);
        }
      } catch (error) {
        console.error("Error saving form data:", error);
      }
    }
  };

  // Clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(storageKey);
      setSavedData({});
    } catch (error) {
      console.error("Error clearing saved data:", error);
    }
  };

  // Get initial values (merge saved data with initial values)
  const getInitialValues = () => {
    if (isEditMode || Object.keys(savedData).length === 0) {
      return initialValues;
    }
    return { ...initialValues, ...savedData };
  };

  return {
    savedData,
    saveFormData,
    clearSavedData,
    getInitialValues,
    hasSavedData: Object.keys(savedData).length > 0,
  };
};

export default function StyleForm() {
  const { toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminAddRoute = location.pathname === "/admin/style/add-product";
  const isAdminEditRoute = location.pathname === "/admin/style/edit-product";
  const styleInfo = location?.state?.info;
  const isEditMode = !!styleInfo;

  // Console log the prefilled data when in edit mode
  if (isEditMode && styleInfo) {
    console.log("=== PREFILLED DATA IN EDIT MODE ===");
    console.log("Complete styleInfo object:", styleInfo);
    console.log("Style name:", styleInfo?.name);
    console.log("Style category:", styleInfo?.category);
    console.log("Style description:", styleInfo?.description);
    console.log("Style gender:", styleInfo?.gender);
    console.log("Style tags:", styleInfo?.tags);
    console.log("Style price:", styleInfo?.price);
    console.log(
      "Style minimum_fabric_qty:",
      styleInfo?.style?.minimum_fabric_qty,
    );
    console.log("Style video_url:", styleInfo?.style?.video_url);
    console.log(
      "Style estimated_sewing_time:",
      styleInfo?.style?.estimated_sewing_time,
    );
    console.log("Style photos:", styleInfo?.style?.photos);
    console.log("--- FIXED FIELD MAPPINGS ---");
    console.log("Category (original):", styleInfo?.category);
    console.log("Price (original_price):", styleInfo?.original_price);
    console.log("Price type:", typeof styleInfo?.original_price);

    // Parse price from formatted string
    const parsedPrice = styleInfo?.original_price
      ? parseFloat(styleInfo.original_price.replace(/[₦,]/g, ""))
      : null;
    console.log("Price (parsed numeric):", parsedPrice);
    console.log(
      "Estimated sewing time (raw):",
      styleInfo?.style?.estimated_sewing_time,
    );
    if (styleInfo?.style?.estimated_sewing_time) {
      const timeValue =
        new Date(styleInfo.style.estimated_sewing_time).getHours() +
        new Date(styleInfo.style.estimated_sewing_time).getMinutes() / 60;
      console.log("Estimated sewing time (converted):", timeValue);
    }
    console.log("====================================");
  }

  const baseInitialValues = {
    type: "STYLE",
    name: styleInfo?.name ?? "",
    category_id: "",
    description: styleInfo?.description ?? "",
    gender: styleInfo?.gender ?? "",
    tags: styleInfo?.tags ?? [],
    price: styleInfo?.price
      ? parseFloat(styleInfo.price.replace(/[₦,]/g, ""))
      : "",
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
    // sku: styleInfo?.sku ?? "",
    multimedia_url: "",
    estimated_sewing_time: styleInfo?.style?.estimated_sewing_time
      ? new Date(styleInfo.style.estimated_sewing_time).getHours() +
        new Date(styleInfo.style.estimated_sewing_time).getMinutes() / 60
      : "",
    front_url: styleInfo?.style?.photos[0] ?? "",
    back_url: styleInfo?.style?.photos[1] ?? "",
    right_url: styleInfo?.style?.photos[2] ?? "",
    left_url: styleInfo?.style?.photos[3] ?? "",
  };

  // Auto-save functionality
  const { saveFormData, clearSavedData, getInitialValues, hasSavedData } =
    useFormAutoSave("style_form", baseInitialValues, isEditMode);

  // Console log the initial values being used by the form
  if (isEditMode) {
    console.log("=== FORM INITIAL VALUES ===");
    console.log("baseInitialValues:", baseInitialValues);
    console.log("getInitialValues():", getInitialValues());
    console.log("===========================");
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sewingTime, setSewingTime] = useState("");
  const [showSavedDataNotice, setShowSavedDataNotice] = useState(false);

  // Auto-save timer ref
  const autoSaveTimer = useRef(null);

  const { data: businessDetails } = useGetBusinessDetails();

  const { isPending, createStyleProductMutate } = useCreateStyleProduct(
    businessDetails?.data?.id,
  );

  const { isPending: createIsPending, createAdminStyleProductMutate } =
    useCreateAdminStyle();

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

  // Auto-save function with debouncing
  const autoSave = (formValues) => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      saveFormData(formValues);
    }, 1000); // Save after 1 second of no changes
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    resetForm,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: getInitialValues(),
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

      const submitData = {
        product: {
          type: val.type,
          name: val.name,
          category_id: val.category_id,
          // sku: val.sku,
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
          photos: [val.front_url, val.back_url, val.right_url, val.left_url],
          video_url: val.video_url,
        },
      };

      const onSuccessCallback = () => {
        clearSavedData(); // Clear saved data on successful submission
        resetForm();
        navigate(
          -1,
          // isAdminEditRoute
          //   ? "/tailor/catalog?pagination[page]=1&pagination[limit]=10"
          //   : -1,
        );
      };

      if (styleInfo) {
        if (isAdminEditRoute) {
          updateAdminStyleMutate(
            { id: styleInfo?.id, ...submitData },
            { onSuccess: onSuccessCallback },
          );
        } else {
          updateStyleMutate(
            {
              id: styleInfo?.id,
              business_id: businessDetails?.data?.id,
              ...submitData,
            },
            { onSuccess: onSuccessCallback },
          );
        }
      } else {
        if (isAdminAddRoute) {
          createAdminStyleProductMutate(submitData, {
            onSuccess: onSuccessCallback,
          });
        } else {
          createStyleProductMutate(submitData, {
            onSuccess: onSuccessCallback,
          });
        }
      }
    },
  });

  // Enhanced handleChange with auto-save
  const handleChangeWithAutoSave = (e) => {
    handleChange(e);
    const updatedValues = { ...values, [e.target.name]: e.target.value };
    autoSave(updatedValues);
  };

  // Enhanced setFieldValue with auto-save
  const setFieldValueWithAutoSave = (field, value) => {
    setFieldValue(field, value);
    const updatedValues = { ...values, [field]: value };
    autoSave(updatedValues);
  };

  // Show saved data notice on component mount
  useEffect(() => {
    if (hasSavedData && !isEditMode) {
      setShowSavedDataNotice(true);
      setTimeout(() => setShowSavedDataNotice(false), 5000);
    }
  }, [hasSavedData, isEditMode]);

  // Log form values changes in edit mode
  useEffect(() => {
    if (isEditMode && values) {
      console.log("=== FORM VALUES CHANGED ===");
      console.log("Current form values:", values);
      console.log("===========================");
    }
  }, [values, isEditMode]);

  // Update tags state when values change
  useEffect(() => {
    setTags(values.tags || []);
  }, [values.tags]);

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
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setFieldValueWithAutoSave("tags", newTags);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setFieldValueWithAutoSave("tags", newTags);
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

  // Set category_id and price when categoryList is available in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      styleInfo &&
      categoryList.length > 0 &&
      !values.category_id
    ) {
      const foundCategory = categoryList.find(
        (cat) => cat.label.toLowerCase() === styleInfo?.category?.toLowerCase(),
      );

      if (foundCategory) {
        console.log("=== CATEGORY MAPPING DEBUG ===");
        console.log("Available categoryList:", categoryList);
        console.log("Looking for category:", styleInfo?.category);
        console.log("Found matching category:", foundCategory);

        console.log("=== SETTING CATEGORY ID AND PRICE ===");
        console.log("Found category:", foundCategory);
        console.log("Setting category_id to:", foundCategory.value);
        setFieldValue("category_id", foundCategory.value);

        if (styleInfo?.original_price) {
          const priceValue = parseFloat(
            styleInfo.original_price.replace(/[₦,]/g, ""),
          );
          console.log("Setting price to:", priceValue);
          setFieldValue("price", priceValue);
        }

        console.log("===============================");
      }
    }
  }, [categoryList, styleInfo, isEditMode, values.category_id, setFieldValue]);

  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      setFieldValueWithAutoSave("location", place.formatted_address);
      setFieldValueWithAutoSave(
        "latitude",
        place.geometry?.location?.lat().toString(),
      );
      setFieldValueWithAutoSave(
        "longitude",
        place.geometry?.location?.lng().toString(),
      );
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  // Clear saved data function for manual clearing
  const handleClearSavedData = () => {
    clearSavedData();
    setValues(baseInitialValues);
    setTags([]);
  };

  return (
    <>
      <div className="mb-2">
        <CustomBackbtn />
      </div>

      {/* Saved Data Notice */}
      {showSavedDataNotice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-blue-800 mr-2">ℹ️</div>
            <span className="text-blue-800 text-sm">
              We've restored your previously saved form data. You can continue
              where you left off.
            </span>
          </div>
          <button
            onClick={handleClearSavedData}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Start Fresh
          </button>
        </div>
      )}

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-black">
            {styleInfo && !isAdminEditRoute
              ? "Edit"
              : isAdminEditRoute
                ? "View"
                : "Submit New"}{" "}
            Style
          </h1>
          {hasSavedData && !isEditMode && (
            <div className="text-sm text-green-600 flex items-center">
              <span className="mr-1">💾</span>
              Auto-saved
            </div>
          )}
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit}>
            {/* Style Name */}
            <div>
              <label className="block text-gray-700 mb-4">Style Name</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChangeWithAutoSave}
                placeholder="Enter the name of style"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                required
              />
            </div>

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
                name="description"
                value={values.description}
                onChange={handleChangeWithAutoSave}
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
                    setFieldValueWithAutoSave(
                      "category_id",
                      selectedOption.value,
                    );
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
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4 mt-4">
                  Estimated Sewing Time (days)
                </label>
                <input
                  type="number"
                  name="estimated_sewing_time"
                  required
                  min={0}
                  value={values.estimated_sewing_time}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? ""
                        : parseInt(e.target.value) || 0;
                    setFieldValueWithAutoSave("estimated_sewing_time", value);
                  }}
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
                  setFieldValueWithAutoSave("gender", selectedOption.value);
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
              />
            </div>

            {/* Photo Uploads */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Upload Style Photos
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute top-2 right-2 group">
                    <div className="text-gray-500 text-sm cursor-pointer">
                      ⓘ
                    </div>
                    <div className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 whitespace-nowrap">
                      Note: This is the first Style to appear on home page
                    </div>
                  </div>

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
                              setFieldValueWithAutoSave(
                                "front_url",
                                data?.data?.data?.url,
                              );
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
                      <img
                        src={values.front_url}
                        className="mx-auto h-40"
                        alt=""
                      />
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
                            setFieldValueWithAutoSave(
                              "back_url",
                              data?.data?.data?.url,
                            );
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
                  ) : null}
                  {values?.back_url && (
                    <img
                      src={values.back_url}
                      className="mx-auto h-40"
                      alt=""
                    />
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
                            setFieldValueWithAutoSave(
                              "right_url",
                              data?.data?.data?.url,
                            );
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
                  ) : null}
                  {values?.right_url && (
                    <img
                      src={values.right_url}
                      className="mx-auto h-40"
                      alt=""
                    />
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
                            setFieldValueWithAutoSave(
                              "left_url",
                              data?.data?.data?.url,
                            );
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
                  ) : null}
                  {values?.left_url && (
                    <img
                      src={values.left_url}
                      className="mx-auto h-40"
                      alt=""
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Upload a video of the style (max length of 10secs)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
                <div className="flex flex-col items-center">
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
                          setFieldValueWithAutoSave(
                            "video_url",
                            data?.data?.data?.url,
                          );
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
                  <video
                    controls
                    src={values.video_url}
                    className="mt-4 mx-auto h-40"
                    alt=""
                  />
                )}
              </div>
            </div>

            {/* Minimum Fabric Quantity */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Minimum Fabric Quantity Required (Yards)
              </label>
              <input
                type="number"
                name="minimum_fabric_qty"
                value={values.minimum_fabric_qty}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0;
                  setFieldValueWithAutoSave("minimum_fabric_qty", value);
                }}
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
                  name="price"
                  min={0}
                  step="0.01"
                  value={values.price}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value) || 0;
                    setFieldValueWithAutoSave("price", value);
                  }}
                  placeholder="Enter amount per yard"
                  className="flex-1 p-4 border border-[#CCCCCC] rounded-lg px-4 py-2 outline-none"
                  required
                />
              </div>
            </div>

            {/* Modal and Submit Button */}
            <ModalThanks
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />

            <div className="flex gap-4 mt-6">
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
                className="bg-gradient text-white px-6 py-2 rounded w-full md:w-fit cursor-pointer disabled:opacity-50"
              >
                {isPending ||
                updateIsPending ||
                updateAdminIsPending ||
                createIsPending
                  ? "Please wait..."
                  : styleInfo
                    ? "Update Style"
                    : isAdminAddRoute
                      ? "Create Style"
                      : "Submit Style"}
              </button>

              {hasSavedData && !isEditMode && (
                <button
                  type="button"
                  onClick={handleClearSavedData}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
                >
                  Clear Saved Data
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Auto-save indicator */}
        {!isEditMode && (
          <div className="mt-4 text-xs text-gray-500 flex items-center">
            <span className="mr-1">💾</span>
            Your progress is automatically saved as you type
          </div>
        )}
      </div>
    </>
  );
}
