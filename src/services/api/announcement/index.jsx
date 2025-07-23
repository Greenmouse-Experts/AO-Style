import CaryBinApi from "../../CarybinBaseUrl";

const sendAnnouncement = (payload) => {
  console.log("AnnouncementService.sendAnnouncement - Payload:", payload);
  return CaryBinApi.post(`/announcements/send`, payload);
};

const getAnnouncements = (role) => {
  // Use the correct endpoint for announcements by role
  let endpoint = "/announcements/user/fetch";
  if (role === "fabric-vendor") endpoint = "/announcements/fabric-vendor/fetch";
  else if (role === "fashion-designer") endpoint = "/announcements/fashion-designer/fetch";
  else if (role === "logistics-agent") endpoint = "/announcements/logistics-agent/fetch";
  else if (role === "market-representative") endpoint = "/announcements/market-representative/fetch";

  console.log("AnnouncementService.getAnnouncements - Role:", role);
  console.log("AnnouncementService.getAnnouncements - Endpoint:", endpoint);
  return CaryBinApi.get(endpoint)
    .then(response => {
      console.log("AnnouncementService.getAnnouncements - Response:", response);
      return response;
    })
    .catch(error => {
      console.error("AnnouncementService.getAnnouncements - Error:", error);
      throw error;
    });
};

const getAnnouncementById = (id) => {
  console.log("AnnouncementService.getAnnouncementById - ID:", id);
  return CaryBinApi.get(`/announcements/${id}`);
};

const AnnouncementService = {
  sendAnnouncement,
  getAnnouncements,
  getAnnouncementById,
};

export default AnnouncementService;
