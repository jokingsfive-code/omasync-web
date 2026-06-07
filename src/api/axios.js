import axios from "axios";

const api = axios.create({
  baseURL: "https://web-production-2db875.up.railway.app/api",
});

export default api;