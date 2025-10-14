import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/categories/new" element={<AdminCategoryForm />} />
        <Route path="/admin/categories/edit/:id" element={<AdminCategoryForm />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/admin/banners/new" element={<AdminBannerForm />} />
        <Route path="/admin/banners/edit/:id" element={<AdminBannerForm />} />
        <Route path="/admin/promo-codes" element={<AdminDashboard />} />

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
