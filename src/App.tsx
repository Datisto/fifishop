import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './components/ProductDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryForm from './pages/admin/AdminCategoryForm';
import AdminBanners from './pages/admin/AdminBanners';
import AdminBannerForm from './pages/admin/AdminBannerForm';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminPromoCodeForm from './pages/admin/AdminPromoCodeForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  return isLoggedIn ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/products/new" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/products/edit/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/categories/new" element={<ProtectedRoute><AdminCategoryForm /></ProtectedRoute>} />
        <Route path="/admin/categories/edit/:id" element={<ProtectedRoute><AdminCategoryForm /></ProtectedRoute>} />
        <Route path="/admin/banners" element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
        <Route path="/admin/banners/new" element={<ProtectedRoute><AdminBannerForm /></ProtectedRoute>} />
        <Route path="/admin/banners/edit/:id" element={<ProtectedRoute><AdminBannerForm /></ProtectedRoute>} />
        <Route path="/admin/promo-codes" element={<ProtectedRoute><AdminPromoCodes /></ProtectedRoute>} />
        <Route path="/admin/promo-codes/new" element={<ProtectedRoute><AdminPromoCodeForm /></ProtectedRoute>} />
        <Route path="/admin/promo-codes/:id" element={<ProtectedRoute><AdminPromoCodeForm /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<ProtectedRoute><AdminOrderDetail /></ProtectedRoute>} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route
          path="/*"
          element={
            <div className="min-h-screen relative">
              <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('/photo_2025-10-08_19-19-59.jpg')",
                  zIndex: -1
                }}
              />
              <div className="relative backdrop-blur-lg">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
