
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const savedOrders = await getMyOrders();

        if (active) {
          setOrders(savedOrders);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load your orders.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <p
          role="status"
          className="text-center text-gray-600"
        >
          Loading your orders...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Unable to Load Orders
          </h1>

          <p role="alert" className="mt-4 text-red-600">
            {error}
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-gray-600">
            View your purchases and track their status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mb-4 text-5xl">📦</div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mt-3 text-gray-600">
              You haven't placed any orders yet.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Showing {orders.length} recent{" "}
              {orders.length === 1 ? "order" : "orders"}
            </p>

            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all font-semibold text-gray-900">
                      {order._id}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Ordered on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium capitalize text-indigo-700">
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 border-y border-gray-100 py-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Method
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : order.paymentMethod || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Status
                    </p>

                    <p className="mt-1 font-semibold capitalize text-gray-900">
                      {order.paymentStatus || "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    {Array.isArray(order.items)
                      ? order.items.reduce(
                          (total, item) =>
                            total + Number(item.quantity || 0),
                          0
                        )
                      : 0}{" "}
                    total items
                  </p>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    View Details
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
