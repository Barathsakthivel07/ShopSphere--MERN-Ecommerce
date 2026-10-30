
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function adminRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/admin${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Admin request failed (${response.status})`
    );
  }

  return data;
}

// Retrieve paginated customer orders
export function getAdminOrders(page = 1) {
  return adminRequest(`/orders?page=${encodeURIComponent(page)}`);
}

// Retrieve an individual order
export function getAdminOrderById(orderId) {
  return adminRequest(`/orders/${encodeURIComponent(orderId)}`);
}

// Update an order's status
export function updateAdminOrderStatus(orderId, orderStatus) {
  return adminRequest(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus }),
  });
}
