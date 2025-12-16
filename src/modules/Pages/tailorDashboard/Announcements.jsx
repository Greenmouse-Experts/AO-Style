import { useState } from "react";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import dayjs from "dayjs";
import useGetAnnouncementsWithProfile from "../../../hooks/announcement/useGetAnnouncementsWithProfile";
import useToast from "../../../hooks/useToast";
import useMarkAnnouncementAsRead from "../../../hooks/announcement/useMarkAnnouncementAsRead";
// Removed unused import: import { ref } from "yup";

const TailorAnnouncementsPage = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { toastSuccess, toastError } = useToast();

  // Fetch announcements for customer role with user profile integration
  const {
    data: announcementsData,
    isLoading,
    error,
    refetchAll: refetchAll,
    profileData,
    isProfileLoading,
    isAnnouncementsLoading,
  } = useGetAnnouncementsWithProfile("user", "all");

  // Mark as read mutation
  const markAsReadMutation = useMarkAnnouncementAsRead();

  // Extract announcements from different possible data structures
  let announcements = [];
  if (announcementsData) {
    if (Array.isArray(announcementsData)) {
      announcements = announcementsData;
    } else if (
      announcementsData.data &&
      Array.isArray(announcementsData.data)
    ) {
      announcements = announcementsData.data;
    } else if (
      announcementsData.data?.data &&
      Array.isArray(announcementsData.data.data)
    ) {
      announcements = announcementsData.data.data;
    }
  }

  // Helper: check if announcement is read
  const isAnnouncementRead = (announcement) => {
    return announcement.read === true || announcement.is_read === true;
  };

  // Mark as read handler
  const handleMarkAsRead = async (announcement) => {
    if (isAnnouncementRead(announcement)) return;

    try {
      await markAsReadMutation.mutateAsync(announcement.id);
      toastSuccess("Announcement marked as read!");
      refetchAll();
    } catch (error) {
      console.error("Failed to mark announcement as read:", error);
      toastError(
        error?.response?.data?.message ||
          "Failed to mark announcement as read. Please try again.",
      );
    }
  };

  // When opening an announcement, mark as read if not already
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    if (!isAnnouncementRead(announcement)) {
      handleMarkAsRead(announcement);
    }
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

  // Check if a specific announcement is being marked as read
  const isMarkingAsRead = (announcementId) => {
    return (
      markAsReadMutation.isPending &&
      markAsReadMutation.variables === announcementId
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaBullhorn className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Announcements
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.response?.data?.message ||
                "There was an error loading announcements."}
            </p>
            <button
              onClick={() => refetchAll()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
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
    const read = isAnnouncementRead(selectedAnnouncement);
    const isMarking = isMarkingAsRead(selectedAnnouncement.id);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-400 p-4 md:p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaBullhorn className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    Customer Announcement
                  </span>
                </div>

                {read ? (
                  <span className="flex items-center text-green-200 text-sm font-semibold">
                    <FaCheckCircle className="mr-2" /> Read
                  </span>
                ) : (
                  <button
                    className="cursor-pointer w-full md:w-auto px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    disabled={isMarking}
                    onClick={() => handleMarkAsRead(selectedAnnouncement)}
                  >
                    {isMarking ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>
                        Marking...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaCheckCircle className="mr-2" />
                        Mark as Read
                      </span>
                    )}
                  </button>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold mb-2 break-words">
                {selectedAnnouncement.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
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
            <div className="p-4 md:p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaBullhorn className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Announcements
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600">
            Stay updated with the latest news and important information.
          </p>
        </div>

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-purple-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 flex-shrink-0"></div>
                <div className="text-sm text-gray-600">
                  {isProfileLoading && !isAnnouncementsLoading && (
                    <span>Loading profile...</span>
                  )}
                  {!isProfileLoading && isAnnouncementsLoading && (
                    <span>Fetching announcements...</span>
                  )}
                  {isProfileLoading && isAnnouncementsLoading && (
                    <span>Preparing announcements...</span>
                  )}
                  {!isProfileLoading && !isAnnouncementsLoading && (
                    <span>Loading...</span>
                  )}
                </div>
              </div>
            </div>

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 animate-pulse"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaBullhorn className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Announcements Yet
            </h3>
            <p className="text-gray-600">
              You're all caught up! New announcements will appear here when
              available.
            </p>
          </div>
        )}

        {/* Announcements Grid */}
        {!isLoading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const read = isAnnouncementRead(announcement);
              const isMarking = isMarkingAsRead(announcement.id);

              return (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all cursor-pointer group relative ${
                    read ? "opacity-75" : ""
                  }`}
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  {/* Container: Stack vertical on mobile, horizontal on desktop */}
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 hidden xs:block">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 ${
                          read
                            ? "bg-gray-400"
                            : "bg-gradient-to-br from-purple-500 to-pink-500"
                        } rounded-lg flex items-center justify-center`}
                      >
                        <FaBullhorn className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      {/* Inner Layout: Stack on mobile to put "Action" at bottom */}
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div className="flex-1">
                          {/* Mobile Icon (Inline) - Optional if you want icon next to title on small screens */}
                          <div className="flex items-center gap-3 mb-2 sm:mb-0">
                             {/* Small screen only icon */}
                            <div className="sm:hidden flex-shrink-0">
                              <div
                                className={`w-8 h-8 ${
                                  read
                                    ? "bg-gray-400"
                                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                                } rounded-lg flex items-center justify-center`}
                              >
                                <FaBullhorn className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            
                            <h3
                              className={`text-base md:text-lg font-semibold ${
                                read ? "text-gray-600" : "text-gray-900"
                              } group-hover:text-purple-600 transition-colors break-words pr-16 sm:pr-0`}
                            >
                              {announcement.subject}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1 mb-3">
                            <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-500">
                              <FaCalendarAlt className="h-3 w-3" />
                              <span>{formatDate(announcement.created_at)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-500">
                              <FaClock className="h-3 w-3" />
                              <span>{formatTime(announcement.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-sm md:text-base text-gray-600 line-clamp-2">
                            {announcement.message}
                          </p>
                        </div>

                        {/* Read Status and Actions */}
                        {/* On mobile, this will sit below the text */}
                        <div className="flex-shrink-0 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                          <div className="sm:hidden text-xs text-gray-400 font-medium">
                            Tap to view details
                          </div>
                          
                          {!read && (
                            <button
                              className="cursor-pointer flex items-center px-3 py-1.5 md:py-1 bg-purple-50 text-purple-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-purple-100 transition-colors sm:mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isMarking}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(announcement);
                              }}
                            >
                              {isMarking ? (
                                <span className="flex items-center">
                                  <span className="animate-spin mr-1 h-3 w-3 border-b-2 border-purple-600 rounded-full"></span>
                                  <span className="hidden md:inline">Marking...</span>
                                  <span className="md:hidden">Wait...</span>
                                </span>
                              ) : (
                                <>
                                  <FaCheckCircle className="mr-1" />
                                  <span className="whitespace-nowrap">Mark as Read</span>
                                </>
                              )}
                            </button>
                          )}

                          <div className="hidden sm:block p-2 text-gray-400 group-hover:text-purple-600 group-hover:bg-purple-50 rounded-lg transition-colors">
                            <FaEye className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Single Read Badge - Position absolute */}
                  {read && (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold flex items-center">
                      <FaCheckCircle className="mr-1 h-3 w-3" />
                      Read
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorAnnouncementsPage;