
import { useEffect, useState } from "react";
import { getAdminOrders } from "../services/adminOrderService";

import { Link } from "react-router-dom";


function getOrderStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";

    case "confirmed":
      return "bg-blue-100 text-blue-800";

    case "shipped":
      return "bg-purple-100 text-purple-800";

    case "delivered":
      return "bg-green-100 text-green-800";

    case "cancelled":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPaymentStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";

    case "paid":
      return "bg-green-100 text-green-800";

    case "failed":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminOrders() {
    
const [ordersResponse, setOrdersResponse] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


const [page, setPage] = useState(1);

const totalPages = ordersResponse?.totalPages ?? 0;
const totalOrders = ordersResponse?.totalOrders ?? 0;
const pageSize = ordersResponse?.limit ?? 10;
const currentPage = ordersResponse?.page ?? page;

const displayedCount = ordersResponse?.orders?.length ?? 0;

const firstOrderNumber =
  displayedCount > 0
    ? (currentPage - 1) * pageSize + 1
    : 0;

const lastOrderNumber =
  displayedCount > 0
    ? firstOrderNumber + displayedCount - 1
    : 0;


useEffect(() => {
  let active = true;

  async function loadOrders() {
  if (active) {
    setLoading(true);
  }

  try {
      const data = await getAdminOrders(page);

      if (active) {
        setOrdersResponse(data);
        setError("");
      }
    } catch (err) {
      if (active) {
        setError(err.message);
        setOrdersResponse(null);
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
}, [page]);


  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Order Management
        </h1>

        <p className="mt-2 text-gray-600">
          View and manage customer orders securely.
        </p>
      </div>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Customer Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Orders will appear here after connecting the admin API.
          </p>
        </div>

        

<div className="overflow-x-auto rounded-lg border border-gray-200">
  {loading ? (
    <p role="status" className="p-8 text-center text-gray-600">
      Loading customer orders...
    </p>
  ) : error ? (
    <p role="alert" className="p-8 text-center text-red-600">
      Unable to load orders: {error}
    </p>
  ) : !Array.isArray(ordersResponse?.orders) ? (
    <p role="alert" className="p-8 text-center text-red-600">
      Unexpected orders response. Please check the API.
    </p>
  ) : ordersResponse.orders.length === 0 ? (
    <p className="p-8 text-center text-gray-600">
      No customer orders found.
    </p>
  ) : (
    <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
            Order ID
          </th>
          
<th
  scope="col"
  className="whitespace-nowrap px-5 py-4 font-semibold"
>
  Customer
</th>

          <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
            Total Amount
          </th>
          <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
            Order Status
          </th>
          <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
            Payment Status
          </th>
          <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
            Order Date
          </th>
          
<th
  scope="col"
  className="whitespace-nowrap px-5 py-4 font-semibold"
>
  Actions
</th>

        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100 bg-white">
        {ordersResponse.orders.map((order) => (
          <tr key={order._id} className="hover:bg-gray-50">
            <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">
              {order._id}
            </td>
            
<td className="whitespace-nowrap px-5 py-4">
  <Link
    to={`/admin/orders/${order._id}`}
    className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    View Details
  </Link>
</td>

<td className="px-5 py-4">
  {order.user &&
  typeof order.user === "object" &&
  !Array.isArray(order.user) ? (
    <div className="min-w-40">
      <p className="font-medium text-gray-900">
        {order.user.name || "Unknown customer"}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {order.user.email || "Email unavailable"}
      </p>
    </div>
  ) : (
    <span className="text-sm text-gray-500">
      Customer details unavailable
    </span>
  )}
</td>

            <td className="whitespace-nowrap px-5 py-4 font-medium">
              {typeof order.totalAmount === "number"
                ? `₹${order.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "N/A"}
            </td>

            
<td className="whitespace-nowrap px-5 py-4">
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getOrderStatusColor(
      order.orderStatus
    )}`}
  >
    {order.orderStatus ?? "Unknown"}
  </span>
</td>


            
<td className="whitespace-nowrap px-5 py-4">
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentStatusColor(
      order.paymentStatus
    )}`}
  >
    {order.paymentStatus ?? "Unknown"}
  </span>
</td>


            <td className="whitespace-nowrap px-5 py-4">
              {order.createdAt &&
              !Number.isNaN(new Date(order.createdAt).getTime())
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

<div className="mt-6 flex flex-wrap items-center justify-between gap-4">
  
<div className="text-sm text-gray-600">
  <p className="font-semibold text-gray-800">
    Page {currentPage} of {totalPages}
  </p>

  <p className="mt-1">
    {loading
      ? "Loading orders..."
      : error
        ? "Unable to load pagination information"
        : displayedCount === 0
          ? `No orders to display (${totalOrders} total)`
          : `Showing ${firstOrderNumber}–${lastOrderNumber} of ${totalOrders} orders`}
  </p>
</div>


  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => setPage((previous) => Math.max(1, previous - 1))}
      disabled={
  loading ||
  Boolean(error) ||
  !ordersResponse ||
  page <= 1
}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Previous
    </button>

    <button
      type="button"
      onClick={() => setPage((previous) => previous + 1)}
      
disabled={
  loading ||
  Boolean(error) ||
  !ordersResponse ||
  page >= totalPages
}

      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>


      </section>
    </main>
  );
}
