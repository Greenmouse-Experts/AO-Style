import CaryBinApi from "../../CarybinBaseUrl";

const createSubAdmin = (payload) => {
  return CaryBinApi.post(`/auth/register-admin`, payload);
};

const updateAdmin = (payload) => {
  return CaryBinApi.patch(`/admin-role/${payload.id}`, payload);
};

const deleteSubAdmin = (payload) => {
  return CaryBinApi.delete(`/auth/users/${payload.id}/delete-admin`);
};

const AdminService = {
  createSubAdmin,
  deleteSubAdmin,
};

export default AdminService;
