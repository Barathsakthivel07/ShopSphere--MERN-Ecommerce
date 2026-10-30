
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  user,
  authLoading,
  children,
}) {
  const location = useLocation();

  // Wait until the server has checked the login cookie.
  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p role="status" className="text-gray-600">
          Checking your session...
        </p>
      </main>
    );
  }

  // Redirect visitors who are not logged in.
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Allow authenticated customers to see the page.
  return children;
}
