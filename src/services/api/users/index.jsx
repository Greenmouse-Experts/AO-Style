import CaryBinApi from "../../CarybinBaseUrl";

const getUsersByRole = (params) => {
  return CaryBinApi.get(`/auth/users/${params.role}`, {
    params,
  });
};

const getUser = (id) => {
  return CaryBinApi.get(`/auth/user-details/${id}`);
};

const approveUserKyc = (payload) => {
  return CaryBinApi.patch(
    `/onboard/review-kyc/${payload.business_id}`,
    payload,
  );
};

const deleteUser = (id) => {
  return CaryBinApi.delete(`/delete-user/${id}`);
};

const UserService = {
  getUsersByRole,
  getUser,
  approveUserKyc,
  deleteUser,
};

export default UserService;
