import CaryBinApi from "../../CarybinBaseUrl";

const getUsersByRole = (params) => {
  return CaryBinApi.get(`/auth/users/${params.role}`, {
    params,
  });
};

const UserService = {
  getUsersByRole,
};

export default UserService;
