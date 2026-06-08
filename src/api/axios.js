import axios from "axios";

const api = axios.create({
  baseURL: "https://omasync-backend-production.up.railway.app/api",
});

export default api;