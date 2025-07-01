import CaryBinApi from "../../CarybinBaseUrl";

const getAdminRoles = (params) => {
  return CaryBinApi.get(`/admin-role`);
};

const createAdminRole = (payload) => {
  return CaryBinApi.post(`/admin-role`, payload);
};

const createSubAdminRole = (payload) => {
  return CaryBinApi.post(`/admin-role`, payload);
};

const getAdminRoleById = (id) => {
  return CaryBinApi.get(`/admin-role/${id}`);
};

const updateAdminRole = (payload) => {
  return CaryBinApi.patch(`/admin-role/${payload.id}`, payload);
};

const deleteAdminRole = (payload) => {
  return CaryBinApi.delete(`/admin-role/${payload.id}`);
};

const AdminRoleService = {
  getAdminRoles,
  createAdminRole,
  getAdminRoleById,
  updateAdminRole,
  deleteAdminRole,
  createSubAdminRole,
};

export default AdminRoleService;
