
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProductById } from "../services/productService";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function ProductDetails({ onAddToCart }) {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const data = await fetchProductById(id, controller.signal);

        if (!controller.signal.aborted) {
          setProduct(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <p className="p-12 text-center">Loading product...</p>;
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p role="alert" className="text-red-600">{error}</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/" className="text-indigo-600 hover:underline">
        ← Back to Products
      </Link>

      <div className="mt-8 grid gap-10 rounded-2xl bg-white p-8 shadow-sm md:grid-cols-2">
        <div className="flex min-h-80 items-center justify-center rounded-xl bg-indigo-50 text-9xl">
          {product.image}
        </div>

        <div>
          <p className="text-sm font-medium text-indigo-600">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            {product.name}
          </h1>

          <p className="mt-5 text-3xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 leading-7 text-gray-600">
            {product.description}
          </p>

          <p className="mt-5 font-medium">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>

          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => onAddToCart(product)}
            className="mt-8 w-full rounded-lg bg-indigo-600 px-6 py-4 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
