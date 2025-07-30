import axios from "axios";
import Cookies from "js-cookie";
import sessionManager from "./SessionManager.js";

const baseURL = import.meta.env.VITE_APP_CaryBin_API_URL;

const CaryBinApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    // Accept: "application/vnd.api+json",
  },
});

const onRequest = (request) => {
  if (!navigator.onLine) {
    return Promise.reject(new Error("No internet connection"));
  }
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

const onResponseError = async (error) => {
  const originalRequest = error.config;
  const statusCode = error?.response?.status;

  // Handle 401 Unauthorized errors
  if (
    statusCode === 401 &&
    !originalRequest._retry &&
    (error?.response?.data?.message === "Unauthorized." ||
      error?.response?.data?.message === "Unauthenticated." ||
      error?.response?.data?.message === "jwt expired")
  ) {
    originalRequest._retry = true;

    try {
      console.log("🔄 API Interceptor: Attempting token refresh for 401 error");

      // Try to refresh the token
      const refreshSuccess = await sessionManager.refreshAccessToken();

      if (refreshSuccess) {
        // Get the new token and retry the original request
        const authData = sessionManager.getAuthData();
        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;

        console.log("✅ API Interceptor: Token refreshed, retrying request");
        return CaryBinApi(originalRequest);
      } else {
        // Refresh failed, session expired
        console.log(
          "❌ API Interceptor: Token refresh failed, handling session expiry",
        );
        sessionManager.handleSessionExpiry();
      }
    } catch (refreshError) {
      console.error(
        "❌ API Interceptor: Error during token refresh",
        refreshError,
      );
      sessionManager.handleSessionExpiry();
    }
  }

  return Promise.reject(error?.response);
};

CaryBinApi.interceptors.request.use(onRequest, onRequestError);
CaryBinApi.interceptors.response.use(onResponse, onResponseError);
export default CaryBinApi;
