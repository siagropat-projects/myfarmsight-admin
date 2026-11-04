
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../stores/auth";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retriedAfterRefresh?: boolean;
  }
}

const baseURL = import.meta.env.VITE_API_URL;
const REFRESH_TIMEOUT_MS = 15000;
const LOGOUT_TIMEOUT_MS = 3000;

let refreshInFlight: Promise<string> | null = null;

const requestTokenRefresh = async (refreshToken: string, timeout = REFRESH_TIMEOUT_MS) => {
  // Plain axios, so these calls skip the interceptors below
  const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { timeout });
  return res.data.data as { token: string; refreshToken: string };
};

// Tabs share one refresh token, so only one tab may spend it at a time
const withRefreshLock = <T>(task: () => Promise<T>): Promise<T> =>
  navigator.locks ? (navigator.locks.request("auth-refresh", task) as Promise<T>) : task();

const runRefresh = async (rejectedToken?: string) => {
  await useAuth.persist.rehydrate();
  const { token, refreshToken } = useAuth.getState();

  // Another tab already refreshed, or the request was sent before this tab's last refresh
  if (rejectedToken && token && token !== rejectedToken) return token;

  if (!refreshToken) {
    useAuth.getState().clearSession("expired");
    throw new Error("No refresh token available");
  }

  try {
    const pair = await requestTokenRefresh(refreshToken);
    // The session may have ended while this was in flight; don't restore it
    if (useAuth.getState().refreshToken !== refreshToken) {
      throw new Error("Session changed during refresh");
    }
    useAuth.getState().setTokens(pair);
    return pair.token;
  } catch (error) {
    await useAuth.persist.rehydrate();
    if (axios.isAxiosError(error) && error.response?.status === 401 && useAuth.getState().refreshToken === refreshToken) {
      useAuth.getState().clearSession("expired");
    }
    throw error;
  }
};

// Swaps the refresh token for a new pair and resolves to the new access token.
// Concurrent callers share one request. Only a 401 from /auth/refresh ends the
// session; a network failure leaves it for the next attempt.
export const refreshSession = (rejectedToken?: string): Promise<string> => {
  refreshInFlight ??= withRefreshLock(() => runRefresh(rejectedToken)).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

// Revokes the session on the server. Best effort and time-limited, so a slow or
// offline server never stops the user from logging out. The access token may have
// expired, so swap it first.
export const endServerSession = async (token: string | null, refreshToken: string | null) => {
  if (!refreshToken) return;
  let accessToken = token;
  let currentRefreshToken = refreshToken;
  try {
    const pair = await requestTokenRefresh(refreshToken, LOGOUT_TIMEOUT_MS);
    accessToken = pair.token;
    currentRefreshToken = pair.refreshToken;
  } catch {
    // Already expired or offline: still try with what we have
  }
  try {
    await axios.post(
      `${baseURL}/auth/logout`,
      { refreshToken: currentRefreshToken },
      {
        timeout: LOGOUT_TIMEOUT_MS,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      },
    );
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuth.getState();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config;

    // A 401 from login means wrong credentials, not an expired session
    if (status === 401 && !config?.url?.includes("/auth/login")) {
      if (!config || config._retriedAfterRefresh) {
        useAuth.getState().clearSession("expired");
        return Promise.reject(error);
      }

      config._retriedAfterRefresh = true;
      const rejectedToken = String(config.headers?.Authorization ?? "").replace("Bearer ", "");
      try {
        await refreshSession(rejectedToken);
      } catch {
        // refreshSession ends the session itself if that's what's needed
        return Promise.reject(error);
      }
      // The request interceptor attaches the new token
      return api(config);
    }

    if (status === 403) {
      toast.error("Unauthorized", {
        description: "Please login again",
      });
      useAuth.getState().logout();
    }

    return Promise.reject(error);
  },
);

