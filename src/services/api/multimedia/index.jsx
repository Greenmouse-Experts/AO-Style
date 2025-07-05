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

const uploadImages = (payload) => {
  return CaryBinApi.post(`/multimedia-upload/images`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
};

const uploadVideo = (payload) => {
  return CaryBinApi.post(`/multimedia-upload/video`, payload, {
    headers: {
      "Content-Type": undefined,
    },
  });
};

const MediaService = {
  uploadImage,
  uploadDocument,
  uploadVideo,
  uploadImages,
};

export default MediaService;
