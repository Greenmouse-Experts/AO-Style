import CaryBinApi from "../../CarybinBaseUrl";

const uploadImage = (payload) => {
  return CaryBinApi.post(`/multimedia-upload/image`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
};

const uploadDocument = (payload) => {
  return CaryBinApi.post(`/multimedia-upload/documents`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
};

const MediaService = {
  uploadImage,
  uploadDocument,
};

export default MediaService;
