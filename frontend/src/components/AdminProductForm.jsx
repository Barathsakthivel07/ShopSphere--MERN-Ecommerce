
import { useRef, useState } from "react";
import { createAdminProduct } from "../services/adminProductService";

import validateProductForm from "../utils/validateProductForm";

import buildProductPayload from "../utils/buildProductPayload";


const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: "",
  isFeatured: false,
};

export default function AdminProductForm() {
  const [form, setForm] = useState({ ...initialForm });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [apiError, setApiError] = useState("");
  const [recoveryRequired, setRecoveryRequired] = useState(false);

  
function handleChange(event) {
  const { name, value, type, checked } = event.target;

  setForm((previous) => ({
    ...previous,
    [name]: type === "checkbox" ? checked : value,
  }));

  setErrors((previous) => ({
    ...previous,
    [name]: undefined,
  }));

  setSuccessMessage("");
}

async function handleSubmit(event) {
  event.preventDefault();

  // Prevent repeated clicks before React updates the button.
  if (submittingRef.current || recoveryRequired) {
  return;
}

  const result = validateProductForm(form);

  setErrors(result.errors);
  setSuccessMessage("");
  setApiError("");

  if (!result.valid) {
    return;
  }

  const payload = buildProductPayload(form);

  // Lock before starting the network request.
  submittingRef.current = true;
  setIsSubmitting(true);

  try {
    const createdProduct = await createAdminProduct(payload);

    setSuccessMessage(
      `Product "${createdProduct.name}" created successfully.`
    );

    setForm({ ...initialForm });
    setErrors({});

    // The product list will be refreshed in the next stage.
  
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to confirm product creation.";

  setRecoveryRequired(true);

  setApiError(
    `${message} Product creation is locked until the catalog is verified. Do not resubmit.`
  );
}
 finally {
    submittingRef.current = false;
    setIsSubmitting(false);
  }
}


  
return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Create New Product
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter the product information below.
        </p>
      </div>

      <div>
        <label htmlFor="product-name" className="mb-1 block text-sm font-medium">
          Product Name
        </label>
        <input
          id="product-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          maxLength={150}
          className="w-full rounded-lg border border-gray-300 p-3"
          placeholder="Enter product name"
        />
        {errors.name && (
            <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.name}
            </p>
)}

      </div>

      <div>
        <label htmlFor="product-description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-gray-300 p-3"
          placeholder="Enter product description"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="product-price" className="mb-1 block text-sm font-medium">
            Price (₹)
          </label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Enter price"
          />
        </div>

        <div>
          <label htmlFor="product-stock" className="mb-1 block text-sm font-medium">
            Stock Quantity
          </label>
          <input
            id="product-stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Enter stock"
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-category" className="mb-1 block text-sm font-medium">
          Category
        </label>
        <select
          id="product-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-3"
        >
          <option value="">Select Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <div>
        <label htmlFor="product-image" className="mb-1 block text-sm font-medium">
          Product Image URL
        </label>
        <input
          id="product-image"
          name="image"
          type="url"
          value={form.image}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-3"
          placeholder="https://example.com/product.jpg"
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
        <input
          name="isFeatured"
          type="checkbox"
          checked={form.isFeatured}
          onChange={handleChange}
          className="h-4 w-4"
        />
        Featured Product
      </label>

      <div className="flex flex-wrap gap-3">
        
        <button
         type="submit"
         disabled={isSubmitting || recoveryRequired}
         className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
         >
            {isSubmitting ? "Creating Product..." : "Create Product"}
        </button>


        <button
          type="button"
          disabled={isSubmitting}
         onClick={() => {
            setForm({ ...initialForm });
            setErrors({});
            setSuccessMessage("");
            setApiError("");
}}

          className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-gray-500">
         Creating a product saves it to the ShopSphere database.
          Review all details before submitting.
       </p>
      {successMessage && (
     <p
       className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
       role="status"
      >
        
{apiError && (
  <p
    role="alert"
    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
  >
    {apiError}
  </p>
)}

      {successMessage}
     </p>
)}
    </form>
);
}
