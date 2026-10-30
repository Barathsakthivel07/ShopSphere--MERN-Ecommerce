


import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import AdminProductForm from "../components/AdminProductForm";


export default function AdminProducts() {
 
 const [products, setProducts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
  
 useEffect(() => {
  const controller = new AbortController();

  async function loadProducts() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`,
        {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load products. Please try again."
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.products)) {
        throw new Error(
          "The server returned an invalid product list."
        );
      }

      if (!controller.signal.aborted) {
        setProducts(data.products);
        setError("");
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load products."
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  loadProducts();

  return () => controller.abort();
}, []);
   
return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Product Management
          </h1>

          <p className="mt-2 text-gray-600">
            Manage products available in ShopSphere.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
        >
          Back to Admin Orders
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Products
        </h2>

        
{loading ? (
  <p className="mt-3 text-gray-600" role="status">
    Loading products...
  </p>
) : error ? (
  <p className="mt-3 text-red-600" role="alert">
    {error}
  </p>
) : products.length === 0 ? (
  <p className="mt-3 text-gray-600">
    No products found.
  </p>
) : (
  
<div className="mt-4">
  <p className="mb-4 text-sm text-gray-600">
    Total Products: {products.length}
  </p>

  <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-[760px] w-full border-collapse text-left text-sm">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th scope="col" className="px-4 py-3 font-semibold">
            Product Name
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Category
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Price
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Stock
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Featured
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200 bg-white">
        {products.map((product) => (
          <tr key={product._id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">
              {product.name}
            </td>

            <td className="px-4 py-3 text-gray-700">
              {product.category}
            </td>

            <td className="px-4 py-3 text-gray-700">
              {typeof product.price === "number"
                ? `₹${product.price.toLocaleString("en-IN")}`
                : "N/A"}
            </td>

            
           <td className="px-4 py-3">
            <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            product.stock === 0
            ? "bg-red-100 text-red-700"
            : product.stock <= 5
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-700"
             }`}
             >
              {product.stock === 0
               ? "Out of Stock"
              : product.stock <= 5
              ? `Low Stock (${product.stock})`
              : `In Stock (${product.stock})`}
            </span>
            </td>


            <td className="px-4 py-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    product.isFeatured
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {product.isFeatured ? "Featured" : "Not Featured"}
              </span>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

)}

      </section>
      
<section className="mt-8">
  <AdminProductForm />
</section>

    </main>
   );
}
