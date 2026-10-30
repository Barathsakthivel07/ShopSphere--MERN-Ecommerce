
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function createOrder(orderData) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
  } catch {
    throw new Error(
      "Cannot connect to ShopSphere. Check your connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    throw new Error(
      data?.message || `Order failed (HTTP ${response.status})`
    );
  }

  if (!data?.success || !data?.order?._id) {
    throw new Error("Invalid order confirmation from server");
  }

  return data;
}


export async function getOrderById(orderId) {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/orders/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to ShopSphere. Check your connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    if (response.status === 404) {
      throw new Error("Order not found or access denied.");
    }

    if (response.status === 400) {
      throw new Error("Invalid order ID.");
    }

    throw new Error(
      data?.message || "Unable to load order details."
    );
  }

  if (!data?.success || !data?.order) {
    throw new Error("Invalid order details received.");
  }

  return data.order;
}

export async function getMyOrders() {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  let response;

  try {
    response = await fetch(`${API_URL}/api/orders/my`, {
      method: "GET",
      credentials: "include",
    });
  } catch {
    throw new Error(
      "Unable to connect to ShopSphere. Check your connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    throw new Error(
      data?.message || "Unable to load your orders."
    );
  }

  if (!data?.success || !Array.isArray(data.orders)) {
    throw new Error("Invalid order history response.");
  }

  return data.orders;
}
