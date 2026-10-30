
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 100) {
      setError("Name must contain 2 to 100 characters.");
      return;
    }

    if (form.password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (new TextEncoder().encode(form.password).length > 72) {
      setError("Password must not exceed 72 UTF-8 bytes.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully! Please sign in.",
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🛍️</div>

          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>

          <p className="mt-2 text-gray-500">
            Join ShopSphere and start shopping
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Full Name
            </label>

            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email Address
            </label>

            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 12 characters"
                className={`${inputClass} pr-20`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 text-sm font-medium text-indigo-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="register-confirm"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="register-confirm"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={inputClass}
            />
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Sign In
          </Link>
        </p>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-indigo-600"
          >
            ← Back to Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
