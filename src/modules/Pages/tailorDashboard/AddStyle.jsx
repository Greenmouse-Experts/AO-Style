import React, { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import ModalThanks from "./components/ModalThanks";

export default function StyleForm() {
  const [stylePhotos, setStylePhotos] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [styleVideo, setStyleVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sewingTime, setSewingTime] = useState("");

  // Mock function to fetch sewing time based on category
  useEffect(() => {
    const sewingTimes = {
      casual: 3,
      formal: 5,
      traditional: 7,
    };
    setSewingTime(sewingTimes[selectedCategory] || "");
  }, [selectedCategory]);

  const handlePhotoUpload = (side, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      setStylePhotos((prev) => ({ ...prev, [side]: file }));
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit");
        return;
      }
      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(file);
      videoElement.onloadedmetadata = () => {
        if (videoElement.duration > 10) {
          alert("Video exceeds 10 seconds limit");
          e.target.value = null;
          return;
        }
        setStyleVideo(file);
      };
    }
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission, e.g., send data to the server
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white p-6 mb-6 rounded-lg">
        <h1 className="text-xl md:text-2xl font-medium mb-3">All Styles</h1>
        <p className="text-gray-500 text-sm">
          <Link to="/tailor" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; My Catalog &gt; Add Style
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg max-w-2xl">
        <h1 className="text-lg font-semibold text-black mb-4">
          Submit New Style
        </h1>

        <div className="space-y-4">
          <form onSubmit={handleSubmit}>
            {/* Style Name */}
            <div>
              <label className="block text-gray-700 mb-4">Style Name</label>
              <input
                type="text"
                placeholder="Enter the name of style"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                required
              />
            </div>

            {/* SKU (Disabled) */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">SKU</label>
              <input
                type="text"
                placeholder="SKU will be generated automatically"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg bg-gray-100 text-gray-500"
                disabled
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
                required
              />
            </div>

            {/* Style Category and Estimated Sewing Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-4 mt-4">
                  Style Category
                </label>
                <select
                  className="w-full p-4 border border-[#CCCCCC] text-gray-700 outline-none rounded-lg"
                  required
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Choose style category</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="traditional">Traditional</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-4 mt-4">
                  Estimated Sewing Time (days)
                </label>
                <input
                  type="number"
                  placeholder="Fetched based on category"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg bg-gray-100 text-gray-500"
                  value={sewingTime}
                  disabled
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">Gender</label>
              <select
                className="w-full p-4 border border-[#CCCCCC] text-gray-700 outline-none rounded-lg"
                required
              >
                <option value="">Choose gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            {/* Photo Uploads */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">
                Upload Style Photos
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
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
                    accept="image/*"
                    className="mt-2 w-full"
                    onChange={(e) => handlePhotoUpload("front", e)}
                    required
                  />
                  {stylePhotos.front && (
                    <p className="text-xs text-gray-500 mt-2">
                      {stylePhotos.front.name}
                    </p>
                  )}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
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
                    accept="image/*"
                    className="mt-2 w-full"
                    onChange={(e) => handlePhotoUpload("back", e)}
                    required
                  />
                  {stylePhotos.back && (
                    <p className="text-xs text-gray-500 mt-2">
                      {stylePhotos.back.name}
                    </p>
                  )}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
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
                    accept="image/*"
                    className="mt-2 w-full"
                    onChange={(e) => handlePhotoUpload("right", e)}
                    required
                  />
                  {stylePhotos.right && (
                    <p className="text-xs text-gray-500 mt-2">
                      {stylePhotos.right.name}
                    </p>
                  )}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer">
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
                    accept="image/*"
                    className="mt-2 w-full"
                    onChange={(e) => handlePhotoUpload("left", e)}
                    required
                  />
                  {stylePhotos.left && (
                    <p className="text-xs text-gray-500 mt-2">
                      {stylePhotos.left.name}
                    </p>
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
                <UploadCloud className="mx-auto text-gray-400 mb-4" size={32} />
                <p className="text-xs mb-2">Upload video (Less than 10MB)</p>
                <input
                  type="file"
                  accept="video/*"
                  className="mt-2 w-full"
                  onChange={handleVideoUpload}
                  required
                />
                {styleVideo && (
                  <p className="text-xs text-gray-500 mt-2">
                    {styleVideo.name}
                  </p>
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

            {/* Price */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">Price</label>
              <div className="flex items-center gap-2">
                <span className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                  NGN
                </span>
                <input
                  type="number"
                  placeholder="Enter amount per unit"
                  className="flex-1 p-4 border border-[#CCCCCC] rounded-lg px-4 py-2 outline-none"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 mb-4 mt-4">Location</label>
              <input
                type="text"
                placeholder="Enter the location"
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                required
              />
            </div>

            {/* Modal and Submit Button */}
            <ModalThanks
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
            <button
              type="submit"
              className="bg-gradient text-white px-6 py-2 rounded w-full md:w-fit mt-4 cursor-pointer"
            >
              Submit Style
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
