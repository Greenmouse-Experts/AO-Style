import CaryBinApi from "../../CarybinBaseUrl";

const getNotification = (params) => {
  return CaryBinApi.get(`/notification-track/fetch-notifications`, {
    params,
  });
};

const markkReadNotification = (payload) => {
  return CaryBinApi.patch(
    `/notification-track/mark-read/${payload?.id}`,
    payload
  );
};

const NotificationService = {
  getNotification,
  markkReadNotification,
};

export default NotificationService;
