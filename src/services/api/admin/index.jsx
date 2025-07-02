import CaryBinApi from "../../CarybinBaseUrl";

const createSubAdmin = (payload) => {
  return CaryBinApi.post(`/auth/register-admin`, payload);
};

const updateAdminRole = (payload) => {
  return CaryBinApi.patch(`/auth/users/update-admin-role`, payload);
};

const deleteSubAdmin = (payload) => {
  return CaryBinApi.delete(`/auth/users/${payload.id}/delete-admin`);
};

const AdminService = {
  createSubAdmin,
  deleteSubAdmin,
  updateAdminRole,
};

export default AdminService;
