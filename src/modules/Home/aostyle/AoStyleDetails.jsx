import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SavedMeasurementsDisplay from "../components/SavedMeasurementsDisplay";
import Breadcrumb from "../components/Breadcrumb";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export default function AnkaraGownPage() {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState("Upper Body");
  const [measurementUnit, setMeasurementUnit] = useState("cm");
  const [measurementsSubmitted, setMeasurementsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const styleInfo = location?.state?.info;

  const images = [
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094281/AoStyle/image_ijkebh.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094278/AoStyle/image-copy-2_crpdbi.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094277/AoStyle/image-copy-0_lonvru.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094277/AoStyle/image-copy-1_iok8hz.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094281/AoStyle/image_ijkebh.png",
  ];

  const tabs = ["Upper Body", "Lower Body", "Full Body"];

  const handleProceed = () => {
    const currentIndex = tabs.indexOf(selectedTab);
    if (currentIndex < tabs.length - 1) {
      setSelectedTab(tabs[currentIndex + 1]);
    }
  };

  const upperBodyMeasurements = [
    {
      name: "Bust Circumference",
      placeholder: "Enter the circumference of your bust",
    },
    { name: "Shoulder Width", placeholder: "Enter the width of your shoulder" },
    {
      name: "Armhole Circumference",
      placeholder: "Enter the circumference of your armhole",
    },
    { name: "Sleeve Length", placeholder: "Enter the length of your sleeve" },
    {
      name: "Bicep Circumference",
      placeholder: "Enter the circumference of your bicep",
    },
    {
      name: "Wrist Circumference",
      placeholder: "Enter the circumference of your wrist",
    },
  ];

  const lowerBodyMeasurements = [
    {
      name: "Waist Circumference",
      placeholder: "Enter your waist measurement",
    },
    { name: "Hip Circumference", placeholder: "Enter your hip measurement" },
    {
      name: "Thigh Circumference",
      placeholder: "Enter your thigh measurement",
    },
    { name: "Knee Circumference", placeholder: "Enter your knee measurement" },
    {
      name: "Trouser Length (Waist to Ankle)",
      placeholder: "Enter your trouser length",
    },
  ];

  const fullBodyMeasurements = [
    { name: "Height", placeholder: "Enter your height" },
    { name: "Dress/Gown Length", placeholder: "Enter your desired length" },
  ];

  const getMeasurements = () => {
    switch (selectedTab) {
      case "Lower Body":
        return lowerBodyMeasurements;
      case "Full Body":
        return fullBodyMeasurements;
      default:
        return upperBodyMeasurements;
    }
  };

  const unitOptions = ["cm", "in", "m"];

  // Check if the user came from /aostyle-details
  const cameFromAoStyleDetails =
    location.state?.from === "/aostyle-details" ||
    location.pathname === "/aostyle-details";

  // Automatically open the modal if the user came from /aostyle-details
  useEffect(() => {
    if (cameFromAoStyleDetails) {
      setIsModalOpen(true);
    }
  }, [cameFromAoStyleDetails]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Breadcrumb
        title="OAStyles"
        subtitle="Products"
        just="OAStyles Details"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
      />
      <section className="Resizer section px-4">
        <div>
          <div className="p-6">
            {/* Conditionally render the Fabric section */}
            {/* {cameFromAoStyleDetails && (
              <div className="bg-[#FFF2FF] p-4 rounded-lg mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-4">
                  FABRIC
                </h2>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png"
                      alt="product"
                      className="w-20 h-20 rounded object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">
                      Luxury Embellished Lace Fabrics
                    </h3>
                    <p className="mt-1 text-sm">X 2 Yards</p>
                    <p className="mt-1 text-[#2B21E5] text-sm">N 24,000</p>
                  </div>
                </div>
              </div>
            )} */}

            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Gallery */}
              <div className="flex md:w-1/1">
                <div className="flex flex-col gap-2 mr-4">
                  {styleInfo?.style?.photos?.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 ${selectedImage === index
                          ? "border-purple-500"
                          : "border-gray-200"
                        }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image}
                        alt={`Ankara Gown thumbnail ${index}`}
                        className="w-32 h-28 object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <img
                    src={styleInfo?.style?.photos[selectedImage]}
                    alt="Ankara Gown"
                    className="w-full h-auto object-cover rounded-md"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="md:w-1/2">
                <h1 className="text-3xl font-bold mb-4">{styleInfo?.name}</h1>

                {/* <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= 3 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-600">(15 Reviews)</span>
                </div> */}

                <p className="text-xl font-medium text-blue-600 mb-4">
                  ₦{styleInfo?.price}
                </p>

                {styleInfo?.tags?.length ? (
                  <div className="mb-6">
                    <p className="font-medium mb-4">Tags:</p>
                    <div className="flex gap-2">
                      {styleInfo?.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-8 py-2 rounded-full border border-gray-300 text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>

            {/* Measurement Section */}
            <div className="mt-20">
              {measurementsSubmitted ? (
                <div className="w-full">
                  <SavedMeasurementsDisplay
                    onAddNewMeasurement={() => {
                      setMeasurementsSubmitted(false);
                      setSelectedTab("Upper Body");
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col md:flex-col lg:flex-row gap-8">
                  {/* Measurement Image */}
                  <div className="md:w-full lg:w-2/5">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744902411/WhatsApp_Image_2025-04-17_at_15.09.49_r3aaap.jpg"
                      alt="Body measurement diagram"
                      className="w-full rounded-md border border-gray-300"
                    />
                  </div>

                  {/* Measurement Form */}
                  <div className="md:w-full lg:w-3/5">
                    <h2 className="text-xl font-medium max-w-xs text-purple-500 pb-2 border-b-1 border-purple-500 mb-8">
                      Your Measurement
                    </h2>
                    <h3 className="text-xl font-medium mb-4">
                      Fill in your measurements
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Fill the form below to give the tailor your accurate
                      measurement
                    </p>

                    {/* Tabs */}
                    <div className="flex mb-6 border-b border-purple-500">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          className={`px-8 py-3 font-medium relative ${selectedTab === tab
                              ? "text-purple-500"
                              : "text-gray-500"
                            }`}
                          onClick={() => setSelectedTab(tab)}
                        >
                          {tab}
                          {selectedTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Customer Name field only for Upper Body */}
                    {selectedTab === "Upper Body" && (
                      <div className="mb-6">
                        <label className="block text-gray-700 mb-4">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter customer name"
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        />
                      </div>
                    )}

                    {/* Dynamic Measurement Fields based on tab */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getMeasurements().map((measurement, index) => (
                        <div key={index} className="mb-4">
                          <label className="block text-gray-700 mb-4">
                            {measurement.name}
                          </label>
                          <div className="flex">
                            <input
                              type="text"
                              placeholder={measurement.placeholder}
                              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                            />
                            <div className="relative">
                              <select
                                className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                value={measurementUnit}
                                onChange={(e) =>
                                  setMeasurementUnit(e.target.value)
                                }
                              >
                                {unitOptions.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Proceed Button */}
                    <button
                      className="bg-gradient text-white font-medium py-3 px-6 cursor-pointer"
                      onClick={() => {
                        if (selectedTab === "Full Body") {
                          setMeasurementsSubmitted(true);
                        } else {
                          handleProceed();
                        }
                      }}
                    >
                      {selectedTab === "Upper Body"
                        ? "Proceed to Lower Body"
                        : selectedTab === "Lower Body"
                          ? "Proceed to Full Body"
                          : "Submit Measurements"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg w-[100%] sm:w-[500px]">
          <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3  mb-4">
            <h2 className="text-lg font-meduim">.</h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-meduim mb-3">
                You have a successfully added a Style{" "}
              </h2>
              <p className="text-sm leading-loose text-gray-500">
                You have added a style and a material to your order, you can
                proceed to checkout or keep shopping
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Link to="/shop">
                <button
                  onClick={closeModal}
                  className="border px-6 py-3 border-[#CCCCCC] text-gray-400 cursor-pointer"
                >
                  Back to Shop
                </button>
              </Link>
              <Link to="/view-cart">
                <button className="bg-gradient text-white px-6 py-3 cursor-pointer">
                  Proceed to View Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
