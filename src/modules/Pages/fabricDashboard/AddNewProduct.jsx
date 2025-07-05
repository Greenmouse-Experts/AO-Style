import { useEffect, useState } from "react";
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

const AddProduct = () => {
  const location = useLocation();

  const productInfo = location?.state?.info;

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
    alternative_names: productInfo?.fabric?.material_type ?? "",
    fabric_texture: productInfo?.fabric?.fabric_texture ?? "",
    feel_a_like: productInfo?.fabric?.feel_a_like ?? "",
    quantity: productInfo?.fabric?.quantity ?? "",
    minimum_yards: productInfo?.fabric?.minimum_yards ?? "",
    available_colors: productInfo?.fabric?.available_colors ?? "",
    fabric_colors: productInfo?.fabric?.fabric_colors
      ?.split(",")
      ?.map((color) => color.trim()) ?? [""],
    video_url: productInfo?.fabric?.video_url ?? "",
    original_price: "",
    sku: productInfo?.sku ?? "",
    market_id: productInfo?.fabric?.market_id ?? "",
    multimedia_url: "",
    closeup_url: productInfo?.fabric?.photos[0] ?? undefined,

    spreadout_url: productInfo?.fabric?.photos[1] ?? "",
    manufacturers_url: productInfo?.fabric?.photos[2] ?? "",
    fabric_url: productInfo?.fabric?.photos[3] ?? "",
  };

  const [colorCount, setColorCount] = useState(1);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const { data: businessDetails } = useGetBusinessDetails();

  const increaseColorCount = () => {
    setColorCount(colorCount + 1);
    setFieldValue("available_colors", colorCount + 1);
  };

  const decreaseColorCount = () => {
    if (colorCount > 1) setColorCount(colorCount - 1);
    setFieldValue("available_colors", colorCount - 1);
  };

  const { isPending, createFabricProductMutate } = useCreateFabricProduct(
    businessDetails?.data?.id
  );

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

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };

  const { isPending: updateIsPending, updateFabricMutate } = useUpdateFabric();

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
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const [photoFiles, setPhotoFiles] = useState({});

  const navigate = useNavigate();

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
      if (productInfo) {
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
            },
            fabric: {
              market_id: val.market_id,
              weight_per_unit: val?.weight_per_unit?.toString(),
              location: {
                latitude: "1.2343444",
                longitude: "1.500332",
              },
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
            onSuccess: () => {
              navigate(-1);
            },
          }
        );
      } else {
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
            },
            fabric: {
              market_id: val.market_id,
              weight_per_unit: val?.weight_per_unit?.toString(),
              location: {
                latitude: "1.2343444",
                longitude: "1.500332",
              },
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
            onSuccess: () => {
              resetForm();
              navigate(-1);
            },
          }
        );
      }
    },
  });

  useEffect(() => {
    const current = values.fabric_colors;
    if (values.available_colors > current.length) {
      const updated = [
        ...current,
        ...Array(values.available_colors - current.length).fill("#000000"),
      ];
      setFieldValue("fabric_colors", updated);
    } else if (values.available_colors < current.length) {
      const trimmed = current.slice(0, values.available_colors);
      setFieldValue("fabric_colors", trimmed);
    }
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

  const handleFileChange = (label, file) => {
    const updated = {
      ...photoFiles,
      [label]: file,
    };

    setPhotoFiles(updated);
    onChange?.(updated);
  };

  const enableGooglePlaces =
    import.meta.env.VITE_ENABLE_GOOGLE_PLACES === "true";

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

  const { isPending: uploadVideoIsPending, uploadVideoMutate } =
    useUploadVideo();

  const { isPending: uploadImagesIsPending, uploadImagesMutate } =
    useUploadImages();

  return (
    <>
      <div className="bg-white px-6 py-4 mb-6 relative">
        <h1 className="text-2xl font-medium mb-3">
          {productInfo ? "Edit" : "Add"} Product
        </h1>
        <p className="text-gray-500">
          <Link to="/fabric" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; My Product &gt; {productInfo ? "Edit" : "Add"} Product
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <h2 className="text-lg font-semibold mb-6">
          {productInfo ? "Edit" : "Add"} Product
        </h2>

        <form className="" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fabric Name */}
              <div>
                <label className="block text-gray-700 mb-4">Fabric Name</label>
                <input
                  type="text"
                  name={"name"}
                  required
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Enter the fabric name"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-gray-700 mb-4">SKU</label>
                <input
                  type="text"
                  required
                  name="sku"
                  value={values.sku}
                  onChange={handleChange}
                  placeholder="Enter the unique identifier"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market */}
              <div>
                <label className="block text-gray-700 mb-4">Market</label>
                {/* <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
                  <option>Choose market</option>
                  <option>Local Market</option>
                  <option>Online Market</option>
                </select> */}
                <Select
                  options={marketList}
                  name="market_id"
                  value={marketList?.find(
                    (opt) => opt.value === values.market_id
                  )}
                  onChange={(selectedOption) => {
                    setFieldValue("market_id", selectedOption.value);
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
                {/* <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
                  <option>Choose suitability gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Unisex</option>
                </select> */}
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fabric Vendor */}
              {/* <div>
                <label className="block text-gray-700 mb-4">
                  Fabric Vendor
                </label>
                <input
                  type="text"
                  placeholder="Enter the name of the fabric vendor"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div> */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Weight per unit
                </label>
                <input
                  type="number"
                  name={"weight_per_unit"}
                  required
                  min={0}
                  value={values.weight_per_unit}
                  onChange={handleChange}
                  placeholder="Enter the weight per unit (minimum 0)"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-4">
                  Location Coordinate
                </label>
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Coordinate */}

              {/* Local Name */}
              <div>
                <label className="block text-gray-700 mb-4">Local Name</label>
                <input
                  type="text"
                  name={"local_name"}
                  required
                  value={values.local_name}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="Enter the name called by the manufacturer"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manufacturer's Name */}

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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="Enter the name it is called in other locations"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alternative Names */}

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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="Describe what it feels like"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            {/* Feel-a-like */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-gray-700 mb-4">
                  Quantity (Must be more than 10 years)
                </label>
                <input
                  type="number"
                  name={"quantity"}
                  value={values.quantity}
                  required
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="Enter the minimum yards for purchase"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                />
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
                    onChange={handleChange}
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
                      setFieldValue("fabric_colors", updated);
                    }}
                    className="w-full h-14 border border-gray-300 rounded-lg cursor-pointer"
                  />
                ))}
              </div>{" "}
            </div>

            {/* Price per unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-4">
                  Price per unit
                </label>
                <div className="flex items-center">
                  <span className="p-5 bg-gray-200 rounded-l-md">₦</span>
                  <input
                    type="number"
                    name={"price"}
                    required
                    value={values.price}
                    onChange={handleChange}
                    placeholder="Enter amount per unit"
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
                  placeholder="Enter the style description"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 outline-none"
                  required
                  type="text"
                  name={"description"}
                  value={values.description}
                  onChange={handleChange}
                />
              </div>

              {/* Market */}
              <div>
                <label className="block text-gray-700 mb-4">Category</label>
                {/* <select className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg">
                  <option>Choose market</option>
                  <option>Local Market</option>
                  <option>Online Market</option>
                </select> */}
                <Select
                  options={categoryList}
                  name="category_id"
                  value={categoryList?.find(
                    (opt) => opt.value === values.category_id
                  )}
                  onChange={(selectedOption) => {
                    setFieldValue("category_id", selectedOption.value);
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
                            setFieldValue("closeup_url", data?.data?.data?.url);
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
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={values.closeup_url}
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
                            setFieldValue(
                              "spreadout_url",
                              data?.data?.data?.url
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
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={values.spreadout_url}
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
                            setFieldValue(
                              "manufacturers_url",
                              data?.data?.data?.url
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
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={values.manufacturers_url}
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
                            setFieldValue("fabric_url", data?.data?.data?.url);
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
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={values.fabric_url}
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
                    console.log(file);
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
                      // Handle upload here
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isPending ||
                uploadVideoIsPending ||
                updateIsPending ||
                closeUpViewIsPending ||
                spreadOutViewIsPending ||
                manufacturersIsPending ||
                fabricIsPending
              }
              className="mt-6 w-full cursor-pointer py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
            >
              {isPending ||
              updateIsPending ||
              closeUpViewIsPending ||
              spreadOutViewIsPending ||
              manufacturersIsPending ||
              fabricIsPending
                ? "Please wait..."
                : productInfo
                ? "Update Fabric"
                : "Upload Fabric"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProduct;
