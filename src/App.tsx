import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './components/ProductDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminDashboard />} />
        <Route path="/admin/banners" element={<AdminDashboard />} />
        <Route path="/admin/promo-codes" element={<AdminDashboard />} />

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
    </Router>
  );
}

export default App;
