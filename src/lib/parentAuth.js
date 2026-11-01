const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const getParentToken = () => {
  return sessionStorage.getItem("parentToken");
};

export const saveParentSession = (token, parent) => {
  sessionStorage.setItem("parentToken", token);
  sessionStorage.setItem("parentUser", JSON.stringify(parent));
  window.dispatchEvent(new Event("parent-auth-changed"));
};

export const getParentUser = () => {
  const user = sessionStorage.getItem("parentUser");

  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const clearParentSession = () => {
  sessionStorage.removeItem("parentToken");
  sessionStorage.removeItem("parentUser");
  window.dispatchEvent(new Event("parent-auth-changed"));
};

export const parentRequest = async (path, options = {}) => {
  const token = getParentToken();

  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};
