
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";

function ProductCard({ product, onAddToCart }) {
  
  const stock = Number.isInteger(product.stock)
    ? product.stock
    : 0;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl">

      <Link
        to={`/products/${product._id}`}
        className="block"
      >
        
<div className="flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-100 p-6 transition-colors duration-300 hover:from-indigo-100 hover:to-purple-200">
  {typeof product.image === "string" &&
  /^https?:\/\//i.test(product.image) ? (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      className="h-full w-full object-contain transition-transform duration-300 hover:scale-110"
    />
  ) : (
    <span
      role="img"
      aria-label={product.name}
      className="text-8xl transition-transform duration-300 hover:scale-110"
    >
      {product.image}
    </span>
  )}
</div>

      </Link>

      
<div className="flex flex-1 flex-col p-6">
  <div>
    <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
      {product.category}
    </span>

    <Link
      to={`/products/${product._id}`}
      className="mt-3 block min-h-14 text-lg font-semibold leading-7 text-gray-900 transition-colors hover:text-indigo-600"
    >
      {product.name}
    </Link>

    <p className="mt-3 text-2xl font-extrabold tracking-tight text-indigo-600">
      {formatPrice(product.price)}
    </p>
    
<div className="mt-3">
  {isOutOfStock ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Out of Stock
    </span>
  ) : isLowStock ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      Only {stock} left
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      In Stock
    </span>
  )}
</div>

  </div>


        
<button
  type="button"
  onClick={() => {
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  }}
  disabled={isOutOfStock}
  aria-label={
    isOutOfStock
      ? `${product.name} is out of stock`
      : `Add ${product.name} to cart`
  }
  className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:shadow-none disabled:active:scale-100"
>
  {isOutOfStock ? (
    "Unavailable"
  ) : (
    <>
      <span aria-hidden="true">🛒</span>
      Add to Cart
    </>
  )}
</button>

      </div>
    </article>
  );
}

export default ProductCard;
