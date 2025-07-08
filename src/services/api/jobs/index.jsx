import CaryBinApi from "../../CarybinBaseUrl";

// Jobs endpoints
const getJobs = () => {
  return CaryBinApi.get(`/jobs`);
};

const createJob = (payload) => {
  return CaryBinApi.post(`/jobs`, payload);
};

const updateJobStatus = (id, payload) => {
  return CaryBinApi.patch(`/jobs/${id}`, payload);
};

const deleteJob = (id) => {
  return CaryBinApi.delete(`/jobs/${id}`);
};

// Job Categories endpoints
const getJobCategories = () => {
  return CaryBinApi.get(`/job-categories`);
};

const createJobCategory = (payload) => {
  return CaryBinApi.post(`/job-categories`, payload);
};

const deleteJobCategory = (id) => {
  return CaryBinApi.delete(`/job-categories/${id}`);
};

const updateJobCategory = (id, payload) => {
  return CaryBinApi.patch(`/job-categories/${id}`, payload);
};

const JobService = {
  getJobs,
  createJob,
  updateJobStatus,
  deleteJob,
  getJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
};

export default JobService;
