import { toast } from "sonner";

let isHandlingExpiry = false;

/**
 * Handles automatic logout and session cleanup when access or refresh token expires.
 * Thread-safe and debounced to prevent alert storms from multiple concurrent API calls.
 */
export const handleSessionExpired = (
  customMessage = "Your session has expired. Please sign in again."
) => {
  if (isHandlingExpiry) return;
  isHandlingExpiry = true;

  // 1. Clear any localStorage and sessionStorage auth artifacts
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
  } catch (err) {
    console.warn("Storage clearance warning:", err);
  }

  // 2. Dispatch custom event so Redux store resets without circular import
  try {
    window.dispatchEvent(new CustomEvent("nexora_session_expired"));
  } catch (err) {
    console.warn("Session event dispatch warning:", err);
  }

  // 3. Inspect current route
  const currentPath = window.location.pathname;
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/unauthorized",
  ];
  const isAlreadyOnAuthPage = publicRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (!isAlreadyOnAuthPage) {
    try {
      toast.error(customMessage, {
        id: "session-expired-alert",
        duration: 4000,
      });
    } catch (_) {}

    const search = window.location.search;
    const redirectParam = encodeURIComponent(currentPath + search);
    window.location.href = `/login?session_expired=true&redirect=${redirectParam}`;
  }

  // Reset lock after 3 seconds
  setTimeout(() => {
    isHandlingExpiry = false;
  }, 3000);
};
