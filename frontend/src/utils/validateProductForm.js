
const allowedCategories = [
  "Electronics",
  "Fashion",
  "Accessories",
];

export default function validateProductForm(form) {
  const errors = {};

  // Product name
  if (typeof form.name !== "string" || !form.name.trim()) {
    errors.name = "Product name is required.";
  } else if (form.name.trim().length > 150) {
    errors.name = "Product name must be 150 characters or fewer.";
  }

  // Product description
  if (
    typeof form.description !== "string" ||
    !form.description.trim()
  ) {
    errors.description = "Product description is required.";
  }

  // Price
  const priceText = String(form.price ?? "").trim();
  const price = Number(priceText);

  if (priceText === "") {
    errors.price = "Price is required.";
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid price of 0 or greater.";
  }

  // Category
  if (!allowedCategories.includes(form.category)) {
    errors.category = "Select a valid category.";
  }

  // Image URL
  if (typeof form.image !== "string" || !form.image.trim()) {
    errors.image = "Product image URL is required.";
  } else {
    try {
      const url = new URL(form.image.trim());

      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      ) {
        errors.image =
          "Enter a valid HTTP or HTTPS image URL without credentials.";
      }
    } catch {
      errors.image = "Enter a valid image URL.";
    }
  }

  // Stock
  const stockText = String(form.stock ?? "").trim();
  const stock = Number(stockText);

  if (stockText === "") {
    errors.stock = "Stock quantity is required.";
  } else if (
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    errors.stock = "Stock must be a non-negative whole number.";
  }

  // Featured product
  if (typeof form.isFeatured !== "boolean") {
    errors.isFeatured = "Featured status must be true or false.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
