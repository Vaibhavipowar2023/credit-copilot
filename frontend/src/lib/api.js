// In production (single service), frontend and backend share the same origin.
// In development, Vite proxies /api to localhost:8000.
const API = "/api";

export function getToken() {
  return localStorage.getItem("access_token");
}
export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}
export function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}
export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${API}${url}`, { ...options, headers });

  // auto-refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    const refreshRes = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.access_token, data.refresh_token);
      headers["Authorization"] = `Bearer ${data.access_token}`;
      res = await fetch(`${API}${url}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = "/login";
      return res;
    }
  }
  return res;
}

// ---- Auth ----
export async function register(email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.ok) {
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
  }
  return res;
}

export function logout() {
  clearTokens();
}

// ---- Borrowers ----
export const getBorrowers = () => authFetch("/borrowers");
export const createBorrower = (data) => authFetch("/borrowers", { method: "POST", body: JSON.stringify(data) });

// ---- Loans ----
export const getLoans = () => authFetch("/loans");
export const createLoan = (data) => authFetch("/loans", { method: "POST", body: JSON.stringify(data) });

// ---- Covenants ----
export const getCovenants = () => authFetch("/covenants");
export const createCovenant = (data) => authFetch("/covenants", { method: "POST", body: JSON.stringify(data) });

// ---- Documents ----
export const getDocuments = () => authFetch("/documents/");
export async function uploadDocument(loanId, file) {
  console.log("[api] uploadDocument called", { loanId, fileName: file?.name, fileSize: file?.size });
  const form = new FormData();
  form.append("file", file);
  const res = await authFetch(`/documents/upload?loan_agreement_id=${loanId}`, { method: "POST", body: form });
  console.log("[api] uploadDocument response", res.status, res.statusText);
  return res;
}
export const askDocument = (q) => authFetch(`/documents/ask?q=${encodeURIComponent(q)}`);
export const searchDocument = (q) => authFetch(`/documents/search?q=${encodeURIComponent(q)}`);
export const extractCovenants = (docId) => authFetch(`/documents/${docId}/extract_covenants`, { method: "POST" });

// ---- Risk ----
export const checkRisk = (data) => authFetch("/risk/check", { method: "POST", body: JSON.stringify(data) });
