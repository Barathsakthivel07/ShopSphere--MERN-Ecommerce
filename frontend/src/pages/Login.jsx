
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
 const from = location.state?.from;

 const redirectTo =
  typeof from?.pathname === "string" &&
  from.pathname.startsWith("/") &&
  !from.pathname.startsWith("//") &&
  !from.pathname.startsWith("/\\")
    ? `${from.pathname}${from.search || ""}${from.hash || ""}`
    : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });
        onLogin?.(data.user);

      navigate(redirectTo, { replace: true });

    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🛍️</div>

          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-500">
            Sign in to your ShopSphere account
          </p>
        </div>
        
{location.state?.message && (
  <div
    role="status"
    className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
  >
    {location.state.message}
  </div>
)}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute inset-y-0 right-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Create an account
          </Link>
        </p>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-indigo-600">
            ← Back to Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
