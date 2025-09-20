import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import useCreateMarketRepStyle from "../../../hooks/marketRep/useCreateMarketRepStyle";

import imageUpload from "../../../utils/imageUpload";
import useGetProductCategories from "../../../hooks/useGetProductCategories";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import Autocomplete from "react-google-autocomplete";

const AddStyle = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();

  const [_photoFiles, setPhotoFiles] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [_videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Create style mutation
  const { createMarketRepStyleMutate, isPending: isCreating } =
    useCreateMarketRepStyle();

  // Fetch product categories
  const { categories, isLoading: categoriesLoading } =
    useGetProductCategories();

  // Fetch tailors/fashion designers
  const { data: getAllTailorData, isLoading: tailorsLoading } =
    useGetAllMarketRepVendor({}, "fashion-designer");

  // Video upload hook
  const { uploadVideoMutate } = useUploadVideo();

  const validationSchema = Yup.object({
    vendor_id: Yup.string().required("Please select a tailor"),
    name: Yup.string().required("Style name is required"),
    category_id: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    gender: Yup.string().required("Gender is required"),
    price: Yup.number()
      .required("Price is required")
      .min(1, "Price must be greater than 0"),
    // original_price: Yup.number()
    //   .required("Original price is required")
    //   .min(1, "Price must be greater than 0"),
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
      // sku: "",
      description: "",
      gender: "female",
      tags: "",
      price: "",
      // original_price: "",
      estimated_sewing_time: 1,
      minimum_fabric_qty: 0,
      video_url: "",
      // address: "",
      // latitude: "",
      // longitude: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (photoUrls.length === 0) {
        toastError("Please upload at least one photo");
        return;
      }

      const payload = {
        vendor_id: values.vendor_id,
        product: {
          type: "STYLE",
          name: values.name,
          category_id: values.category_id,
          // sku: values.sku,
          description: values.description,
          gender: values.gender,
          tags: values.tags
            ? values.tags.split(",").map((tag) => tag.trim())
            : [],
          price: values.price.toString(),
          // original_price: values.original_price.toString(),
        },
        style: {
          estimated_sewing_time: Number(values.estimated_sewing_time),
          minimum_fabric_qty: Number(values.minimum_fabric_qty),
          photos: photoUrls,
          video_url: values.video_url,
        },
      };

      console.log("🔧 STYLE PAYLOAD: Sending payload to API:", payload);
      console.log("🔧 STYLE PAYLOAD: Payload structure:", {
        vendor_id: payload.vendor_id,
        product: payload.product,
        style: payload.style,
      });
      console.log(
        "🔧 STYLE PAYLOAD: Photos count:",
        payload.style.photos.length,
      );

      createMarketRepStyleMutate(payload, {
        onSuccess: (response) => {
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

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files before upload
    const invalidFiles = files.filter(
      (file) => !imageUpload.isValidImageFile(file),
    );
    if (invalidFiles.length > 0) {
      toastError(
        `Invalid files: ${invalidFiles.map((f) => f.name).join(", ")}. Please use PNG, JPG, or JPEG files under 5MB.`,
      );
      return;
    }

    setIsUploadingImages(true);
    try {
      const result = await imageUpload.uploadImagesWithProgress(
        files,
        (progress) => {
          console.log(
            `Upload progress: ${progress.percentage}% (${progress.currentFile})`,
          );
        },
      );

      if (result.success && result.results.length > 0) {
        const urls = result.results.filter((r) => r.url).map((r) => r.url);
        setPhotoUrls((prev) => [...prev, ...urls]);
        setPhotoFiles((prev) => [...prev, ...files]);

        if (result.failed > 0) {
          toastError(
            `${result.uploaded} images uploaded successfully, ${result.failed} failed.`,
          );
        } else {
          toastSuccess(`${result.uploaded} images uploaded successfully!`);
        }
      } else {
        toastError("Failed to upload images. Please try again.");
      }
    } catch {
      toastError("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Style</h1>
      </div>

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
                Estimated Sewing Time (hours) *
              </label>
              <input
                type="number"
                {...formik.getFieldProps("estimated_sewing_time")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter hours"
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

          <div className="mt-4">
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Video uploaded successfully
                    </p>
                    <p className="text-xs text-gray-500 break-all">
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
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Style Images
          </h3>

          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaUpload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> style
                  images
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or JPEG (MAX. 5MB each)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImages}
              />
            </label>
          </div>

          {/* Display uploaded images */}
          {photoUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Style ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isUploadingImages && (
            <div className="flex items-center justify-center py-4">
              <FaSpinner className="animate-spin mr-2" />
              <span>Uploading images...</span>
            </div>
          )}
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
            disabled={isCreating || isUploadingImages || isUploadingVideo}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
