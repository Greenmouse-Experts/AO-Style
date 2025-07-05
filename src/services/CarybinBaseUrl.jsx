import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_APP_CaryBin_API_URL;

const CaryBinApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    // Accept: "application/vnd.api+json",
  },
});

const onRequest = (request) => {
  // * get the user data if loggedin to access the token and pass it to the header authorization

  const isAdminRoute = window.location.pathname.includes("/admin");
  const accessToken = isAdminRoute
    ? Cookies.get("adminToken")
    : Cookies.get("token");
  request.headers.Authorization = `Bearer ${accessToken || ""}`;
  return request;
};

const onRequestError = (error) => {
  return Promise.reject(error);
};

const onResponse = (response) => {
  return response;
};

const onResponseError = (error) => {
  // * detect the current HTTP status code;
  const statusCode = error?.response?.status;
  // *401 means unauthorized. if unauthorized, it logs the current user out.
  // if (
  //   statusCode === 401 ||
  //   // @ts-ignore
  //   error?.response?.data?.message === "Unauthorized." ||
  //   // @ts-ignore
  //   error?.response?.data?.message === "Unauthenticated."
  // ) {
  //   Cookies.remove("token");
  //   window.location.href = "/login";
  // }
  return Promise.reject(error?.response);
};

CaryBinApi.interceptors.request.use(onRequest, onRequestError);
CaryBinApi.interceptors.response.use(onResponse, onResponseError);
export default CaryBinApi;
