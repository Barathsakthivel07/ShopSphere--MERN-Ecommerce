
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/api/auth${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || `Request failed: HTTP ${response.status}`
    );
  }

  return data;
}

// Register a new customer
export async function registerUser({ name, email, password }) {
  return authRequest("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// Log in and receive the HttpOnly session cookie
export async function loginUser({ email, password }) {
  return authRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Fetch the signed-in customer's profile
export async function getCurrentUser() {
  return authRequest("/me", {
    method: "GET",
  });
}

// Log out and clear the session cookie
export async function logoutUser() {
  return authRequest("/logout", {
    method: "POST",
  });
}
