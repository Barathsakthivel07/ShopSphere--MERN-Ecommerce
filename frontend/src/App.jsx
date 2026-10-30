import Login from "./pages/Login";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  logoutUser,
} from "./services/authService";

import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import Register from "./pages/Register";

import Cart from "./components/Cart";
import ProductCard from "./components/ProductCard";
import ProductDetails from "./pages/ProductDetails";
import { fetchProducts } from "./services/productService";

import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminRoute from "./components/AdminRoute";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";

import AdminOrders from "./pages/AdminOrders";

import AdminOrderDetails from "./pages/AdminOrderDetails";

import AdminProducts from "./pages/AdminProducts";





const categories = ["All", "Electronics", "Fashion", "Accessories"];

function AdminOrderDetailsRoute() {
  const { id } = useParams();

  return <AdminOrderDetails key={id} />;
}

function App() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  
const [cart, setCart] = useState(() => {
  try {
    const savedCart = localStorage.getItem("shopsphere_cart");

    if (!savedCart) {
      return [];
    }
   
    

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart.filter(
      (item) =>
        typeof item._id === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch (error) {
    console.error("Unable to restore shopping cart:", error);
    return [];
  }
});
 
function clearCart() {
  setCart([]);
}


  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const data = await fetchProducts(controller.signal);

        if (!controller.signal.aborted) {
          setProducts(data);
          setError("");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);
  
useEffect(() => {
  let active = true;

  async function restoreSession() {
    try {
      const data = await getCurrentUser();

      if (active) {
        setUser(data.user);
      }
    } catch {
      if (active) {
        setUser(null);
      }
    } finally {
      if (active) {
        setAuthLoading(false);
      }
    }
  }

  restoreSession();

  return () => {
    active = false;
  };
}, []);

  
useEffect(() => {
  try {
    localStorage.setItem(
      "shopsphere_cart",
      JSON.stringify(cart)
    );
  } catch (error) {
    console.error("Unable to save cart:", error);
  }
}, [cart]);


  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  function addToCart(product) {
    setCart((previous) => {
      const existing = previous.find(
        (item) => item._id === product._id
      );

      if (existing) {
        return previous.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart((previous) =>
      previous
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id) {
    setCart((previous) =>
      previous.filter((item) => item._id !== id)
    );
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function goHome() {
    navigate("/");
  }
  
async function handleLogout() {
  if (logoutLoading) return;

  setLogoutLoading(true);

  try {
    await logoutUser();
    setUser(null);
    navigate("/", { replace: true });
  } catch (error) {
    console.error("Logout failed:", error.message);
    alert("Unable to log out. Please try again.");
  } finally {
    setLogoutLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            to="/"
            className="text-3xl font-bold text-indigo-600"
          >
            ShopSphere
          </Link>

          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              navigate("/");
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-indigo-500 sm:w-80"
          />

          <div className="flex items-center gap-5">
            <Link to="/" className="font-medium hover:text-indigo-600">
              Products
            </Link>
            
           
{authLoading ? (
  <span className="text-sm text-gray-500">
    Checking session...
  </span>
) : user ? (
  <div className="flex items-center gap-3">
    <span className="font-medium text-gray-800">
      👤 {user.name}
    </span>
    
    <Link
      to="/account"
      className="rounded-lg px-3 py-2 font-medium text-indigo-600 transition hover:bg-indigo-50"
    >
     My Account
    </Link>
    
<Link
  to="/my-orders"
  className="text-indigo-600 hover:text-indigo-800 font-medium"
>
  My Orders
</Link>


   <button
      type="button"
      onClick={handleLogout}
      disabled={logoutLoading}
      className="rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {logoutLoading ? "Logging out..." : "Logout"}
    </button>
  </div>
) : (
  <div className="flex items-center gap-3">
    <Link
      to="/login"
      className="font-medium text-indigo-600 hover:underline"
    >
      Login
    </Link>

    <Link
      to="/register"
      className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
    >
      Register
    </Link>
  </div>
)}

            <Link
              to="/cart"
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"
            >
              🛒 Cart ({cartCount})
            </Link>
          </div>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <main>
              <section className="mx-auto max-w-7xl px-6 py-12">
                <h1 className="mb-8 text-3xl font-bold">
                  Featured Products
                </h1>

                <div className="mb-8 flex flex-wrap gap-3">
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCategory(item)}
                      aria-pressed={category === item}
                      className={`rounded-full px-5 py-2 font-medium ${
                        category === item
                          ? "bg-indigo-600 text-white"
                          : "bg-white shadow-sm hover:bg-indigo-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <p role="status" className="col-span-full text-center">
                      Loading products...
                    </p>
                  ) : error ? (
                    <p role="alert" className="col-span-full text-center text-red-600">
                      Unable to load products: {error}
                    </p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="col-span-full text-center">
                      No products found.
                    </p>
                  ) : (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={addToCart}
                      />
                    ))
                  )}
                </div>
              </section>
            </main>
          }
        />

        <Route
          path="/products/:id"
          element={<ProductDetails onAddToCart={addToCart} />}
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onIncrease={(id) => changeQuantity(id, 1)}
              onDecrease={(id) => changeQuantity(id, -1)}
              onRemove={removeItem}
              onClose={goHome}
            />
          }
        />

        
         <Route
            path="/login"
            element={
             <Login
               onLogin={(loggedInUser) => setUser(loggedInUser)}
              />
           }
          />

        <Route path="/register" element={<Register />} />
          
        <Route
          path="/account"
          element={
            <ProtectedRoute user={user} authLoading={authLoading}>
               <Account user={user} />
             </ProtectedRoute>
            }
         />
         <Route
          path="/checkout"
          element={
           <ProtectedRoute user={user} authLoading={authLoading}>
            <Checkout
            cart={cart}
            user={user}
            clearCart={clearCart}
            />

          </ProtectedRoute>
          }
        />

          <Route
          path="/orders/:id"
          element={
          <ProtectedRoute user={user} authLoading={authLoading}>
             <OrderConfirmation />
             </ProtectedRoute>
            }
            />
            <Route
            path="/my-orders"
             element={
             <ProtectedRoute user={user} authLoading={authLoading}>
              <MyOrders />
              </ProtectedRoute>
            }
            />

 {/* Protected administrator routes */}
           
 
<Route
  element={
    <AdminRoute
      user={user}
      authLoading={authLoading}
    />
  }
>
  <Route
    path="/admin/orders"
    element={<AdminOrders />}
  />

  <Route
    path="/admin/orders/:id"
    element={<AdminOrderDetailsRoute />}
  />
</Route>

  <Route
    path="/admin/products"
    element={<AdminProducts />}
  />
 



        <Route
          path="*"
          element={
            <main className="px-6 py-20 text-center">
              <h1 className="text-3xl font-bold">Page not found</h1>
              <Link to="/" className="mt-6 inline-block text-indigo-600">
                Return to ShopSphere
              </Link>
            </main>
          }
        />
      </Routes>

      <footer className="bg-gray-900 px-6 py-8 text-center text-white">
        <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
