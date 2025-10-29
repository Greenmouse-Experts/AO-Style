import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import useCreateMarketRepFabric from "../../../hooks/marketRep/useCreateMarketRepFabric";

import imageUpload from "../../../utils/imageUpload";
import useGetProductCategories from "../../../hooks/useGetProductCategories";
import useGetMarkets from "../../../hooks/useGetMarkets";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import Autocomplete from "react-google-autocomplete";

const AddFabric = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();

  // Changed: Remove underscore from photoFiles and make it stateful for previews
  // const [photoFiles, setPhotoFiles] = useState([]); // Not used, can be removed if desired
  const [photoUrls, setPhotoUrls] = useState(["", "", "", ""]);
  const [isUploadingImages, setIsUploadingImages] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [_videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showAutosaveIndicator, setShowAutosaveIndicator] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [searchParams] = useSearchParams();
  const vendorIdFromUrl = searchParams.get("vendor_id");

  const DRAFT_KEY = "fabric_form_draft";
  const AUTOSAVE_DELAY = 2000; // 2 seconds

  useEffect(() => {
    // Fetch fabric vendors
    console.log(photoUrls);
  }, [photoUrls]);

  // Create fabric mutation
  const { createMarketRepFabricMutate, isPending: isCreating } =
    useCreateMarketRepFabric();

  // Fetch product categories
  const { categories, isLoading: categoriesLoading } =
    useGetProductCategories();

  // Fetch markets
  const { markets, isLoading: marketsLoading } = useGetMarkets();

  // Fetch fabric vendors
  const { data: getAllFabVendorData, isLoading: vendorsLoading } =
    useGetAllMarketRepVendor({}, "fabric-vendor");

  // Debug logging
  console.log("🔧 ADDFABRIC: getAllFabVendorData:", getAllFabVendorData);
  console.log(
    "🔧 ADDFABRIC: getAllFabVendorData?.data:",
    getAllFabVendorData?.data,
  );
  console.log("🔧 ADDFABRIC: vendorsLoading:", vendorsLoading);
  console.log(
    "🔧 ADDFABRIC: Is data an array?",
    Array.isArray(getAllFabVendorData?.data),
  );

  // Video upload hook
  const { uploadVideoMutate } = useUploadVideo();

  const saveDraft = useCallback((values, photoUrls, videoUrl) => {
    try {
      const draft = {
        formValues: values,
        photoUrls: photoUrls,
        videoUrl: videoUrl,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setIsDraftSaved(true);
      setLastSavedTime(new Date());
      setShowAutosaveIndicator(true);

      setTimeout(() => setShowAutosaveIndicator(false), 2000);
      console.log("📝 Draft saved to localStorage");
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, []);

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
      return null;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setIsDraftSaved(false);
      setLastSavedTime(null);
      console.log("🗑️ Draft cleared from localStorage");
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, []);

  const validationSchema = Yup.object({
    vendor_id: Yup.string().required("Please select a fabric vendor"),
    name: Yup.string().required("Fabric name is required"),
    category_id: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    gender: Yup.string().required("Gender is required"),
    price: Yup.number()
      .required("Price is required")
      .min(1, "Price must be greater than 0"),
    market_id: Yup.string().required("Market ID is required"),
    weight_per_unit: Yup.string().required("Weight per unit is required"),
    local_name: Yup.string().required("Local name is required"),
    manufacturer_name: Yup.string().required("Manufacturer name is required"),
    material_type: Yup.string().required("Material type is required"),
    quantity: Yup.number()
      .required("Quantity is required")
      .min(1, "Quantity must be greater than 0"),
    minimum_yards: Yup.string().required("Minimum yards is required"),
    available_colors: Yup.string().required("Available colors is required"),
    // fabric_colors: Yup.string().required("Fabric colors is required"),
    fabric_texture: Yup.string().required("Fabric texture is required"),
  });

  const formik = useFormik({
    initialValues: {
      vendor_id: "",
      name: "",
      category_id: "",
      description: "",
      gender: "",
      price: "",
      quantity: 1,
      market_id: "",
      weight_per_unit: "",
      local_name: "",
      manufacturer_name: "",
      material_type: "",
      alternative_names: "",
      fabric_texture: "",
      feel_a_like: "",
      minimum_yards: "1",
      available_colors: "",
      // fabric_colors: "",
      tags: "",
      video_url: "",
      enable_increment: false,
    },
    validationSchema,
    onSubmit: (values) => {
      // Filter out empty strings to get only uploaded images
      const uploadedPhotos = photoUrls.filter((url) => url !== "");

      if (uploadedPhotos.length === 0) {
        toastError("Please upload at least one photo");
        return;
      }

      console.log("Selected vendor ID:", values.vendor_id);
      const payload = {
        vendor_id: values.vendor_id,
        product: {
          type: "FABRIC",
          name: values.name,
          category_id: values.category_id,
          description: values.description,
          gender: values.gender,
          tags: values.tags
            ? values.tags.split(",").map((tag) => tag.trim())
            : [],
          price: values.price.toString(),
          enable_increment: !!values.enable_increment,
        },
        fabric: {
          market_id: values.market_id,
          weight_per_unit: values.weight_per_unit.toString(),
          local_name: values.local_name,
          manufacturer_name: values.manufacturer_name,
          material_type: values.material_type,
          alternative_names: values.alternative_names,
          fabric_texture: values.fabric_texture,
          feel_a_like: values.feel_a_like,
          quantity: parseInt(values.quantity),
          minimum_yards: values.minimum_yards.toString(),
          available_colors: values.available_colors,
          // fabric_colors: values.fabric_colors,
          photos: uploadedPhotos, // Send only non-empty URLs
          video_url: values.video_url,
        },
      };

      console.log("🔧 FABRIC PAYLOAD: Sending payload to API:", payload);
      console.log("🔧 FABRIC PAYLOAD: Payload structure:", {
        vendor_id: payload.vendor_id,
        product: payload.product,
        fabric: payload.fabric,
      });
      console.log(
        "🔧 FABRIC PAYLOAD: Photos count:",
        payload.fabric.photos.length,
      );

      createMarketRepFabricMutate(payload, {
        onSuccess: (response) => {
          console.log("🎉 Fabric creation response:", response);
          clearDraft();
          // toastSuccess("Fabric created successfully!");
          navigate("/sales/my-products");
        },
        onError: (error) => {
          console.log(error?.data?.message || error?.message);
        },
      });
    },
  });

  // Handler to sync enable_increment toggle with autosave
  const handleChangeWithAutoSave = (e) => {
    const { name, type, checked, value } = e.target;
    let fieldValue;
    if (type === "checkbox") {
      fieldValue = checked;
    } else {
      fieldValue = value;
    }
    formik.setFieldValue(name, fieldValue);

    // Immediately save draft with updated value
    // Use setTimeout to ensure formik.values is updated
    setTimeout(() => {
      saveDraft({ ...formik.values, [name]: fieldValue }, photoUrls, videoUrl);
    }, 0);
  };

  useEffect(() => {
    const savedDraft = loadDraft();

    // Check if we have a vendor_id from URL
    if (vendorIdFromUrl) {
      // If vendor_id in URL exists, check if saved draft has matching vendor_id
      if (savedDraft && savedDraft.formValues.vendor_id === vendorIdFromUrl) {
        // Load the draft since vendor matches
        Object.keys(savedDraft.formValues).forEach((key) => {
          if (savedDraft.formValues[key] !== formik.initialValues[key]) {
            formik.setFieldValue(key, savedDraft.formValues[key]);
          }
        });

        if (savedDraft.photoUrls?.length > 0) {
          setPhotoUrls(savedDraft.photoUrls);
        }
        if (savedDraft.videoUrl) {
          setVideoUrl(savedDraft.videoUrl);
          formik.setFieldValue("video_url", savedDraft.videoUrl);
        }

        setLastSavedTime(new Date(savedDraft.timestamp));
        setIsDraftSaved(true);
        console.log("📄 Draft loaded - vendor matches URL param");
      } else {
        // Start fresh - set vendor_id from URL and clear any old draft
        formik.setFieldValue("vendor_id", vendorIdFromUrl);
        clearDraft();
        console.log("🆕 Starting fresh with vendor from URL");
      }
    } else {
      // No vendor_id in URL, load draft normally if it exists
      if (savedDraft) {
        Object.keys(savedDraft.formValues).forEach((key) => {
          if (savedDraft.formValues[key] !== formik.initialValues[key]) {
            formik.setFieldValue(key, savedDraft.formValues[key]);
          }
        });

        if (savedDraft.photoUrls?.length > 0) {
          setPhotoUrls(savedDraft.photoUrls);
        }
        if (savedDraft.videoUrl) {
          setVideoUrl(savedDraft.videoUrl);
          formik.setFieldValue("video_url", savedDraft.videoUrl);
        }

        setLastSavedTime(new Date(savedDraft.timestamp));
        setIsDraftSaved(true);
        console.log("📄 Draft loaded from localStorage");
      }
    }

    setIsLoadingDraft(false);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isLoadingDraft) return; // Don't save while loading

    const timeoutId = setTimeout(() => {
      // Only autosave if form has meaningful content
      const hasContent =
        formik.values.name ||
        formik.values.description ||
        formik.values.vendor_id ||
        photoUrls.length > 0;

      if (hasContent) {
        saveDraft(formik.values, photoUrls, videoUrl);
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [formik.values, photoUrls, videoUrl, isLoadingDraft, saveDraft]);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
    if (!validTypes.includes(file.type)) {
      toastError("Please upload a valid video file (MP4, AVI, MOV, WMV)");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("Video file must be less than 50MB");
      return;
    }

    setVideoFile(file);
    setIsUploadingVideo(true);

    const formData = new FormData();
    formData.append("video", file);

    uploadVideoMutate(formData, {
      onSuccess: (response) => {
        console.log("🎥 Video upload response:", response);
        const videoUrl =
          response?.data?.data?.url ||
          response?.data?.url ||
          response?.data?.video_url;
        if (videoUrl) {
          setVideoUrl(videoUrl);
          formik.setFieldValue("video_url", videoUrl);
          toastSuccess("Video uploaded successfully!");
        } else {
          toastError("Video uploaded but URL not received");
        }
        setIsUploadingVideo(false);
      },
      onError: (error) => {
        console.error("🎥 Video upload error:", error);
        toastError("Failed to upload video. Please try again.");
        setIsUploadingVideo(false);
      },
    });
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl("");
    formik.setFieldValue("video_url", "");
  };

  // --- REWRITE: handleImageUpload to show previews immediately ---
  const handleImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file before upload
    if (!imageUpload.isValidImageFile(file)) {
      toastError(
        `Invalid file: ${file.name}. Please use PNG, JPG, or JPEG files under 5MB.`,
      );
      return;
    }

    // Set loading state for this specific box
    setIsUploadingImages((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    try {
      const result = await imageUpload.uploadImagesWithProgress(
        [file],
        (progress) => {
          console.log(
            `Upload progress: ${progress.percentage}% (${progress.currentFile})`,
          );
        },
      );

      if (result.success && result.results.length > 0) {
        const url = result.results[0].url;
        setPhotoUrls((prev) => {
          const newUrls = [...prev];
          newUrls[index] = url;
          return newUrls;
        });
        toastSuccess(`Image ${index + 1} uploaded successfully!`);
      } else {
        toastError("Failed to upload image. Please try again.");
      }
    } catch {
      toastError("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImages((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  const removeImage = (index) => {
    setPhotoUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = "";
      return newUrls;
    });
  };

  const isFormValid = () => {
    const uploadedPhotos = photoUrls.filter((url) => url !== "");
    return (
      formik.isValid &&
      uploadedPhotos.length > 0 &&
      !isUploadingImages.some((uploading) => uploading) &&
      !isUploadingVideo
    );
  };

  const AutosaveIndicator = () => (
    <div className="fixed top-4 right-4 z-50">
      {showAutosaveIndicator && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          ✓ Draft saved
        </div>
      )}
      {isDraftSaved && lastSavedTime && !showAutosaveIndicator && (
        <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
          Last saved: {lastSavedTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  const DraftNotification = () => {
    if (!isDraftSaved || !lastSavedTime) return null;

    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Draft restored!</strong> Your previous work from{" "}
              {lastSavedTime.toLocaleString()} has been restored.
              <button
                onClick={clearDraft}
                className="ml-2 underline hover:no-underline"
              >
                Start fresh
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <AutosaveIndicator />
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Fabric</h1>
      </div>
      <DraftNotification />

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Fabric Vendor *
          </label>
          {vendorsLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              Loading fabric vendors...
            </div>
          ) : (
            <select
              {...formik.getFieldProps("vendor_id")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a fabric vendor</option>
              {getAllFabVendorData?.data?.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.business_name || vendor.email})
                </option>
              ))}
            </select>
          )}
          {formik.touched.vendor_id && formik.errors.vendor_id && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.vendor_id}
            </p>
          )}
        </div>

        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fabric Name *
            </label>
            <input
              type="text"
              {...formik.getFieldProps("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter fabric name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Category *
            </label>
            {categoriesLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Loading categories...
              </div>
            ) : (
              <select
                {...formik.getFieldProps("category_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {categories
                  .filter((category) => category.type === "fabric")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            )}
            {formik.touched.category_id && formik.errors.category_id && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.category_id}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...formik.getFieldProps("description")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter fabric description"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              {...formik.getFieldProps("gender")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              {...formik.getFieldProps("price")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter price"
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            {...formik.getFieldProps("tags")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="vintage, modern, classic"
          />
        </div>

        {/* Fabric Specific Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Fabric Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Place *
              </label>
              {marketsLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Loading markets...
                </div>
              ) : (
                <select
                  {...formik.getFieldProps("market_id")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a market</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              )}
              {formik.touched.market_id && formik.errors.market_id && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.market_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight per yard(g) *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("weight_per_unit")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 10g"
              />
              {formik.touched.weight_per_unit &&
                formik.errors.weight_per_unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.weight_per_unit}
                  </p>
                )}
            </div>
          </div>

          {/* Enabling increment*/}
          <div className="grid grid-cols-1 gap-6 my-5">
            <div>
              <div className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-all duration-200">
                <div className="flex-1">
                  <label className="block text-gray-800 font-semibold mb-2 text-lg">
                    Enable Increment
                  </label>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Allow users to increment the quantity by 1 when purchasing
                    this fabric. This gives customers more flexibility in their
                    orders.
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formik.values.enable_increment ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {formik.values.enable_increment
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
                      checked={formik.values.enable_increment}
                      onChange={handleChangeWithAutoSave}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 shadow-lg"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <Autocomplete
              apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter fabric location address"
              name="address"
              value={formik.values.address}
              onChange={(e) => {
                console.log("📝 Address input changed:", e.target.value);
                formik.setFieldValue("address", e.target.value);
                formik.setFieldValue("latitude", "");
                formik.setFieldValue("longitude", "");
              }}
              onPlaceSelected={(place) => {
                console.log("🗺️ Google Place Selected:", place);
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();
                console.log("📍 Setting coordinates:", { lat, lng });

                formik.setFieldValue("address", place.formatted_address);
                formik.setFieldValue("latitude", lat ? lat.toString() : "");
                formik.setFieldValue("longitude", lng ? lng.toString() : "");
              }}
              options={{
                componentRestrictions: { country: "ng" },
                types: ["address"],
              }}
            />
            {formik.touched.latitude && formik.errors.latitude && (
              <p className="text-red-500 text-sm mt-1">
                Please select an address to auto-fill coordinates
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("latitude")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                placeholder="Auto-filled from address"
                readOnly
              />
              {formik.touched.latitude && formik.errors.latitude && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.latitude}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("longitude")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                placeholder="Auto-filled from address"
                readOnly
              />
              {formik.touched.longitude && formik.errors.longitude && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.longitude}
                </p>
              )}
            </div>
          </div>*/}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Name *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("local_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter local name"
              />
              {formik.touched.local_name && formik.errors.local_name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.local_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer Name *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("manufacturer_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter manufacturer name"
              />
              {formik.touched.manufacturer_name &&
                formik.errors.manufacturer_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.manufacturer_name}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("material_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Cotton, Silk"
              />
              {formik.touched.material_type && formik.errors.material_type && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.material_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Texture
              </label>
              <input
                type="text"
                {...formik.getFieldProps("fabric_texture")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter fabric texture"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Names
              </label>
              <input
                type="text"
                {...formik.getFieldProps("alternative_names")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter alternative names"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feel A Like
              </label>
              <input
                type="text"
                {...formik.getFieldProps("feel_a_like")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What does it feel like?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                {...formik.getFieldProps("quantity")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter quantity"
              />
              {formik.touched.quantity && formik.errors.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Yards *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("minimum_yards")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 50"
              />
              {formik.touched.minimum_yards && formik.errors.minimum_yards && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.minimum_yards}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors *
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="color"
                  id="color-picker"
                  className="w-10 h-10 border border-gray-300 rounded"
                  value={(() => {
                    // Show last color or default to #000000
                    const colors = formik.values.available_colors
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean);
                    if (colors.length === 0) return "#000000";
                    // If last is a hex, use it, else default
                    const last = colors[colors.length - 1];
                    // If it's a valid hex color, use it
                    if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(last)) {
                      return last;
                    }
                    return "#000000";
                  })()}
                  onChange={(e) => {
                    const color = e.target.value;
                    let current = formik.values.available_colors
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean);
                    // Prevent duplicate colors
                    if (!current.includes(color)) {
                      current.push(color);
                      formik.setFieldValue(
                        "available_colors",
                        current.join(", "),
                      );
                    }
                  }}
                  title="Pick a color to add"
                />
                <span className="text-xs text-gray-500">
                  Pick a color, it will be added to the list below
                </span>
              </div>
              <input
                type="text"
                {...formik.getFieldProps("available_colors")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Red, Blue, #ff0000"
                onChange={(e) => {
                  // Allow manual editing as well
                  formik.setFieldValue("available_colors", e.target.value);
                }}
              />
              {/* Show color chips for selected colors */}
              <div className="flex flex-wrap mt-2 gap-2">
                {formik.values.available_colors
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((color, idx) => (
                    <span
                      key={idx}
                      className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs"
                    >
                      {/* Show color swatch if hex, else just text */}
                      {/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color) ? (
                        <span
                          className="inline-block w-4 h-4 rounded-full border border-gray-300 mr-1"
                          style={{ backgroundColor: color }}
                        ></span>
                      ) : null}
                      <span>{color}</span>
                      <button
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => {
                          const colors = formik.values.available_colors
                            .split(",")
                            .map((c) => c.trim())
                            .filter(Boolean)
                            .filter((_, i) => i !== idx);
                          formik.setFieldValue(
                            "available_colors",
                            colors.join(", "),
                          );
                        }}
                        title="Remove color"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
              </div>
              {formik.touched.available_colors &&
                formik.errors.available_colors && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.available_colors}
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Upload
          </label>

          {!videoUrl ? (
            <div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploadingVideo ? (
                    <>
                      <FaSpinner className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Uploading video...
                      </p>
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        fabric video
                      </p>
                      <p className="text-xs text-gray-500">
                        MP4, AVI, MOV, WMV (MAX. 50MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploadingVideo}
                />
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Video uploaded successfully
                  </p>
                  {/* Video preview */}
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-w-xs mt-2 rounded shadow"
                    style={{ maxHeight: 200 }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-xs text-gray-500 break-all mt-2">
                    {videoUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Product Images
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative">
                {!photoUrls[index] ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center py-4">
                      {isUploadingImages[index] ? (
                        <>
                          <FaSpinner className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                          <p className="text-xs text-gray-500">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-sm font-semibold text-gray-500 text-center px-2">
                            <span className="font-normal">Click to upload</span>
                            <br />
                            {index === 0 && "Close-up view"}
                            {index === 1 && "Spread-out view"}
                            {index === 2 && "Manufacturer's label"}
                            {index === 3 && "Fabric's name"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      disabled={isUploadingImages[index]}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-40">
                    <img
                      src={photoUrls[index]}
                      alt={`Fabric ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                    {/* Optional: Add replace button */}
                    <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-lg cursor-pointer">
                      <FaUpload className="w-3 h-3" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        disabled={isUploadingImages[index]}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isCreating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Fabric"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFabric;
