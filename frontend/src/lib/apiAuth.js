import { apiRequest, setAuthToken, clearAuthToken } from "./api";
import { refreshToken as refreshTokenRequest } from "./authApi";

let isRefreshing = false;
let refreshQueue = [];

function enqueueRefreshRequest(resolve, reject) {
  refreshQueue.push({ resolve, reject });
}

function resolveRefreshQueue(token) {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue = [];
}

function rejectRefreshQueue(error) {
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

export async function requestWithAuth(path, options = {}) {
  const { signal, method = "GET", body, credentials = "include" } = options;

  try {
    return await apiRequest(path, { method, body, signal, credentials });
  } catch (error) {
    if (error.message.includes("401")) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await refreshTokenRequest();
          const newToken = refreshResponse?.data?.accessToken;
          setAuthToken(newToken);
          resolveRefreshQueue(newToken);
          isRefreshing = false;
          return await apiRequest(path, { method, body, signal, credentials });
        } catch (refreshError) {
          rejectRefreshQueue(refreshError);
          isRefreshing = false;
          throw refreshError;
        }
      }

      return new Promise((resolve, reject) => {
        enqueueRefreshRequest(resolve, reject);
      }).then(async () => {
        return await apiRequest(path, { method, body, signal, credentials });
      });
    }

    throw error;
  }
}

export { setAuthToken, clearAuthToken };
