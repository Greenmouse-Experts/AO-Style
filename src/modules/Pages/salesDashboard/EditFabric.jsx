import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import imageUpload from "../../../utils/imageUpload";
import useGetProductCategories from "../../../hooks/useGetProductCategories";
import useGetMarkets from "../../../hooks/useGetMarkets";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import Autocomplete from "react-google-autocomplete";
import { Edit } from "lucide-react";
import useGetMarketRepFabricById from "../../../hooks/marketRep/useGetFabricDetails";
import { useLocation } from "react-router-dom";
import useEditMarketRepFabric from "../../../hooks/marketRep/useEditMarketRepFabric";

const EditFabric = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Expecting fabricId and selectedVendor from location.state
  const { id: itemId } = useParams();
  const { selectedVendor: _selectedVendor } = location.state || {};
  const { toastSuccess, toastError } = useToast();

  // State for images and video
  const [_photoFiles, setPhotoFiles] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [_videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Fetch product categories
  const { categories, isLoading: categoriesLoading } =
    useGetProductCategories();

  // Fetch markets
  const { markets, isLoading: marketsLoading } = useGetMarkets();

  // Fetch fabric vendors
  const { data: getAllFabVendorData, isLoading: vendorsLoading } =
    useGetAllMarketRepVendor({}, "fabric-vendor");

  // Fetch fabric details by ID
  const {
    data: getFabricDataById,
    isLoading: isFabricLoading,
    error: errorGotten,
  } = useGetMarketRepFabricById(itemId);
  console.log("Fetched fabric data:", getFabricDataById, errorGotten);
  // Video upload hook
  const { uploadVideoMutate } = useUploadVideo();

  // Edit fabric mutation
  const { createMarketRepFabricMutate, isPending: isEditing } =
    useEditMarketRepFabric();

  // Populate form with fetched fabric data
  useEffect(() => {
    if (getFabricDataById?.data) {
      const fabric = getFabricDataById.data;
      // Set form fields
      formik.setValues({
        vendor_id: fabric.vendor_id || "",
        name: fabric.product?.name || "",
        category_id: fabric.product?.category_id || "",
        description: fabric.product?.description || "",
        gender: fabric.product?.gender || "",
        price: fabric.product?.price || "",
        quantity: fabric.quantity || 1,
        market_id: fabric.market_id || "",
        weight_per_unit: fabric.weight_per_unit || "",
        local_name: fabric.local_name || "",
        manufacturer_name: fabric.manufacturer_name || "",
        material_type: fabric.material_type || "",
        alternative_names: fabric.alternative_names || "",
        fabric_texture: fabric.fabric_texture || "",
        feel_a_like: fabric.feel_a_like || "",
        minimum_yards: fabric.minimum_yards || "1",
        available_colors: Array.isArray(fabric.available_colors)
          ? fabric.available_colors.join(", ")
          : fabric.available_colors || "",
        fabric_colors: Array.isArray(fabric.fabric_colors)
          ? fabric.fabric_colors.join(", ")
          : fabric.fabric_colors || "",
        tags: Array.isArray(fabric.product?.tags)
          ? fabric.product.tags.join(", ")
          : fabric.product?.tags || "",
        video_url: fabric.video_url || "",
      });

      // Set images and video
      if (Array.isArray(fabric.photos)) {
        setPhotoUrls(fabric.photos);
      }
      if (fabric.video_url) {
        setVideoUrl(fabric.video_url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFabricDataById]);

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
    fabric_colors: Yup.string().required("Fabric colors is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
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
      fabric_colors: "",
      tags: "",
      video_url: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (photoUrls.length === 0) {
        toastError("Please upload at least one photo");
        return;
      }
      // Prepare payload for update
      const payload = {
        id: itemId,
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
          fabric_colors: values.fabric_colors,
          photos: photoUrls,
          video_url: values.video_url,
        },
      };

      createMarketRepFabricMutate(
        { id: itemId, payload, vendorId: values.vendor_id },
        {
          onSuccess: () => {
            toastSuccess("Fabric updated successfully!");
            navigate("/sales/my-products");
          },
          onError: () => {
            // Error handled in hook
          },
        },
      );
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
      onError: () => {
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

  // --- handleImageUpload to show previews immediately ---
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

    // Show previews immediately
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotoUrls((prev) => [...prev, ...previewUrls]);
    setIsUploadingImages(true);

    try {
      const result = await imageUpload.uploadImagesWithProgress(files, () => {
        // Optionally show progress
      });

      if (result.success && result.results.length > 0) {
        // Replace preview URLs with real URLs after upload
        const uploadedUrls = result.results
          .filter((r) => r.url)
          .map((r) => r.url);
        setPhotoUrls((prev) => {
          // Remove the preview URLs we just added, and append the uploaded URLs
          const prevWithoutPreviews = prev.slice(
            0,
            prev.length - previewUrls.length,
          );
          return [...prevWithoutPreviews, ...uploadedUrls];
        });

        if (result.failed > 0) {
          toastError(
            `${result.uploaded} images uploaded successfully, ${result.failed} failed.`,
          );
        } else {
          toastSuccess(`${result.uploaded} images uploaded successfully!`);
        }
      } else {
        toastError("Failed to upload images. Please try again.");
        // Remove previews if upload failed
        setPhotoUrls((prev) => prev.slice(0, prev.length - previewUrls.length));
        setPhotoFiles((prev) =>
          prev.slice(0, prev.length - previewUrls.length),
        );
      }
    } catch {
      toastError("Failed to upload images. Please try again.");
      setPhotoUrls((prev) => prev.slice(0, prev.length - previewUrls.length));
      setPhotoFiles((prev) => prev.slice(0, prev.length - previewUrls.length));
    } finally {
      setIsUploadingImages(false);
      // Clean up object URLs after upload (optional, but recommended)
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
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
        <h1 className="text-2xl font-bold text-gray-800">
          {isFabricLoading ? "Loading Fabric..." : "Edit Fabric"}
        </h1>
      </div>

      {isFabricLoading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin mr-2 text-purple-500" />
          <span className="text-gray-600">Loading fabric details...</span>
        </div>
      )}

      {!isFabricLoading && (
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
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
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
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.price}
                </p>
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
                {formik.touched.material_type &&
                  formik.errors.material_type && (
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
                {formik.touched.minimum_yards &&
                  formik.errors.minimum_yards && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.minimum_yards}
                    </p>
                  )}
              </div>

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
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fabric Colors *
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="color"
                    id="fabric-color-picker"
                    className="w-10 h-10 border border-gray-300 rounded"
                    value={(() => {
                      // Show last color or default to #000000
                      const colors = formik.values.fabric_colors
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
                      let current = formik.values.fabric_colors
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean);
                      // Prevent duplicate colors
                      if (!current.includes(color)) {
                        current.push(color);
                        formik.setFieldValue(
                          "fabric_colors",
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
                  {...formik.getFieldProps("fabric_colors")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Primary fabric colors"
                  onChange={(e) => {
                    // Allow manual editing as well
                    formik.setFieldValue("fabric_colors", e.target.value);
                  }}
                />
                {/* Show color chips for selected colors */}
                <div className="flex flex-wrap mt-2 gap-2">
                  {formik.values.fabric_colors
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
                            const colors = formik.values.fabric_colors
                              .split(",")
                              .map((c) => c.trim())
                              .filter(Boolean)
                              .filter((_, i) => i !== idx);
                            formik.setFieldValue(
                              "fabric_colors",
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
                {formik.touched.fabric_colors &&
                  formik.errors.fabric_colors && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.fabric_colors}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Product Images
            </h3>

            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span>{" "}
                    fabric images
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
                      alt={`Fabric ${index + 1}`}
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
              disabled={isEditing || isUploadingImages || isUploadingVideo}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isEditing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Fabric"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditFabric;
