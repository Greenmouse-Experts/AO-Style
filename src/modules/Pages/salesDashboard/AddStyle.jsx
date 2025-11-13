import React, { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import useCreateMarketRepStyle from "../../../hooks/marketRep/useCreateMarketRepStyle";

import useGetProductCategories from "../../../hooks/useGetProductCategories";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import Autocomplete from "react-google-autocomplete";

const AddStyle = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
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
  const vendorIdFromUrl = searchParams.get("style_id");
  const DRAFT_KEY = "style_form_draft";
  const AUTOSAVE_DELAY = 2000; // 2 seconds

  // Create style mutation
  const { createMarketRepStyleMutate, isPending: isCreating } =
    useCreateMarketRepStyle();

  // Fetch product categories
  const { categories, isLoading: categoriesLoading } =
    useGetProductCategories();

  // Fetch tailors/fashion designers
  const { data: getAllTailorData, isLoading: tailorsLoading } =
    useGetAllMarketRepVendor({}, "fashion-designer");

  // Image upload hook
  const { uploadImageMutate, isPending: isUploadingImage } = useUploadImage();

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
      console.log("📝 Style draft saved to localStorage");
    } catch (error) {
      console.error("Failed to save style draft:", error);
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
      console.error("Failed to load style draft:", error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setIsDraftSaved(false);
      setLastSavedTime(null);
      console.log("🗑️ Style draft cleared from localStorage");
    } catch (error) {
      console.error("Failed to clear style draft:", error);
    }
  }, []);

  const validationSchema = Yup.object({
    vendor_id: Yup.string().required("Please select a tailor"),
    name: Yup.string().required("Style name is required"),
    category_id: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    gender: Yup.string().required("Gender is required"),
    price: Yup.number()
      .required("Price is required")
      .min(1, "Price must be greater than 0"),
    estimated_sewing_time: Yup.number()
      .required("Estimated sewing time is required")
      .min(1, "Estimated sewing time must be at least 1 hour"),
    minimum_fabric_qty: Yup.number()
      .required("Minimum fabric quantity is required")
      .min(0, "Minimum fabric quantity must be at least 0"),
  });

  const formik = useFormik({
    initialValues: {
      vendor_id: "",
      name: "",
      category_id: "",
      description: "",
      gender: "female",
      tags: "",
      price: "",
      estimated_sewing_time: 1,
      minimum_fabric_qty: 0,
      video_url: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Filter out empty strings to get only uploaded images
      const uploadedPhotos = photoUrls.filter((url) => url !== "");

      if (uploadedPhotos.length === 0) {
        toastError("Please upload at least one photo");
        return;
      }

      const payload = {
        vendor_id: values.vendor_id,
        product: {
          type: "STYLE",
          status: "PUBLISHED",
          name: values.name,
          category_id: values.category_id,
          description: values.description,
          gender: values.gender,
          tags: values.tags
            ? values.tags.split(",").map((tag) => tag.trim())
            : [],
          price: values.price.toString(),
        },
        style: {
          estimated_sewing_time: Number(values.estimated_sewing_time),
          minimum_fabric_qty: Number(values.minimum_fabric_qty),
          photos: uploadedPhotos, // Send only non-empty URLs
          video_url: values.video_url,
        },
      };

      console.log("🔧 STYLE PAYLOAD: Sending payload to API:", payload);

      createMarketRepStyleMutate(payload, {
        onSuccess: (response) => {
          console.log("🎉 Style creation response:", response);
          clearDraft(); // Clear draft on successful submission
          toastSuccess(response.message || "Style created successfully!");
          navigate("/sales/my-products");
        },
        onError: (error) => {
          const errorMessage =
            error?.response?.data?.data?.message ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to create style. Please try again.";

          toastError(errorMessage);
        },
      });
    },
  });

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
        console.log("📄 Style draft loaded - vendor matches URL param");
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
        console.log("📄 Style draft loaded from localStorage");
      }
    }

    setIsLoadingDraft(false);
    // eslint-disable-next-line
  }, []);

  // Add debounced autosave effect
  useEffect(() => {
    if (isLoadingDraft) return; // Don't save while loading

    const timeoutId = setTimeout(() => {
      // Only autosave if form has meaningful content
      const hasContent =
        formik.values.name ||
        formik.values.description ||
        formik.values.vendor_id ||
        photoUrls.some((url) => url !== "");

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
        console.log("🎥 Style Video upload response:", response);
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
        console.error("🎥 Style Video upload error:", error);
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

  // Updated handleImageUpload to use useUploadImage hook
  const handleImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validImageTypes.includes(file.type)) {
      toastError("Please upload a valid image file (PNG, JPG, or JPEG)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("Image file must be less than 5MB");
      return;
    }

    // Set loading state for this specific box
    setIsUploadingImages((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    // Create preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = previewUrl;
      return newUrls;
    });

    // Prepare FormData for upload
    const formData = new FormData();
    formData.append("image", file);

    uploadImageMutate(formData, {
      onSuccess: (response) => {
        console.log("📸 Style Image upload response:", response);
        const imageUrl =
          response?.data?.data?.url ||
          response?.data?.url ||
          response?.data?.image_url;

        if (imageUrl) {
          // Revoke the preview URL and set the actual URL
          URL.revokeObjectURL(previewUrl);
          setPhotoUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index] = imageUrl;
            return newUrls;
          });
          toastSuccess(`Image ${index + 1} uploaded successfully!`);
        } else {
          toastError("Image uploaded but URL not received");
          // Keep the preview if URL not received
        }

        setIsUploadingImages((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      },
      onError: (error) => {
        console.error("📸 Style Image upload error:", error);
        // Revert to empty on error
        URL.revokeObjectURL(previewUrl);
        setPhotoUrls((prev) => {
          const newUrls = [...prev];
          newUrls[index] = "";
          return newUrls;
        });
        toastError(`Failed to upload image ${index + 1}. Please try again.`);
        setIsUploadingImages((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      },
    });
  };

  const removeImage = (index) => {
    // Revoke object URL if it's a preview
    if (photoUrls[index] && photoUrls[index].startsWith("blob:")) {
      URL.revokeObjectURL(photoUrls[index]);
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Add New Style</h1>
      </div>
      <DraftNotification />
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Tailor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tailor *
          </label>
          {tailorsLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              Loading tailors...
            </div>
          ) : (
            <select
              {...formik.getFieldProps("vendor_id")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a tailor</option>
              {getAllTailorData?.data?.map((tailor) => (
                <option key={tailor.id} value={tailor.id}>
                  {tailor.name} ({tailor.business_name || tailor.email})
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
              Style Name *
            </label>
            <input
              type="text"
              {...formik.getFieldProps("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter style name"
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
                  .filter((category) => category.type === "style")
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {formik.touched.gender && formik.errors.gender && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.gender}
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
            placeholder="Enter style description"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="elegant, formal, casual"
          />
        </div>

        {/* Style Specific Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Style Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Sewing Time (days) *
              </label>
              <input
                type="number"
                {...formik.getFieldProps("estimated_sewing_time")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter days"
                min="1"
              />
              {formik.touched.estimated_sewing_time &&
                formik.errors.estimated_sewing_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.estimated_sewing_time}
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Fabric Quantity (yards) *
              </label>
              <input
                type="number"
                {...formik.getFieldProps("minimum_fabric_qty")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter minimum yards"
                min="0"
              />
              {formik.touched.minimum_fabric_qty &&
                formik.errors.minimum_fabric_qty && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.minimum_fabric_qty}
                  </p>
                )}
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Upload (Optional)
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
                          style video
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
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-gray-900">
                      Video uploaded successfully
                    </p>
                    <div className="mt-2">
                      <video
                        controls
                        src={videoUrl}
                        className="w-full max-h-60 rounded-md bg-black"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <p className="text-xs text-gray-500 break-all mt-2">
                      {videoUrl}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-start">
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Style Images *
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload at least one image. The images should show different angles
            of the style.
          </p>

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
                            {index === 0 && "Front side style"}
                            {index === 1 && "Back side style"}
                            {index === 2 && "Right side style"}
                            {index === 3 && "Left side style"}
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
                      alt={`Style ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    {isUploadingImages[index] && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <FaSpinner className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isUploadingImages[index]}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                    {/* Replace button */}
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
              "Create Style"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStyle;
