
const ALLOWED_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Accessories",
];

const ALLOWED_FIELDS = [
  "name",
  "description",
  "price",
  "category",
  "image",
  "stock",
  "isFeatured",
];

export function validateProductInput(data) {
  const errors = {};

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {
      valid: false,
      errors: { body: "A product object is required." },
      value: null,
    };
  }

  for (const field of Object.keys(data)) {
    if (!ALLOWED_FIELDS.includes(field)) {
      errors[field] = "Unknown product field.";
    }
  }

  const name =
    typeof data.name === "string"
      ? data.name.trim()
      : "";

  if (!name || name.length > 150) {
    errors.name =
      "Product name must contain 1 to 150 characters.";
  }

  const description =
    typeof data.description === "string"
      ? data.description.trim()
      : "";

  if (!description) {
    errors.description = "Description is required.";
  }

  if (
    typeof data.price !== "number" ||
    !Number.isFinite(data.price) ||
    data.price < 0
  ) {
    errors.price =
      "Price must be a non-negative finite number.";
  }

  if (!ALLOWED_CATEGORIES.includes(data.category)) {
    errors.category = "Invalid product category.";
  }

  let image = "";

  if (typeof data.image !== "string") {
    errors.image = "A valid image URL is required.";
  } else {
    image = data.image.trim();

    try {
      const url = new URL(image);

      if (
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname
      ) {
        errors.image = "Only HTTP/HTTPS image URLs are allowed.";
      }

      if (url.username || url.password) {
        errors.image =
          "Image URLs must not contain credentials.";
      }
    } catch {
      errors.image = "A valid image URL is required.";
    }
  }

  const stock = data.stock ?? 0;

  if (
    typeof stock !== "number" ||
    !Number.isSafeInteger(stock) ||
    stock < 0
  ) {
    errors.stock =
      "Stock must be a non-negative integer.";
  }

  const isFeatured = data.isFeatured ?? false;

  if (typeof isFeatured !== "boolean") {
    errors.isFeatured = "Featured status must be true or false.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors,
      value: null,
    };
  }

  return {
    valid: true,
    errors: {},
    value: {
      name,
      description,
      price: data.price,
      category: data.category,
      image,
      stock,
      isFeatured,
    },
  };
}
