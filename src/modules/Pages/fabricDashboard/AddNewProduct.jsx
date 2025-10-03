import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import useCreateFabricProduct from "../../../hooks/fabric/useCreateFabricProduct";
import useGetMarket from "../../../hooks/market/useGetMarket";
import Select from "react-select";
import { usePlacesWidget } from "react-google-autocomplete";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";
import useUploadImages from "../../../hooks/multimedia/useUploadImages";
import useGetProducts from "../../../hooks/product/useGetProduct";

import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateFabric from "../../../hooks/fabric/useUpdateFabric";
import useCreateAdminFabricProduct from "../../../hooks/fabric/useCreateAdminFabricProduct";
import useUpdateAdminFabric from "../../../hooks/fabric/useUpdateAdminFabric";
import useToast from "../../../hooks/useToast";
import useGetAdminBusinessDetails from "../../../hooks/settings/useGetAdmnBusinessInfo";
import CustomBackbtn from "../../../components/CustomBackBtn";

// Custom hook for form auto-save functionality
const useFormAutoSave = (formId, initialValues, isEditMode = false) => {
  const [savedData, setSavedData] = useState(() => {
    if (!isEditMode) {
      try {
        const saved = localStorage.getItem(`form_autosave_${formId}`);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error("Error loading saved form data:", error);
        localStorage.removeItem(`form_autosave_${formId}`);
      }
    }
    return {};
  });
  const storageKey = `form_autosave_${formId}`;

  // Load saved data on component mount (no-op, handled in useState initializer)
  useEffect(() => {
    // No-op: handled in useState initializer for sync value on first render
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

const AddProduct = () => {
  const location = useLocation();

  const isAdminAddFabricRoute =
    location.pathname === "/admin/fabric/add-product";

  const isAdminEditFabricRoute =
    location.pathname === "/admin/fabric/edit-product";

  const productInfo = location?.state?.info;
  const isEditMode = !!productInfo;

  const initialValues = {
    type: "FABRIC",
    name: productInfo?.name ?? "",
    category_id: productInfo?.category_id ?? "",
    description: productInfo?.description ?? "",
    gender: productInfo?.gender ?? "",
    tags: productInfo?.tags ?? [],
    price: productInfo?.price ?? "",
    weight_per_unit: productInfo?.fabric?.weight_per_unit ?? "",
    local_name: productInfo?.fabric?.local_name ?? "",
    manufacturer_name: productInfo?.fabric?.manufacturer_name ?? "",
    material_type: productInfo?.fabric?.material_type ?? "",
    alternative_names: productInfo?.fabric?.alternative_names ?? "",
    fabric_texture: productInfo?.fabric?.fabric_texture ?? "",
    feel_a_like: productInfo?.fabric?.feel_a_like ?? "",
    quantity: productInfo?.fabric?.quantity ?? "",
    minimum_yards: productInfo?.fabric?.minimum_yards ?? "",
    available_colors: productInfo?.fabric?.available_colors ?? "",
    fabric_colors: productInfo?.fabric?.fabric_colors
      ? productInfo?.fabric?.fabric_colors
          ?.split(",")
          ?.map((color) => color.trim())
      : [""],
    video_url: productInfo?.fabric?.video_url ?? "",
    original_price: "",
    sku: productInfo?.sku ?? "",
    market_id: productInfo?.fabric?.market_id ?? "",
    multimedia_url: "",
    closeup_url: productInfo?.fabric?.photos?.[0] ?? undefined,
    spreadout_url: productInfo?.fabric?.photos?.[1] ?? "",
    manufacturers_url: productInfo?.fabric?.photos?.[2] ?? "",
    fabric_url: productInfo?.fabric?.photos?.[3] ?? "",
    enable_increment: Boolean(productInfo?.fabric?.enable_increment) || false,
  };

  // Auto-save functionality
  const { saveFormData, clearSavedData, getInitialValues, hasSavedData } =
    useFormAutoSave("fabric_form", initialValues, isEditMode);

  const [colorCount, setColorCount] = useState(1);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showSavedDataNotice, setShowSavedDataNotice] = useState(false);

  // Auto-save timer ref
  const autoSaveTimer = useRef(null);

  const { data: businessAdminDetails } = useGetAdminBusinessDetails();
  const { data: businessDetails } = useGetBusinessDetails();

  const increaseColorCount = () => {
    setColorCount((prev) => prev + 1);
    setFieldValueWithAutoSave("available_colors", colorCount + 1);
  };
  const decreaseColorCount = () => {
    if (colorCount > 1) {
      setColorCount((prev) => prev - 1);
      setFieldValueWithAutoSave("available_colors", colorCount - 1);
    }
  };

  const { isPending, createFabricProductMutate } = useCreateFabricProduct(
    businessDetails?.data?.id,
  );

  const { isPending: createAdminIsPending, createAdminFabricProductMutate } =
    useCreateAdminFabricProduct(businessAdminDetails?.data?.id);

  const { data } = useGetMarket({
    "pagination[limit]": 10000,
  });

  const { data: fabCategory } = useGetProducts({
    "pagination[limit]": 10000,
    type: "fabric",
  });

  const marketList = data?.data
    ? data?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const categoryList = fabCategory?.data
    ? fabCategory?.data?.map((c) => ({
        label: c.name,
        value: c.id,
      }))
    : [];

  const { isPending: updateIsPending, updateFabricMutate } = useUpdateFabric();

  const { isPending: updateAdminIsPending, updateAdminFabricMutate } =
    useUpdateAdminFabric();

  // const [photoFiles, setPhotoFiles] = useState({}); // unused

  const navigate = useNavigate();

  const { toastError } = useToast();

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

  // --- PATCH: Only set initialValues ONCE, and only after savedData is loaded ---
  // This prevents the "flicker" where saved values appear then disappear.
  // We'll use a flag to ensure we only setValues once, after mount.
  const [didSetInitial, setDidSetInitial] = useState(false);

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
    initialValues: initialValues, // always use initialValues here
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: false, // don't reinitialize on prop change
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      if (
        !values.closeup_url ||
        !values.spreadout_url ||
        !values.manufacturers_url ||
        !values.fabric_url
      ) {
        toastError("Please upload all required images.");
        return;
      }
      const onSuccessCallback = () => {
        clearSavedData();
        resetForm();
        navigate(-1);
      };
      if (productInfo) {
        if (isAdminEditFabricRoute) {
          console.log(
            "Updating admin fabric with enable_increment:",
            val.enable_increment,
          );
          updateAdminFabricMutate(
            {
              id: productInfo?.id,
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
                enable_increment: val.enable_increment,
                status: productInfo?.status,
              },
              fabric: {
                market_id: val.market_id,
                weight_per_unit: val?.weight_per_unit?.toString(),
                local_name: val.local_name,
                manufacturer_name: val.manufacturer_name,
                material_type: val.material_type,
                alternative_names: val.alternative_names,
                fabric_texture: val.fabric_texture,
                feel_a_like: val.feel_a_like,
                quantity: val.quantity,
                minimum_yards: val.minimum_yards?.toString(),
                available_colors: val.available_colors?.toString(),
                fabric_colors: val?.fabric_colors?.join(","),
                photos: [
                  val.closeup_url,
                  val.spreadout_url,
                  val.manufacturers_url,
                  val.fabric_url,
                ],
                video_url: val.video_url,
              },
            },
            {
              onSuccess: onSuccessCallback,
            },
          );
        } else {
          console.log(
            "Updating fabric with enable_increment:",
            val.enable_increment,
          );
          updateFabricMutate(
            {
              id: productInfo?.id,
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
                status: productInfo?.status,
                enable_increment: val.enable_increment,
              },
              fabric: {
                market_id: val.market_id,
                weight_per_unit: val?.weight_per_unit?.toString(),
                local_name: val.local_name,
                manufacturer_name: val.manufacturer_name,
                material_type: val.material_type,
                alternative_names: val.alternative_names,
                fabric_texture: val.fabric_texture,
                feel_a_like: val.feel_a_like,
                quantity: val.quantity,
                minimum_yards: val.minimum_yards?.toString(),
                available_colors: val.available_colors?.toString(),
                fabric_colors: val?.fabric_colors?.join(","),
                photos: [
                  val.closeup_url,
                  val.spreadout_url,
                  val.manufacturers_url,
                  val.fabric_url,
                ],
                video_url: val.video_url,
              },
            },
            {
              onSuccess: onSuccessCallback,
            },
          );
        }
      } else {
        if (isAdminAddFabricRoute) {
          console.log(
            "Creating admin fabric with enable_increment:",
            val.enable_increment,
          );
          createAdminFabricProductMutate(
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
                enable_increment: val.enable_increment,
              },
              fabric: {
                market_id: val.market_id,
                weight_per_unit: val?.weight_per_unit?.toString(),
                local_name: val.local_name,
                manufacturer_name: val.manufacturer_name,
                material_type: val.material_type,
                alternative_names: val.alternative_names,
                fabric_texture: val.fabric_texture,
                feel_a_like: val.feel_a_like,
                quantity: val.quantity,
                minimum_yards: val.minimum_yards?.toString(),
                available_colors: val.available_colors?.toString(),
                fabric_colors: val?.fabric_colors?.join(","),
                photos: [
                  val.closeup_url,
                  val.spreadout_url,
                  val.manufacturers_url,
                  val.fabric_url,
                ],
                video_url: val.video_url,
              },
            },
            {
              onSuccess: onSuccessCallback,
            },
          );
        } else {
          console.log(
            "Creating fabric with enable_increment:",
            val.enable_increment,
          );
          createFabricProductMutate(
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
                enable_increment: val.enable_increment,
              },
              fabric: {
                market_id: val.market_id,
                weight_per_unit: val?.weight_per_unit?.toString(),
                local_name: val.local_name,
                manufacturer_name: val.manufacturer_name,
                material_type: val.material_type,
                alternative_names: val.alternative_names,
                fabric_texture: val.fabric_texture,
                feel_a_like: val.feel_a_like,
                quantity: val.quantity,
                minimum_yards: val.minimum_yards?.toString(),
                available_colors: val.available_colors?.toString(),
                fabric_colors: val?.fabric_colors?.join(","),
                photos: [
                  val.closeup_url,
                  val.spreadout_url,
                  val.manufacturers_url,
                  val.fabric_url,
                ],
                video_url: val.video_url,
              },
            },
            {
              onSuccess: onSuccessCallback,
            },
          );
        }
      }
    },
  });

  // Set initial values from savedData (if any) only once after mount
  useEffect(() => {
    if (!isEditMode && !didSetInitial) {
      const merged = getInitialValues();
      setValues(merged);
      setDidSetInitial(true);
    }
    // eslint-disable-next-line
  }, [isEditMode, getInitialValues, setValues, didSetInitial]);

  // Enhanced handleChange with auto-save
  const handleChangeWithAutoSave = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    // Debug logging for enable_increment toggle
    if (e.target.name === "enable_increment") {
      console.log("Toggle enable_increment:", {
        oldValue: Boolean(values.enable_increment),
        newValue: Boolean(value),
        checked: e.target.checked,
        type: e.target.type,
      });
    }

    handleChange(e);
    const updatedValues = { ...values, [e.target.name]: value };
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

  // Update tags state when values change
  useEffect(() => {
    setTags(values.tags || []);
  }, [values.tags]);

  // Keep colorCount in sync with available_colors
  useEffect(() => {
    if (
      typeof values.available_colors === "number" ||
      (typeof values.available_colors === "string" &&
        values.available_colors !== "")
    ) {
      setColorCount(Number(values.available_colors) || 1);
    }
  }, [values.available_colors]);

  // Sync fabric_colors array with available_colors
  useEffect(() => {
    const current = values.fabric_colors || [];
    const availableColors =
      typeof values.available_colors === "number"
        ? values.available_colors
        : parseInt(values.available_colors) || 0;
    if (availableColors > current.length) {
      const updated = [
        ...current,
        ...Array(availableColors - current.length).fill("#000000"),
      ];
      setFieldValueWithAutoSave("fabric_colors", updated);
    } else if (availableColors < current.length) {
      const trimmed = current.slice(0, availableColors);
      setFieldValueWithAutoSave("fabric_colors", trimmed);
    }
    // eslint-disable-next-line
  }, [values.available_colors]);

  const {
    isPending: closeUpViewIsPending,
    uploadImageMutate: closeUpViewMutate,
  } = useUploadImage();

  const {
    isPending: spreadOutViewIsPending,
    uploadImageMutate: spreadOutViewMutate,
  } = useUploadImage();

  const {
    isPending: manufacturersIsPending,
    uploadImageMutate: manufacturersViewMutate,
  } = useUploadImage();

  const { isPending: fabricIsPending, uploadImageMutate: fabricViewMutate } =
    useUploadImage();

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

  const { isPending: uploadVideoIsPending, uploadVideoMutate } =
    useUploadVideo();

  // const { isPending: uploadImagesIsPending, uploadImagesMutate } =
  //   useUploadImages(); // unused

  // Tag input handlers
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

  // Clear saved data function for manual clearing
  const handleClearSavedData = () => {
    clearSavedData();
    setValues(initialValues);
    setTags([]);
    setColorCount(1);
    setDidSetInitial(false);
  };

  return (
    <>
      <CustomBackbtn />
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
      <div className="bg-white px-6 py-4 mb-6 relative">
        <h1 className="text-2xl font-medium mb-3">
          {productInfo && !isAdminEditFabricRoute
            ? "Edit"
            : isAdminEditFabricRoute
              ? "View"
              : "Add"}{" "}
          Product
        </h1>
        <p className="text-gray-500">
          <Link to="/fabric" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; My Product &gt;{" "}
          {productInfo && !isAdminEditFabricRoute
            ? "Edit"
            : isAdminEditFabricRoute
              ? "View"
              : "Add"}{" "}
          Product
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {productInfo && !isAdminEditFabricRoute
              ? "Edit"
              : isAdminEditFabricRoute
                ? "View"
                : "Add"}{" "}
            Product
          </h2>
          {hasSavedData && !isEditMode && (
            <div className="text-sm text-green-600 flex items-center">
              <span className="mr-1">💾</span>
              Auto-saved
            </div>
          )}
        </div>
        <form className="" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Fabric Name */}
              <div className="w-full">
                <label className="block text-gray-700 mb-4">Fabric Name</label>
                <input
                  type="text"
                  name={"name"}
                  required
                  value={values.name}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the fabric name"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market */}
              <div>
                <label className="block text-gray-700 mb-4">Market</label>
                <Select
                  options={marketList}
                  name="market_id"
                  value={marketList?.find(
                    (opt) => opt.value === values.market_id,
                  )}
                  onChange={(selectedOption) => {
                    setFieldValueWithAutoSave(
                      "market_id",
                      selectedOption.value,
                    );
                  }}
                  required
                  placeholder="Choose market"
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

              {/* Gender Suitability */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Gender Suitability
                </label>
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
                />{" "}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-4">
                  Weight per yard
                </label>
                <input
                  type="number"
                  name={"weight_per_unit"}
                  required
                  min={0}
                  value={values.weight_per_unit}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the weight per yard (minimum 0)"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local Name */}
              <div>
                <label className="block text-gray-700 mb-4">Local Name</label>
                <input
                  type="text"
                  name={"local_name"}
                  required
                  value={values.local_name}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the name the fabric is known as locally"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4">
                  Manufacturer's Name
                </label>
                <input
                  type="text"
                  name={"manufacturer_name"}
                  required
                  value={values.manufacturer_name}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the name called by the manufacturer"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Material Type */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Material Type
                </label>
                <input
                  type="text"
                  name={"material_type"}
                  required
                  value={values.material_type}
                  onChange={handleChangeWithAutoSave}
                  placeholder="e.g. cotton, polyester, etc"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4">
                  Alternative Names
                </label>
                <input
                  type="text"
                  name={"alternative_names"}
                  required
                  value={values.alternative_names}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the name it is called in other locations"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fabric Texture */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Fabric Texture
                </label>
                <input
                  type="text"
                  name={"fabric_texture"}
                  required
                  value={values.fabric_texture}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the fabric texture"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4">Feel-a-like</label>
                <input
                  type="text"
                  name={"feel_a_like"}
                  value={values.feel_a_like}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Describe what it feels like"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Quantity (Must be more than 10 yards)
                </label>
                <input
                  type="number"
                  name={"quantity"}
                  value={values.quantity}
                  required
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the quantity available"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>

              {/* Minimum yards to purchase */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Minimum yards to purchase
                </label>
                <input
                  type="number"
                  name={"minimum_yards"}
                  required
                  value={values.minimum_yards}
                  onChange={handleChangeWithAutoSave}
                  placeholder="Enter the minimum yards for purchase"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            {/* Enable Increment Toggle */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-all duration-200">
                  <div className="flex-1">
                    <label className="block text-gray-800 font-semibold mb-2 text-lg">
                      Enable Increment
                    </label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Allow users to increment the quantity by 1 when purchasing
                      this fabric. This gives customers more flexibility in
                      their orders.
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Boolean(values.enable_increment) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {Boolean(values.enable_increment)
                          ? "✓ Enabled"
                          : "✕ Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="enable_increment"
                        checked={Boolean(values.enable_increment)}
                        onChange={handleChangeWithAutoSave}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 shadow-lg"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Colors and Color Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* How many colors available */}
              <div>
                <label className="block text-gray-700 mb-4">
                  How many colours available?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name={"available_colors"}
                    value={values.available_colors}
                    onChange={handleChangeWithAutoSave}
                    className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={increaseColorCount}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={decreaseColorCount}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    -
                  </button>
                </div>
              </div>
              {/* Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {values?.fabric_colors?.map((color, index) => (
                  <input
                    key={index}
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const updated = [...values.fabric_colors];
                      updated[index] = e.target.value;
                      setFieldValueWithAutoSave("fabric_colors", updated);
                    }}
                    className="w-full h-14 border border-gray-300 rounded-lg cursor-pointer"
                  />
                ))}
              </div>{" "}
            </div>

            {/* Price per yard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-4">
                  Price per yard
                </label>
                <div className="flex items-center">
                  <span className="p-5 bg-gray-200 rounded-l-md">₦</span>
                  <input
                    type="number"
                    name={"price"}
                    required
                    value={values.price}
                    onChange={handleChangeWithAutoSave}
                    placeholder="Enter amount per yard"
                    className="w-full p-4 border-t border-r border-b outline-none border-gray-300 rounded-r-md"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-700 mb-3">Tags (max 5)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-4">
                  Product Description
                </label>
                <textarea
                  placeholder="Enter the fabric description"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 outline-none"
                  required
                  type="text"
                  name={"description"}
                  value={values.description}
                  onChange={handleChangeWithAutoSave}
                />
              </div>

              {/* Market */}
              <div>
                <label className="block text-gray-700 mb-4">Category</label>
                <Select
                  options={categoryList}
                  name="category_id"
                  value={categoryList?.find(
                    (opt) => opt.value === values.category_id,
                  )}
                  onChange={(selectedOption) => {
                    setFieldValueWithAutoSave(
                      "category_id",
                      selectedOption.value,
                    );
                  }}
                  required
                  placeholder="Choose fabric"
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
            </div>

            {/* Upload Photos */}
            <div>
              <label className="block text-gray-700 mb-4">Upload Photos</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  onClick={() => document.getElementById("closeup_url").click()}
                  className="w-full flex flex-col gap-2 h-40 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer"
                >
                  <label className="text-gray-400 cursor-pointer text-center text-sm">
                    {`Close Up View (click to upload)`}
                  </label>
                  <input
                    type="file"
                    id="closeup_url"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        closeUpViewMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValueWithAutoSave(
                              "closeup_url",
                              data?.data?.data?.url,
                            );
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />

                  {closeUpViewIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.closeup_url ? (
                    <>
                      <img src={values.closeup_url} className="w-1/3 h-16" />
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={values.closeup_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    </>
                  ) : (
                    <></>
                  )}
                </div>

                <div
                  onClick={() =>
                    document.getElementById("spreadout_url").click()
                  }
                  className="w-full flex flex-col gap-2 h-40 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer"
                >
                  <label className="text-gray-400 cursor-pointer text-center text-sm">
                    {`Spread Out View (click to upload)`}
                  </label>
                  <input
                    type="file"
                    id="spreadout_url"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        spreadOutViewMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValueWithAutoSave(
                              "spreadout_url",
                              data?.data?.data?.url,
                            );
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />

                  {spreadOutViewIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.spreadout_url ? (
                    <>
                      <img src={values.spreadout_url} className="w-1/3" />
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={values.spreadout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    </>
                  ) : (
                    <></>
                  )}
                </div>

                <div
                  onClick={() =>
                    document.getElementById("manufacturers_url").click()
                  }
                  className="w-full flex flex-col gap-2 h-40 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer"
                >
                  <label className="text-gray-400 cursor-pointer text-center text-sm">
                    {`Manufacturer's Label (click to upload)`}
                  </label>
                  <input
                    type="file"
                    id="manufacturers_url"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        manufacturersViewMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValueWithAutoSave(
                              "manufacturers_url",
                              data?.data?.data?.url,
                            );
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />

                  {manufacturersIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.manufacturers_url ? (
                    <>
                      <img
                        src={values.manufacturers_url}
                        className="w-1/3 h-16"
                      />
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={values.manufacturers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    </>
                  ) : (
                    <></>
                  )}
                </div>

                <div
                  onClick={() => document.getElementById("fabric_url").click()}
                  className="w-full flex flex-col gap-2 h-40 border border-gray-300 rounded-md flex items-center justify-center cursor-pointer"
                >
                  <label className="text-gray-400 cursor-pointer text-center text-sm">
                    {`Fabric's Name (click to upload)`}
                  </label>
                  <input
                    type="file"
                    id="fabric_url"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                          alert("File size exceeds 5MB limit");
                          return;
                        }
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        fabricViewMutate(formData, {
                          onSuccess: (data) => {
                            setFieldValueWithAutoSave(
                              "fabric_url",
                              data?.data?.data?.url,
                            );
                          },
                        });
                        e.target.value = "";
                      }
                    }}
                  />

                  {fabricIsPending ? (
                    <p className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </p>
                  ) : values.fabric_url ? (
                    <>
                      <img src={values.fabric_url} className="w-1/3 h-16" />
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={values.fabric_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 flex justify-center cursor-pointer hover:underline"
                      >
                        View file upload
                      </a>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>{" "}
            </div>

            {/* Upload Video */}
            <div>
              <label className="block text-gray-700 mb-4">Upload Video</label>
              <div className="w-full h-40 cursor-pointer border border-gray-300 rounded-md flex items-center justify-center">
                <input
                  accept="video/*"
                  type="file"
                  className="hidden"
                  id="uploadVideo"
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
                <div className="flex flex-col items-center">
                  {" "}
                  {uploadVideoIsPending ? (
                    <label className="cursor-pointer text-gray-400">
                      please wait...{" "}
                    </label>
                  ) : (
                    <></>
                  )}
                  {values.video_url ? (
                    <a
                      href={values.video_url}
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
                    htmlFor="uploadVideo"
                    className="cursor-pointer text-gray-400"
                  >
                    Upload 5-second video (showing the cloth angles)
                  </label>
                </div>
              </div>
              {
                <div>
                  <></>
                  {values.video_url && (
                    <video
                      controls
                      className="w-[200px] mt-2 rounded-md mx-auto"
                    >
                      <source src={values.video_url}></source>
                    </video>
                  )}
                </div>
              }
            </div>

            {/* Submit Button */}
            {isAdminEditFabricRoute ? (
              <></>
            ) : (
              <>
                {" "}
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    disabled={
                      isPending ||
                      uploadVideoIsPending ||
                      updateIsPending ||
                      closeUpViewIsPending ||
                      spreadOutViewIsPending ||
                      manufacturersIsPending ||
                      fabricIsPending ||
                      createAdminIsPending ||
                      updateAdminIsPending
                    }
                    className="w-full cursor-pointer py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
                  >
                    {isPending ||
                    updateIsPending ||
                    closeUpViewIsPending ||
                    spreadOutViewIsPending ||
                    manufacturersIsPending ||
                    fabricIsPending ||
                    createAdminIsPending ||
                    updateAdminIsPending
                      ? "Please wait..."
                      : productInfo
                        ? "Update Fabric"
                        : "Upload Fabric"}
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
              </>
            )}
            {!isEditMode && (
              <div className="mt-4 text-xs text-gray-500 flex items-center">
                <span className="mr-1">💾</span>
                Your progress is automatically saved as you type
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProduct;
