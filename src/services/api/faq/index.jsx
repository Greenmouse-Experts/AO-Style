import CaryBinApi from "../../CarybinBaseUrl";

const getFAQs = (page = 1, limit = 10, q = "") => {
  let url = `/faqs?pagination[page]=${page}&pagination[limit]=${limit}`;
  if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  }
  return CaryBinApi.get(url);
};

const createFAQ = (payload) => {
  return CaryBinApi.post(`/faqs`, payload);
};

const updateFAQ = (id, payload) => {
  return CaryBinApi.patch(`/faqs/${id}`, payload);
};

const toggleFAQStatus = (id, payload) => {
  return CaryBinApi.patch(`/faqs/${id}`, payload);
};

const deleteFAQ = (id) => {
  return CaryBinApi.delete(`/faqs/${id}`);
};

const getPublicFAQs = (page = 1, limit = 10) => {
  return CaryBinApi.get(`/faqs/public?pagination[page]=${page}&pagination[limit]=${limit}`);
};

const FAQService = {
  getFAQs,
  createFAQ,
  updateFAQ,
  toggleFAQStatus,
  deleteFAQ,
  getPublicFAQs,
};

export default FAQService;
