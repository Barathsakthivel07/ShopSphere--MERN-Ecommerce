
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../services/orderService";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));

export default function OrderConfirmation() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const savedOrder = await getOrderById(id);

        if (active) {
          setOrder(savedOrder);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load order.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16 text-center">
        <p className="text-gray-600">
          Loading your order details...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Unable to Display Order
          </h1>

          <p role="alert" className="mt-4 text-red-600">
            {error || "Order details are unavailable."}
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

  const address = order.shippingAddress || {};

  return (
    <main className="min-h-[75vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Order Details
          </h1>

          <p className="mt-2 text-gray-600">
            Your order information has been retrieved securely.
          </p>

          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Order ID</p>

            <p className="mt-1 break-all font-medium text-gray-900">
              {order._id}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Order Status
              </p>
              <p className="font-semibold capitalize">
                {order.orderStatus}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment Status
              </p>
              <p className="font-semibold capitalize">
                {order.paymentStatus}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment Method
              </p>
              <p className="font-semibold">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Ordered On
              </p>
              <p className="font-semibold">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN")
                  : "Not available"}
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            Purchased Products
          </h2>

          <div className="space-y-4">
            {(order.items || []).map((item, index) => (
              <div
                key={item._id || index}
                className="flex justify-between gap-4 border-b border-gray-100 pb-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>

                  <p className="text-sm text-gray-500">
                    Unit price: {formatPrice(item.price)}
                  </p>
                </div>

                <p className="whitespace-nowrap font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">
            Shipping Address
          </h2>

          <div className="space-y-1 text-gray-700">
            <p className="font-semibold">{address.fullName}</p>
            <p>{address.phone}</p>
            <p>{address.addressLine1}</p>

            {address.addressLine2 && (
              <p>{address.addressLine2}</p>
            )}

            <p>
              {address.city}, {address.state} -{" "}
              {address.postalCode}
            </p>

            <p>{address.country}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            Payment Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>

            <div className="flex justify-between border-t pt-4 text-xl font-bold">
              <span>Total Amount</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
