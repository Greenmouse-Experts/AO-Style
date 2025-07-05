import CaryBinApi from "../../CarybinBaseUrl";

const getNotification = (params) => {
  return CaryBinApi.get(`/notification-track/fetch-notifications`, {
    params,
  });
};

const NotificationService = {
  getNotification,
};

export default NotificationService;
