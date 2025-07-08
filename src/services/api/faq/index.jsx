import CaryBinApi from "../../CarybinBaseUrl";

const getFAQs = () => {
  return CaryBinApi.get(`/faqs`);
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

const getPublicFAQs = () => {
  return CaryBinApi.get(`/faqs/public`);
};

const FAQService = {
  getFAQs,
  createFAQ,
  toggleFAQStatus,
  deleteFAQ,
  getPublicFAQs,
};

export default FAQService;
