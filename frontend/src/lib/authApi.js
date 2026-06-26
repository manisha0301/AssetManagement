import { apiRequest } from "./api";

export async function login(body) {
  return apiRequest("/api/auth/login", { method: "POST", body, credentials: "include" });
}

export async function refreshToken() {
  return apiRequest("/api/auth/refresh", { method: "POST", credentials: "include" });
}

export async function logout() {
  return apiRequest("/api/auth/logout", { method: "POST", credentials: "include" });
}
