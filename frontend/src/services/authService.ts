import axios from "axios";

// -------------------
// CONFIG
// -------------------
const API_URL = "http://127.0.0.1:4000/accounts";

axios.defaults.baseURL = API_URL;

// -------------------
// TOKEN HELPERS
// -------------------
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// -------------------
// USER HELPERS
// -------------------

// Decode JWT payload:
function decodeJWT(token: string) {
  const payload = token.split(".")[1];
  const decoded = atob(payload);
  return JSON.parse(decoded);
}

export function getCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);

  return {
    id: payload.user_id,
    username: payload.username,
    email: payload.email,
  };
}

export function isAuthenticated() {
  return !!getAccessToken();
}

// -------------------
// AUTH REQUESTS
// -------------------
export async function login(credentials: {
  username: string;
  password: string;
  rememberMe: boolean;
}) {
  const payload = {
    username: credentials.username,
    password: credentials.password,
    rememberMe: credentials.rememberMe,  // IMPORTANT: Django uses rememberMe
  };

  const response = await axios.post("login/", payload);

  saveTokens(response.data.access, response.data.refresh);

  return { user: getCurrentUser() };
}

export async function register(data: {
  email: string;
  username: string;
  password: string;
  password2: string;
}) {
  await axios.post("signup/", data);

  // after signup, auto-login?
  const loginResp = await login({
    username: data.username,
    password: data.password,
    rememberMe: false,
  });

  return loginResp;
}

export async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token exists");

  const response = await axios.post("token/refresh/", { refresh });

  localStorage.setItem(ACCESS_KEY, response.data.access);

  return response.data;
}

export async function logout() {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await axios.post("logout/", { refresh });
    } catch {}
  }

  clearTokens();
}
