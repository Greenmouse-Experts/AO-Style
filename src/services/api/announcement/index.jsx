import CaryBinApi from "../../CarybinBaseUrl";

const sendAnnouncement = (payload) => {
  return CaryBinApi.post(`/announcements/send`, payload);
};

const AnnouncementService = {
  sendAnnouncement,
};

export default AnnouncementService;
