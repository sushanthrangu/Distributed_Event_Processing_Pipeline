import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/producer";
const CONSUMER_BASE = import.meta.env.VITE_CONSUMER_BASE_URL || "/consumer";


export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const consumerClient = axios.create({
  baseURL: CONSUMER_BASE,
  timeout: 10000,
});

export default apiClient;
