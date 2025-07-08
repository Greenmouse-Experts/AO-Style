import CaryBinApi from "../../CarybinBaseUrl";

const getFAQs = (page = 1, limit = 10) => {
  return CaryBinApi.get(`/faqs?page=${page}&limit=${limit}`);
};

const createFAQ = (payload) => {
  return CaryBinApi.post(`/faqs`, payload);
};

const toggleFAQStatus = (id, payload) => {
  return CaryBinApi.patch(`/faqs/${id}`, payload);
};

const deleteFAQ = (id) => {
  return CaryBinApi.delete(`/faqs/${id}`);
};

const getPublicFAQs = (page = 1, limit = 10) => {
  return CaryBinApi.get(`/faqs/public?page=${page}&limit=${limit}`);
};

const FAQService = {
  getFAQs,
  createFAQ,
  toggleFAQStatus,
  deleteFAQ,
  getPublicFAQs,
};

export default FAQService;
