import axios from "axios";

const axiosInstance = axios.create({
  //baseURL: "https://mai-backend-2.onrender.com",
  // baseURL: "https://api.joinonemai.com",
  baseURL: "https://api.joinonemai.com",
  // baseURL: "",
  // baseURL:"https://api.joinonemai.com/api-docs",
  //baseURL:"https://api.joinonemai.com/api-docs/api.joinonemai.com",
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "Backend error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
