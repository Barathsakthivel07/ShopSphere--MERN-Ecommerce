
import { Link } from "react-router-dom";

export default function Account({ user }) {
  if (!user) {
    return null;
  }

  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Page heading */}
        
<section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <div className="flex items-start gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-2xl">
      📦
    </div>

    <div className="flex-1">
      <h2 className="text-xl font-bold text-gray-900">
        My Orders
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        View your previous purchases, check payment details,
        and track your order status.
      </p>

      <Link
        to="/my-orders"
        className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        View My Orders →
      </Link>
    </div>
  </div>
</section>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="mt-2 text-gray-600">
            View your ShopSphere profile information
          </p>
        </div>

        {/* Profile card */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-md">
          {/* Profile banner */}
          <div className="bg-indigo-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-indigo-600">
                {initial}
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-2xl font-semibold">
                  {user.name}
                </h2>

                <p className="break-all text-sm text-indigo-100">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="space-y-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Full Name
                </p>

                <p className="break-words font-medium text-gray-900">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Email Address
                </p>

                <p className="break-all font-medium text-gray-900">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Account Role
                </p>

                <p className="font-medium capitalize text-gray-900">
                  {user.role || "customer"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm text-gray-500">
                  Login Status
                </p>

                <p className="font-medium text-green-600">
                  Authenticated
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Link
                to="/"
                className="inline-flex rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-gray-500">
          Your account information is provided by ShopSphere.
        </p>
      </div>
    </main>
  );
}
