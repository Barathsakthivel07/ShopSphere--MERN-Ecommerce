
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminRoute({ user, authLoading }) {
  const location = useLocation();

  // Wait until authentication has been checked.
  if (authLoading) {
    return (
      <div role="status" aria-live="polite">
        Checking administrator access...
      </div>
    );
  }

  // Redirect visitors who are not logged in.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // Block logged-in customers.
  if (user.role !== "admin") {
    return <Navigate to="/account" replace />;
  }

  // Allow administrators to access child routes.
  return <Outlet />;
}
