
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../services/adminOrderService";


const allowedOrderTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function getAllowedNextStatuses(currentStatus) {
  return allowedOrderTransitions[currentStatus] ?? [];
}

const orderStatusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

function getPaymentStatusStyle(status) {
  return (
    paymentStatusStyles[status] ??
    "bg-gray-100 text-gray-800"
  );
}

function getOrderStatusStyle(status) {
  return (
    orderStatusStyles[status] ??
    "bg-gray-100 text-gray-800"
  );
}



export default function AdminOrderDetails() { 
  console.log("ShopSphere AdminOrderDetails component mounted");
  const { id } = useParams();

const activeOrderIdRef = useRef(id);

useEffect(() => {
  activeOrderIdRef.current = id;
}, [id]);




  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
console.log("ShopSphere Order Debug:", {
  orderId: id,
  loading,
  error,
  orderExists: Boolean(order),
  loadedOrderId: order?._id,
});


const nextStatuses = getAllowedNextStatuses(order?.orderStatus);

const [selectedStatus, setSelectedStatus] = useState("");

const [showConfirmation, setShowConfirmation] = useState(false);

const [reviewedOrderId, setReviewedOrderId] = useState(null);

const [reviewedOrderStatus, setReviewedOrderStatus] = useState(null);


const [statusUpdating, setStatusUpdating] = useState(false);


const [recoveryRequired, setRecoveryRequired] = useState(false);

const [recoveryLoading, setRecoveryLoading] = useState(false);

const statusUpdateLockRef = useRef(false);

const [statusUpdateError, setStatusUpdateError] = useState("");
const [statusUpdateSuccess, setStatusUpdateSuccess] = useState("");






  useEffect(() => {
    let active = true;
    



    async function loadOrder() {
      try {
        const data = await getAdminOrderById(id);

        if (active) {
          setOrder(data.order);
          setError("");
        }
      } catch (err) {
        if (active) {
          setOrder(null);
          setError(err.message);
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
  
async function fetchLatestOrderForRecovery(orderId) {
  
  const response = await getAdminOrderById(orderId);

  if (!response?.order) {
    throw new Error(
      "Unable to retrieve the latest order information."
    );
  }

  if (response.order._id !== orderId) {
    throw new Error(
      "The server returned a different order."
    );
  }

  return response.order;
}

async function handleManualOrderRecovery() {
  if (
    !recoveryRequired ||
    recoveryLoading ||
    statusUpdating ||
    statusUpdateLockRef.current
  ) {
    return;
  }

  const orderIdToRecover = id;

  setRecoveryLoading(true);

  // Never reuse a previous confirmation.
  setShowConfirmation(false);
  setSelectedStatus("");
  setReviewedOrderId(null);
  setReviewedOrderStatus(null);
  setStatusUpdateSuccess("");
  setStatusUpdateError("");

  try {
    const latestOrder = await fetchLatestOrderForRecovery(
      orderIdToRecover
    );

    if (activeOrderIdRef.current !== orderIdToRecover) {
      return;
    }

    setOrder(latestOrder);
    setRecoveryRequired(false);
    setStatusUpdateError("");
  } catch (err) {
    if (activeOrderIdRef.current === orderIdToRecover) {
      setRecoveryRequired(true);
      setStatusUpdateError(
        err instanceof Error
          ? `Order refresh failed: ${err.message}`
          : "Order refresh failed. Please try again."
      );
    }
  } finally {
    if (activeOrderIdRef.current === orderIdToRecover) {
      setRecoveryLoading(false);
    }
  }
}

void fetchLatestOrderForRecovery;

  
function validateStatusUpdate() {
  
 if (recoveryRequired) {
   return false;
  }
  
if (
  !order ||
  reviewedOrderStatus === null ||
  reviewedOrderStatus !== order.orderStatus
) {
  return false;
}


  if (statusUpdating) {
    return false;
  }

  if (!order || order._id !== id) {
    return false;
  }

  if (!showConfirmation || reviewedOrderId !== id) {
    return false;
  }

  if (!nextStatuses.includes(selectedStatus)) {
    return false;
  }

  return true;
}

async function handleConfirmStatusUpdate() {
    if (!validateStatusUpdate()) {
    setStatusUpdateError(
      "Invalid order status update. Please review your selection."
    );
   
    return;
  }

  const orderIdToUpdate = id;
  const nextStatusToApply = selectedStatus;
  
 const isCurrentOrder = () =>
  activeOrderIdRef.current === orderIdToUpdate;


  setStatusUpdating(true);
  setStatusUpdateError("");
  setStatusUpdateSuccess("");

try {
    const response = await updateAdminOrderStatus(
      orderIdToUpdate,
      nextStatusToApply
    );

    // Only update the displayed order after a successful response.
    // The existing service must throw for unsuccessful HTTP responses.
    if (!response?.order) {
      throw new Error(
        "The server did not return the updated order."
      );
    }

    
 if (!isCurrentOrder()) {
return;
}

if (
  response.order._id !== orderIdToUpdate ||
  response.order.orderStatus !== nextStatusToApply
) {
  throw new Error(
    "The server returned an unexpected order or status."
  );
}

 setOrder(response.order);
 setStatusUpdateSuccess(
  "Order status updated successfully."
);

 setShowConfirmation(false);
 setSelectedStatus("");
 setReviewedOrderId(null);
 

} catch (err) {
  if (!isCurrentOrder()) {
    return;
  }
 setRecoveryRequired(true);
  // Clear the previous confirmation.
  setShowConfirmation(false);
  setSelectedStatus("");
  setReviewedOrderId(null);
  setStatusUpdateSuccess("");

  const originalError =
    err instanceof Error
      ? err.message
      : "The order status update could not be confirmed.";

  try {
    const latestOrder = await fetchLatestOrderForRecovery(
      orderIdToUpdate
    );

    if (!isCurrentOrder()) {
      return;
    }

    setOrder(latestOrder);
    setRecoveryRequired(false);

    setStatusUpdateError(
      `${originalError} Latest order information has been refreshed. ` +
      "Review its current status before trying again."
    );
  } catch {
    if (isCurrentOrder()) 
      setRecoveryRequired(true);{
      setStatusUpdateError(
        `${originalError} Could not refresh the latest order information. ` +
        "Please reload the page and verify the order status before trying again."
      );
    }
  }
}


finally {
  statusUpdateLockRef.current = false;

  if (isCurrentOrder()) {
    setStatusUpdating(false);
  }
}
}

return (
  <main className="mx-auto max-w-7xl px-6 py-12">
      
      <Link
        to="/admin/orders"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        &larr; Back to Admin Orders
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Admin Order Details
      </h1>

      <p className="mt-2 text-gray-600">
        View customer order information securely.
      </p>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        {loading ? (
          <p role="status" className="text-gray-600">
            Loading order details...
          </p>
        ) : error ? (
          <p role="alert" className="text-red-600">
            Unable to load order: {error}
          </p>
        ) : !order ? (
          <p className="text-gray-600">
            Order details are unavailable.
          </p>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order Information
            </h2>

            <div className="mt-4 rounded-lg border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-500">
                Order ID
              </p>

              <p className="mt-2 break-all font-mono text-sm text-gray-900">
                {order._id}
              </p>
            </div>

            <p className="mt-4 font-medium text-green-700">
              Admin Order Details API connected successfully.
            </p>
            
<section className="mt-6 rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Customer Information
  </h3>

<section className="mt-6 rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Shipping Address
  </h3>

  {order.shippingAddress ? (
    <div className="mt-4 grid gap-5 sm:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Full Name
        </p>
        <p className="mt-1 text-gray-900">
          {order.shippingAddress.fullName || "Not provided"}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">
          Phone Number
        </p>
        <p className="mt-1 text-gray-900">
          {order.shippingAddress.phone || "Not provided"}
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="text-sm font-medium text-gray-500">
          Street Address
        </p>
        <p className="mt-1 break-words text-gray-900">
          {order.shippingAddress.address || "Not provided"}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">
          City
        </p>
        <p className="mt-1 text-gray-900">
          {order.shippingAddress.city || "Not provided"}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">
          State
        </p>
        <p className="mt-1 text-gray-900">
          {order.shippingAddress.state || "Not provided"}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">
          Postal Code
        </p>
        <p className="mt-1 text-gray-900">
          {order.shippingAddress.postalCode || "Not provided"}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">
          Country
        </p>
        <p className="mt-1 text-gray-900">
          {order.shippingAddress.country || "Not provided"}
        </p>
      </div>
    </div>
  ) : (
    <p className="mt-4 text-sm text-gray-500">
      Shipping address is unavailable.
    </p>
  )}

<section className="mt-6 rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Purchased Products
  </h3>

  {!Array.isArray(order.items) || order.items.length === 0 ? (
    <p className="mt-4 text-sm text-gray-500">
      No purchased products found.
    </p>
  ) : (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Product Name
            </th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Unit Price
            </th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Quantity
            </th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Subtotal
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {order.items.map((item, index) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            const validPrice = Number.isFinite(price) && price >= 0;
            const validQuantity =
              Number.isInteger(quantity) && quantity > 0;

            const formatPrice = (amount) =>
              `₹${amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;

  return (
              <tr key={`${item.product ?? item.name ?? "item"}-${index}`}>
                <td className="px-5 py-4 font-medium text-gray-900">
                  {item.name || "Unnamed product"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                  {validPrice ? formatPrice(price) : "N/A"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                  {validQuantity ? quantity : "N/A"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                  {validPrice && validQuantity
                    ? formatPrice(price * quantity)
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</section>

{/* Order Summary & Payment Information */}
<section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900">
    Order Summary &amp; Payment Information
  </h2>

  <div className="mt-5 border-t border-gray-200 pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-medium text-gray-600">
        Total Amount
      </span>

      <span className="text-xl font-bold text-indigo-700">
        {Number(order.totalAmount).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        })}
      </span>
    </div>
  </div>
  
{/* Order Status */}
<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
  <span className="text-sm font-medium text-gray-600">
    Order Status
  </span>

  <span
    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${getOrderStatusStyle(
      order.orderStatus
    )}`}
  >
    {order.orderStatus || "Unknown"}
  </span>
</div>

{/* Payment Method */}
<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
  <span className="text-sm font-medium text-gray-600">
    Payment Method
  </span>

  <span className="text-sm font-semibold text-gray-900">
    {order.paymentMethod === "COD"
      ? "Cash on Delivery"
      : order.paymentMethod || "Not available"}
  </span>
</div>

{/* Payment Status */}
<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
  <span className="text-sm font-medium text-gray-600">
    Payment Status
  </span>

  <span
    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${getPaymentStatusStyle(
      order.paymentStatus
    )}`}
  >
    {order.paymentStatus || "Unknown"}
  </span>
</div>

</section>

{/* Manage Order Status */}
<section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900">
    Manage Order Status
  </h2>
  
{statusUpdateError && (
  <p
    role="alert"
    className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
  >
    {statusUpdateError}
  </p>
)}

{recoveryRequired && (
  <div className="mt-3">
    <button
      type="button"
      onClick={handleManualOrderRecovery}
      disabled={
        recoveryLoading ||
        statusUpdating
      }
      className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {recoveryLoading
        ? "Refreshing Order..."
        : "Refresh Order"}
    </button>

    <p className="mt-2 text-sm text-gray-600">
      The latest order status must be verified before
      another update can be reviewed.
    </p>
  </div>
)}


{statusUpdateSuccess && (
  <p
    role="status"
    className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
  >
    {statusUpdateSuccess}
  </p>
)}


  {nextStatuses.length === 0 ? (
    <p className="mt-3 text-sm text-gray-600">
      This order has reached a final status.
      No further changes are allowed.
    </p>
  ) : (
   
<div className="mt-4">
  <label
    htmlFor="nextOrderStatus"
    className="block text-sm font-medium text-gray-700"
  >
    Select Next Order Status
  </label>

  <select
    id="nextOrderStatus"
     disabled={showConfirmation || statusUpdating || recoveryRequired}
     value={
      nextStatuses.includes(selectedStatus)
        ? selectedStatus
        : ""
    }
    onChange={(event) => setSelectedStatus(event.target.value)}
    className="mt-2 w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
  >
    <option value="">Choose a status</option>

    {nextStatuses.map((status) => (
      <option key={status} value={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </option>
    ))}
  </select>

  <p className="mt-3 text-sm text-gray-500">
    Selecting a status does not update the order.
  </p>
  
<button
  type="button"
  disabled={!nextStatuses.includes(selectedStatus)}
  
onClick={() => {
  setReviewedOrderId(order._id);
  setReviewedOrderStatus(order.orderStatus);
  setShowConfirmation(true);
}}

  className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  Review Status Change
</button>


{showConfirmation &&
  reviewedOrderId === id &&
  order?._id === id &&
  nextStatuses.includes(selectedStatus) && (

  <div
    role="group"
    aria-label="Confirm order status change"
    className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-5"
  >
    <h3 className="text-lg font-semibold text-gray-900">
      Confirm Order Status Change
    </h3>

    <p className="mt-3 text-sm text-gray-700">
      Current Status:{" "}
      <span className="font-semibold capitalize">
        {order.orderStatus}
      </span>
    </p>

    <p className="mt-2 text-sm text-gray-700">
      New Status:{" "}
      <span className="font-semibold capitalize">
        {selectedStatus}
      </span>
    </p>

    <p className="mt-3 text-sm text-amber-900">
      Please review this status change carefully.
    </p>

    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        
onClick={() => {
  setShowConfirmation(false);
  setSelectedStatus("");
}}

        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    <button
  type="button"
  
disabled={
  statusUpdating ||
  recoveryLoading ||
  recoveryRequired ||
  !validateStatusUpdate()
}

  onClick={handleConfirmStatusUpdate}
  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
>
  {statusUpdating ? "Updating..." : "Confirm Update"}
</button>
    </div>
  </div>
)}

</div>

  )}
</section>


  
<section className="mt-6 rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Purchased Products
  </h3>

  {!Array.isArray(order.items) || order.items.length === 0 ? (
    <p className="mt-4 text-sm text-gray-500">
      No purchased products found.
    </p>
  ) : (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Product Name
            </th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Unit Price
            </th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Quantity
            </th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-semibold">
              Subtotal
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {order.items.map((item, index) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            const validPrice = Number.isFinite(price) && price >= 0;
            const validQuantity =
              Number.isInteger(quantity) && quantity > 0;

            const formatPrice = (amount) =>
              `₹${amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;

            return (
              <tr key={`${item.product ?? item.name ?? "item"}-${index}`}>
                <td className="px-5 py-4 font-medium text-gray-900">
                  {item.name || "Unnamed product"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                  {validPrice ? formatPrice(price) : "N/A"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                  {validQuantity ? quantity : "N/A"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                  {validPrice && validQuantity
                    ? formatPrice(price * quantity)
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</section>

<section className="mt-6 rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Order Summary & Payment Information
  </h3>

  <div className="mt-5 grid gap-6 sm:grid-cols-2">
    <div>
      <p className="text-sm font-medium text-gray-500">
        Total Amount
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {typeof order.totalAmount === "number" &&
        Number.isFinite(order.totalAmount)
          ? `₹${order.totalAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "N/A"}
      </p>
    </div>

    <div>
      <p className="text-sm font-medium text-gray-500">
        Payment Method
      </p>

      <p className="mt-2 font-semibold text-gray-900">
        {order.paymentMethod === "COD"
          ? "Cash on Delivery"
          : order.paymentMethod || "Not available"}
      </p>
    </div>

    <div>
      <p className="text-sm font-medium text-gray-500">
        Order Status
      </p>

      <span
        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
          }[order.orderStatus] || "bg-gray-100 text-gray-700"
        }`}
      >
        {order.orderStatus || "Unknown"}
      </span>
    </div>

    <div>
      <p className="text-sm font-medium text-gray-500">
        Payment Status
      </p>

      <span
        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          {
            pending: "bg-yellow-100 text-yellow-800",
            paid: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
          }[order.paymentStatus] || "bg-gray-100 text-gray-700"
        }`}
      >
        {order.paymentStatus || "Unknown"}
      </span>
    </div>
  </div>
</section>

<section className="mt-6 rounded-lg border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Manage Order Status
  </h3>

  
{nextStatuses.length === 0 ? (
  <p className="mt-3 text-sm text-gray-600">
    This order has reached a final status. No further changes are allowed.
  </p>
) : (
  <div className="mt-4">
    <label
      htmlFor="nextOrderStatus"
      className="block text-sm font-medium text-gray-700"
    >
      Select Next Order Status
    </label>

    <select
      id="nextOrderStatus"
      value={
        nextStatuses.includes(selectedStatus)
          ? selectedStatus
          : ""
      }
      onChange={(event) => setSelectedStatus(event.target.value)}
      className="mt-2 w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      <option value="">Choose a status</option>

      {nextStatuses.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>

    <p className="mt-3 text-sm text-gray-500">
      Selecting a status does not update the order.
    </p>
    
<button
  type="button"
  disabled={!nextStatuses.includes(selectedStatus)}
  onClick={() => setShowConfirmation(true)}
  className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  Review Status Change
</button>

{showConfirmation && nextStatuses.includes(selectedStatus) && (
  <div
    role="group"
    aria-label="Confirm order status change"
    className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-5"
  >
    <h4 className="font-semibold text-gray-900">
      Confirm Order Status Change
    </h4>

    <p className="mt-3 text-sm text-gray-700">
      Current Status:{" "}
      <span className="font-semibold capitalize">
        {order.orderStatus}
      </span>
    </p>

    <p className="mt-2 text-sm text-gray-700">
      New Status:{" "}
      <span className="font-semibold capitalize">
        {selectedStatus}
      </span>
    </p>

    <p className="mt-3 text-sm text-amber-900">
      Please review this change carefully before confirming.
    </p>

    <div className="mt-5 flex flex-wrap gap-3">
      
<button
  type="button"
  disabled={statusUpdating}
  onClick={() => {
    setShowConfirmation(false);
    setSelectedStatus("");
    setReviewedOrderStatus(null);
    setStatusUpdateError("");
    setStatusUpdateSuccess("");
  }}
  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  Cancel
</button>


      <button
        type="button"
        disabled
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Confirm Update
      </button>
    </div>
  </div>
)}

  </div>
)}

</section>

</section>

  <div className="mt-4 grid gap-4 sm:grid-cols-2">
    <div>
      <p className="text-sm font-medium text-gray-500">
        Customer Name
      </p>

      <p className="mt-1 text-gray-900">
        {order.user &&
        typeof order.user === "object" &&
        !Array.isArray(order.user)
          ? order.user.name || "Name unavailable"
          : "Name unavailable"}
      </p>
    </div>

    <div>
      <p className="text-sm font-medium text-gray-500">
        Email Address
      </p>

      <p className="mt-1 break-all text-gray-900">
        {order.user &&
        typeof order.user === "object" &&
        !Array.isArray(order.user)
          ? order.user.email || "Email unavailable"
          : "Email unavailable"}
      </p>
    </div>
  </div>
</section>

          </div>
        )}
      </section>
    </main>
  );
}