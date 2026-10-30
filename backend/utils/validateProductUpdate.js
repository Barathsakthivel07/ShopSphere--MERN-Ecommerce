
const ALLOWED_FIELDS = [
  "name",
  "description",
  "price",
  "category",
  "image",
  "stock",
  "isFeatured",
];

const ALLOWED_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Accessories",
];

export function validateProductUpdate(data) {
  const errors = {};
  const updates = {};

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {
      valid: false,
      errors: {
        body: "A product update object is required.",
      },
      value: null,
    };
  }

  const fields = Object.keys(data);

  if (fields.length === 0) {
    return {
      valid: false,
      errors: {
        body: "At least one product field is required.",
      },
      value: null,
    };
  }

  // Reject unapproved fields, including MongoDB operators.
  for (const field of fields) {
    if (!ALLOWED_FIELDS.includes(field)) {
      errors[field] = "Unknown product field.";
    }
  }

  if ("name" in data) {
    if (
      typeof data.name !== "string" ||
      !data.name.trim() ||
      data.name.trim().length > 150
    ) {
      errors.name =
        "Product name must contain 1 to 150 characters.";
    } else {
      updates.name = data.name.trim();
    }
  }

  if ("description" in data) {
    if (
      typeof data.description !== "string" ||
      !data.description.trim()
    ) {
      errors.description = "Description is required.";
    } else {
      updates.description = data.description.trim();
    }
  }

  if ("price" in data) {
    if (
      typeof data.price !== "number" ||
      !Number.isFinite(data.price) ||
      data.price < 0
    ) {
      errors.price =
        "Price must be a non-negative finite number.";
    } else {
      updates.price = data.price;
    }
  }

  if ("category" in data) {
    if (!ALLOWED_CATEGORIES.includes(data.category)) {
      errors.category = "Invalid product category.";
    } else {
      updates.category = data.category;
    }
  }

  if ("image" in data) {
    if (typeof data.image !== "string") {
      errors.image = "A valid image URL is required.";
    } else {
      const image = data.image.trim();

      try {
        const url = new URL(image);

        if (
          !["http:", "https:"].includes(url.protocol) ||
          !url.hostname ||
          url.username ||
          url.password
        ) {
          errors.image =
            "A valid HTTP/HTTPS image URL is required.";
        } else {
          updates.image = image;
        }
      } catch {
        errors.image = "A valid image URL is required.";
      }
    }
  }

  if ("stock" in data) {
    if (
      typeof data.stock !== "number" ||
      !Number.isSafeInteger(data.stock) ||
      data.stock < 0
    ) {
      errors.stock =
        "Stock must be a non-negative integer.";
    } else {
      updates.stock = data.stock;
    }
  }

  if ("isFeatured" in data) {
    if (typeof data.isFeatured !== "boolean") {
      errors.isFeatured =
        "Featured status must be true or false.";
    } else {
      updates.isFeatured = data.isFeatured;
    }
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
    value: updates,
  };
}
