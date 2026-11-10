import config from "@/config";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { handleSessionExpired } from "@/utils/sessionHandler";

export const axiosInstance = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  function (cfg) {
    return cfg;
  },
  function (error) {
    return Promise.reject(error);
  }
);

let isRefreshing = false;

let pendingQueue: {
  resolve: (value: unknown) => void;
  reject: (value: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  pendingQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(null);
    }
  });

  pendingQueue = [];
};

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as (AxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const errName = error.response?.data?.err?.name || "";

    // 1. Exclude auth endpoints from refresh loop to prevent circular deadlock
    const isAuthEndpoint =
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout") ||
      url.includes("/user/register");

    if (isAuthEndpoint) {
      // If the refresh-token endpoint itself failed (e.g. refresh token expired),
      // the user session is expired -> trigger clean auto-logout
      if (url.includes("/auth/refresh-token")) {
        handleSessionExpired("Your session has expired. Please sign in again.");
      }
      return Promise.reject(error);
    }

    // 2. Detect expired or unauthorized token
    const isTokenExpired =
      status === 401 ||
      message === "jwt expired" ||
      errName === "TokenExpiredError" ||
      (status === 500 && typeof message === "string" && message.toLowerCase().includes("jwt"));

    // 3. Handle token refresh
    if (isTokenExpired) {
      // If already retried once and still got 401, session is permanently expired
      if (originalRequest._retry) {
        handleSessionExpired("Your session has expired. Please sign in again.");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If another refresh call is currently in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        // Request new access token using refresh token in HTTP-only cookie
        await axiosInstance.post(
          "/auth/refresh-token",
          {},
          {
            _retry: true,
          } as any
        );

        // Refresh succeeded: resolve queued requests
        processQueue(null);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        // Refresh failed (refresh token expired or invalid)
        processQueue(refreshErr);
        handleSessionExpired("Your session has expired. Please sign in again.");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors
    return Promise.reject(error);
  }
);
