import { formatPrice } from "../data/products";

import { Link } from "react-router-dom";


function Cart({ cart, onIncrease, onDecrease, onRemove, onClose }) {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        <button onClick={onClose} className="text-indigo-600 hover:underline">
          Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-xl">Your cart is empty 🛒</p>
          <button
            onClick={onClose}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 text-white"
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="text-5xl">{item.image}</div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-indigo-600">
                    {formatPrice(item.price)}
                  </p>

                  <button
                    onClick={() => onRemove(item._id)}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDecrease(item._id)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="rounded border px-3 py-1"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onIncrease(item._id)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="rounded border px-3 py-1"
                  >
                    +
                  </button>
                </div>

                <strong>
                  {formatPrice(item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">Order Summary</h2>
            <div className="flex justify-between border-b pb-4">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Shipping and taxes will be calculated at checkout.
            </p>
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-lg bg-gray-300 px-5 py-3 font-semibold text-gray-600"
            >
              {cart.length > 0 && (
                <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
                >
                    Proceed to Checkout
                </Link>
            )}

            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;