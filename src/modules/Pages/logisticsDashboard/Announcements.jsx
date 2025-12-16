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

const LogisticsAnnouncementsPage = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const { toastSuccess, toastError } = useToast();

  // Fetch announcements for customer role with user profile integration
  const {
    data: announcementsData,
    isLoading,
    error,
    refetchAll,
    profileData,
    isProfileLoading,
    isAnnouncementsLoading,
  } = useGetAnnouncementsWithProfile("user", "all");

  // Mark as read mutation
  const markAsReadMutation = useMarkAnnouncementAsRead();

  // Extract announcements
  let announcements = [];
  if (announcementsData) {
    if (Array.isArray(announcementsData)) {
      announcements = announcementsData;
    } else if (announcementsData.data && Array.isArray(announcementsData.data)) {
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
          "Failed to mark announcement as read. Please try again."
      );
    }
  };

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

  const isMarkingAsRead = (announcementId) => {
    return (
      markAsReadMutation.isPending &&
      markAsReadMutation.variables === announcementId
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 sm:p-8 text-center">
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
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Single Announcement View (Mobile-Responsive) ---
  if (selectedAnnouncement) {
    const read = isAnnouncementRead(selectedAnnouncement);
    const isMarking = isMarkingAsRead(selectedAnnouncement.id);

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToList}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6 group"
          >
            <FaArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Announcements</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-400 p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaBullhorn className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
                    Customer Announcement
                  </span>
                </div>

                {read ? (
                  <span className="flex items-center text-green-200 text-sm font-semibold">
                    <FaCheckCircle className="mr-2" /> Read
                  </span>
                ) : (
                  <button
                    className="w-full sm:w-auto cursor-pointer px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isMarking}
                    onClick={() => handleMarkAsRead(selectedAnnouncement)}
                  >
                    {isMarking ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>
                        Marking...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FaCheckCircle className="mr-2" />
                        Mark as Read
                      </span>
                    )}
                  </button>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">
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

            <div className="p-4 sm:p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
                  {selectedAnnouncement.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Announcements List View (Mobile-Responsive) ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaBullhorn className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Announcements
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Stay updated with the latest news and important information.
          </p>
        </div>

        {/* Loading State Skeleton is kept, adjusted padding */}
        {isLoading && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-purple-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <div className="text-sm text-gray-600">
                  {isProfileLoading && !isAnnouncementsLoading && (
                    <span>Loading your profile information...</span>
                  )}
                  {!isProfileLoading && isAnnouncementsLoading && (
                    <span>Fetching personalized announcements...</span>
                  )}
                  {isProfileLoading && isAnnouncementsLoading && (
                    <span>Preparing your announcements...</span>
                  )}
                  {!isProfileLoading && !isAnnouncementsLoading && (
                    <span>Loading announcements...</span>
                  )}
                </div>
              </div>
            </div>
            {/* Skeleton Cards - adjusted padding/spacing for responsiveness */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
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

        {/* Empty State - adjusted padding */}
        {!isLoading && announcements.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
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

        {/* Announcements List */}
        {!isLoading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const read = isAnnouncementRead(announcement);
              const isMarking = isMarkingAsRead(announcement.id);

              return (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer group relative ${
                    read ? "opacity-75" : ""
                  }`}
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  {/* Container: Stack vertical on mobile, row on desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    
                    {/* Icon Section */}
                    <div className="flex-shrink-0 flex items-center justify-between w-full sm:w-auto">
                      <div
                        className={`w-12 h-12 ${
                          read
                            ? "bg-gray-400"
                            : "bg-gradient-to-br from-purple-500 to-pink-500"
                        } rounded-lg flex items-center justify-center`}
                      >
                        <FaBullhorn className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Mobile-only Read Badge */}
                      {read && (
                        <div className="sm:hidden bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <FaCheckCircle className="mr-1 h-3 w-3" />
                          Read
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        {/* Text Content */}
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-semibold ${
                              read ? "text-gray-600" : "text-gray-900"
                            } group-hover:text-purple-600 transition-colors pr-0 sm:pr-20`}
                          >
                            {announcement.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 mt-1 mb-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt className="h-3 w-3" />
                              <span>{formatDate(announcement.created_at)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaClock className="h-3 w-3" />
                              <span>{formatTime(announcement.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 line-clamp-2 text-sm sm:text-base">
                            {announcement.message}
                          </p>
                        </div>

                        {/* Actions Section: Moves to bottom on mobile, Right on Desktop */}
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-row sm:flex-col justify-end sm:items-end gap-2 flex-shrink-0">
                          {!read && (
                            <button
                              className="cursor-pointer flex items-center px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isMarking}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(announcement);
                              }}
                            >
                              {isMarking ? (
                                <span className="flex items-center">
                                  <span className="animate-spin mr-1 h-3 w-3 border-b-2 border-purple-600 rounded-full"></span>
                                  Marking...
                                </span>
                              ) : (
                                <>
                                  <FaCheckCircle className="mr-1" />
                                  Mark as Read
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* Eye Icon: Hidden on mobile to save space, shown on desktop */}
                          <div className="hidden sm:block p-2 text-gray-400 group-hover:text-purple-600 group-hover:bg-purple-50 rounded-lg transition-colors">
                            <FaEye className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Read Badge (Absolute position for desktop) */}
                  {read && (
                    <div className="hidden sm:flex absolute top-4 right-4 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold items-center">
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

export default LogisticsAnnouncementsPage;