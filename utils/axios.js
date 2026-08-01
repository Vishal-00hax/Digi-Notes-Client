import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Holds the active refresh promise so concurrent requests can share it
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Sirf 401 pe try karo, aur infinite loop na bane (_retry flag se)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Agar refresh pehle se nahi chal raha, toh naya start karo
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null; // Request complete hone par reset karo
          });
        }

        // ✅ Baaki sabhi concurrent requests is same promise ka wait karengi
        await refreshPromise;

        // ✅ New cookie automatically attach ho jayegi, original request dobara try karo
        return api(originalRequest);
      } catch (refreshError) {
        // ✅ Refresh fail hua matlab session expired, login page par bhejo
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
