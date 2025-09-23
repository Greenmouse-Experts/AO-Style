import CaryBinApi from "../../CarybinBaseUrl";

const sendAnnouncement = (payload) => {
  console.log("AnnouncementService.sendAnnouncement - Payload:", payload);
  return CaryBinApi.post(`/announcements/send`, payload);
};

const getAnnouncements = (role, status = null) => {
  // Use the correct endpoint for announcements by role
  let endpoint = "/announcements/user/fetch";
  if (role === "fabric-vendor") endpoint = "/announcements/fabric-vendor/fetch";
  else if (role === "fashion-designer")
    endpoint = "/announcements/fashion-designer/fetch";
  else if (role === "logistics-agent")
    endpoint = "/announcements/logistics-agent/fetch";
  else if (role === "market-representative")
    endpoint = "/announcements/market-representative/fetch";

  // Add status query parameter if provided
  if (status) {
    endpoint += `?status=${status}`;
  }

  return CaryBinApi.get(endpoint)
    .then((response) => {
      console.log("AnnouncementService.getAnnouncements - Response:", response);
      return response;
    })
    .catch((error) => {
      console.error("AnnouncementService.getAnnouncements - Error:", error);
      throw error;
    });
};

// Add function to get announcements sent by admin
const getAdminAnnouncements = () => {
  const endpoint = "/announcements";
  console.log(
    "AnnouncementService.getAdminAnnouncements - Endpoint:",
    endpoint,
  );
  return CaryBinApi.get(endpoint)
    .then((response) => {
      console.log(
        "AnnouncementService.getAdminAnnouncements - Response:",
        response,
      );
      return response;
    })
    .catch((error) => {
      console.error(
        "AnnouncementService.getAdminAnnouncements - Error:",
        error,
      );
      throw error;
    });
};

const getAnnouncementById = (id) => {
  console.log("AnnouncementService.getAnnouncementById - ID:", id);
  return CaryBinApi.get(`/announcements/${id}`);
};

const markAnnouncementAsRead = (id) => {
  console.log("AnnouncementService.getAnnouncementById - ID:", id);
  return CaryBinApi.patch(`/announcements/mark-as-read/${id}`);
};

// Fixed service function - corrected parameter order and status handling
const getAnnouncementsWithTimestamp = (role, createdAt, status) => {
  // Use the correct endpoint for announcements by role
  let endpoint = "/announcements/user/fetch";
  if (role === "fabric-vendor") endpoint = "/announcements/user/fetch";
  else if (role === "fashion-designer") endpoint = "/announcements/user/fetch";
  else if (role === "logistics-agent") endpoint = "/announcements/user/fetch";
  else if (role === "market-representative")
    endpoint = "/announcements/user/fetch";

  // Build query parameters for createdAt and status
  const params = [];
  if (createdAt) params.push(`startDate=${encodeURIComponent(createdAt)}`);
  if (status) params.push(`status=${encodeURIComponent(status)}`);

  const queryString = params.length > 0 ? `?${params.join("&")}` : "";
  const fullEndpoint = `${endpoint}${queryString}`;

  return CaryBinApi.get(fullEndpoint)
    .then((response) => {
      console.log(
        "AnnouncementService.getAnnouncementsWithTimestamp - Response:",
        response,
      );
      return response;
    })
    .catch((error) => {
      console.error(
        "AnnouncementService.getAnnouncementsWithTimestamp - Error:",
        error,
      );
      throw error;
    });
};

const AnnouncementService = {
  sendAnnouncement,
  getAnnouncements,
  getAdminAnnouncements,
  getAnnouncementById,
  getAnnouncementsWithTimestamp,
  markAnnouncementAsRead,
};

export default AnnouncementService;
