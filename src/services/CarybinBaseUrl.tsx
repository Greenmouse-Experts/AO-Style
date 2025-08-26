import axios from "axios";
import Cookies from "js-cookie";
import sessionManager from "./SessionManager.js";
import useSessionManager from "../hooks/useSessionManager.jsx";

const baseURL = import.meta.env.VITE_APP_CaryBin_API_URL;

const CaryBinApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    // Accept: "application/vnd.api+json",
  },
});
export let carry = CaryBinApi;
const onRequest = (request) => {
  if (!navigator.onLine) {
    return Promise.reject(new Error("No internet connection"));
  }

  // Get fresh token from SessionManager first, fallback to cookies
  const authData = sessionManager.getAuthData();
  let accessToken = null;
  let tokenSource = "";

  if (authData && authData.accessToken) {
    accessToken = authData.accessToken;
    tokenSource = "SessionManager";
  } else {
    // Fallback to cookies if SessionManager doesn't have data
    const isAdminRoute = window.location.pathname.includes("/admin");
    accessToken = isAdminRoute
      ? Cookies.get("adminToken")
      : Cookies.get("token");
    tokenSource = "Cookies";
  }

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
    console.log(
      `🔑 Request: Using token from ${tokenSource} for ${request.url}`,
    );
  } else {
    console.log(`❌ Request: No token available for ${request.url}`);
  }

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
      console.log(
        `🔄 API Interceptor: Attempting token refresh for 401 error on ${originalRequest.url}`,
      );

      // Check if we have auth data first
      const authData = sessionManager.getAuthData();
      if (!authData || !authData.refreshToken) {
        console.log(
          "❌ API Interceptor: No auth data or refresh token, logging out",
        );
        sessionManager.handleSessionExpiry();
        return Promise.reject(error?.response);
      }

      console.log("🔍 API Interceptor: Current auth data before refresh:", {
        hasAccessToken: !!authData.accessToken,
        hasRefreshToken: !!authData.refreshToken,
        accessTokenLength: authData.accessToken?.length,
        refreshTokenExpiry: authData.refreshTokenExpiry,
      });

      // Try to refresh the token
      const refreshSuccess = await sessionManager.refreshAccessToken();

      if (refreshSuccess) {
        // Get the new token and retry the original request
        const newAuthData = sessionManager.getAuthData();
        console.log("🔍 API Interceptor: Auth data after refresh:", {
          hasAccessToken: !!newAuthData?.accessToken,
          accessTokenLength: newAuthData?.accessToken?.length,
          tokenChanged: authData.accessToken !== newAuthData?.accessToken,
        });

        if (newAuthData && newAuthData.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`;
          console.log(
            `✅ API Interceptor: Token refreshed, retrying request to ${originalRequest.url}`,
          );
          return CaryBinApi(originalRequest);
        } else {
          console.log("❌ API Interceptor: No new token after refresh");
          sessionManager.handleSessionExpiry();
        }
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
