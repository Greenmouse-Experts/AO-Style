import CaryBinApi from "../../CarybinBaseUrl";

const getAdminRoles = () => {
  return CaryBinApi.get(`/admin-role`);
};

const createAdminRole = (payload) => {
  return CaryBinApi.post(`/admin-role`, payload);
};

const getAdminRoleById = (id) => {
  return CaryBinApi.get(`/admin-role/${id}`);
};

const updateAdminRole = (id, payload) => {
  return CaryBinApi.patch(`/admin-role/${id}`, payload);
};

const deleteAdminRole = (id) => {
  return CaryBinApi.delete(`/admin-role/${id}`);
};

const AdminRoleService = {
  getAdminRoles,
  createAdminRole,
  getAdminRoleById,
  updateAdminRole,
  deleteAdminRole,
};

export default AdminRoleService;
