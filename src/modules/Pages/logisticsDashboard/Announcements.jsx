import { useState } from "react";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaArrowLeft,
  FaTruck,
} from "react-icons/fa";
import dayjs from "dayjs";
import useGetAnnouncements from "../../../hooks/announcement/useGetAnnouncements";
import useToast from "../../../hooks/useToast";

const LogisticsAnnouncementsPage = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { toastError } = useToast();

  // Fetch announcements for logistics role
  const {
    data: announcementsData,
    isLoading,
    error,
    refetch,
  } = useGetAnnouncements("user");

  // Console log the full response to understand the structure
  console.log("Logistics Announcements - Full Response:", announcementsData);
  console.log("Logistics Announcements - Data:", announcementsData?.data);
  console.log(
    "Logistics Announcements - Nested Data:",
    announcementsData?.data?.data
  );

  const announcements = announcementsData?.data?.data || [];

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleBackToList = () => {
    setSelectedAnnouncement(null);
  };

  const formatDate = (dateString) => {
    try {
      return dayjs(dateString).format("MMM DD, YYYY");
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString) => {
    try {
      return dayjs(dateString).format("h:mm A");
    } catch {
      return "Invalid Time";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaBullhorn className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Announcements
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.response?.data?.message ||
                "There was an error loading announcements."}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Single Announcement View
  if (selectedAnnouncement) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6 group"
          >
            <FaArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Announcements</span>
          </button>

          {/* Announcement Detail */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-400 p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaTruck className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  Logistics Announcement
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {selectedAnnouncement.subject}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <FaCalendarAlt className="h-4 w-4" />
                  <span>{formatDate(selectedAnnouncement.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock className="h-4 w-4" />
                  <span>{formatTime(selectedAnnouncement.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {selectedAnnouncement.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Announcements List View
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaBullhorn className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Logistics Announcements
            </h1>
          </div>
          <p className="text-gray-600">
            Important updates and information for logistics users.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && announcements.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaTruck className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Announcements Yet
            </h3>
            <p className="text-gray-600">
              You're all caught up! New logistics announcements will appear here
              when available.
            </p>
          </div>
        )}

        {/* Announcements Grid */}
        {!isLoading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center">
                      <FaTruck className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {announcement.subject}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 mb-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FaCalendarAlt className="h-3 w-3" />
                            <span>{formatDate(announcement.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FaClock className="h-3 w-3" />
                            <span>{formatTime(announcement.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {announcement.message}
                        </p>
                      </div>

                      {/* Read More Button */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="p-2 text-gray-400 group-hover:text-purple-600 group-hover:bg-purple-50 rounded-lg transition-colors">
                          <FaEye className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsAnnouncementsPage;
