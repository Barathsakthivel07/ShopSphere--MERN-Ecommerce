
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchProducts(signal) {
  const response = await fetch(`${API_URL}/api/products`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !Array.isArray(data.products)) {
    throw new Error("Unexpected product API response");
  }

  return data.products;
}

export async function fetchProductById(id, signal) {
  const response = await fetch(
    `${API_URL}/api/products/${encodeURIComponent(id)}`,
    { signal }
  );

  if (response.status === 404) {
    throw new Error("Product not found");
  }

  if (!response.ok) {
    throw new Error(`Unable to load product: HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.product) {
    throw new Error("Invalid product response");
  }

  return data.product;
}
