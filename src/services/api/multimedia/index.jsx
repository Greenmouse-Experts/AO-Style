import CaryBinApi from "../../CarybinBaseUrl";

const uploadImage = (payload) => {
  return CaryBinApi.post(`/multimedia-upload/image`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
};

const MediaService = {
  uploadImage,
};

export default MediaService;
