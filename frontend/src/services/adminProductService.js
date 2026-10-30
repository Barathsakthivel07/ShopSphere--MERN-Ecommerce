
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function createAdminProduct(productData, signal) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/products`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
      signal,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || "Unable to create product."
    );

    error.status = response.status;
    error.errors = data?.errors || null;

    throw error;
  }

  if (
    response.status !== 201 ||
    data?.success !== true ||
    !data?.product?._id
  ) {
    throw new Error(
      "Unexpected product creation response. Check the product list before retrying."
    );
  }

  return data.product;
}
