import CaryBinApi from "../../CarybinBaseUrl";

const uploadImage = (payload) => {
  return CaryBinApi.post(`/multimedia-upload/image`, payload);
};

const MediaService = {
  uploadImage,
};

export default MediaService;
