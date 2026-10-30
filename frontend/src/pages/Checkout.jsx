
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderService";


const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);


export default function Checkout({
  cart = [],
  user,
  clearCart,
}) {

  
const navigate = useNavigate();

const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");

  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  function handleChange(event) {
    const { name, value } = event.target;

    setShipping((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


async function handleSubmit(event) {
  event.preventDefault();

  if (submitting || cart.length === 0) return;

  setSubmitting(true);
  setError("");

  try {
    const items = cart.map((item) => ({
      product: item._id,
      quantity: Number(item.quantity),
    }));

    const orderData = {
      items,
      shippingAddress: {
        ...shipping,
        fullName: shipping.fullName.trim(),
        phone: shipping.phone.trim(),
        addressLine1: shipping.addressLine1.trim(),
        addressLine2: shipping.addressLine2.trim(),
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country.trim(),
      },
      paymentMethod: "COD",
    };

    
const result = await createOrder(orderData);

// createOrder confirms that the server returned
// success: true and a saved order ID.
if (!result?.order?._id) {
  throw new Error("Order confirmation is missing.");
}

// Clear the cart only after successful order creation.
clearCart();

navigate(`/orders/${result.order._id}`, {
  replace: true,
  state: {
    orderPlaced: true,
  },
});

  } catch (err) {
    setError(err.message || "Unable to place order");
  } finally {
    setSubmitting(false);
  }
}

  if (cart.length === 0) {
    return (
      <main className="min-h-[65vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-gray-600">
            Add some products before checking out.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Shipping form */}
          <section className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Shipping Address
            </h2>

            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >
              {[
                {
                  name: "fullName",
                  label: "Full Name",
                  maxLength: 100,
                },
                {
                  name: "phone",
                  label: "Phone Number",
                  maxLength: 20,
                  inputMode: "tel",
                },
                {
                  name: "addressLine1",
                  label: "Address Line 1",
                  maxLength: 200,
                },
                {
                  name: "addressLine2",
                  label: "Address Line 2 (Optional)",
                  maxLength: 200,
                  optional: true,
                },
                {
                  name: "city",
                  label: "City",
                  maxLength: 100,
                },
                {
                  name: "state",
                  label: "State",
                  maxLength: 100,
                },
                {
                  name: "postalCode",
                  label: "PIN Code",
                  maxLength: 12,
                  inputMode: "numeric",
                },
                {
                  name: "country",
                  label: "Country",
                  maxLength: 100,
                },
              ].map((field) => (
                <label
                  key={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}

                  <input
                    type="text"
                    name={field.name}
                    value={shipping[field.name]}
                    onChange={handleChange}
                    required={!field.optional}
                    maxLength={field.maxLength}
                    inputMode={field.inputMode || "text"}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              ))}

              <div className="sm:col-span-2">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Payment Method
                </h3>

                <div className="rounded-lg border-2 border-indigo-500 bg-indigo-50 p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked
                      readOnly
                      className="accent-indigo-600"
                    />
                    <span className="font-medium text-gray-800">
                      Cash on Delivery (COD)
                    </span>
                  </label>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Online payment is not available yet.
                </p>
              </div>
            </form>
          </section>

          {/* Order summary */}
          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <span className="whitespace-nowrap font-medium text-gray-900">
                    {formatPrice(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">
                  Free
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              {error && (
                <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                  </div>
                )}

              <button
              type="submit"
              form="checkout-form"
              disabled={submitting || cart.length === 0}
               className="mt-5 w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
               >
                {submitting ? "Placing Order..." : "Place Order (COD)"}
                </button>

              <p className="text-center text-xs text-gray-500">
                Final prices will be calculated by the server.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
