import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CartProvider } from '@/lib/cartContext';

import StoreLayout from '@/components/layout/StoreLayout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Category from '@/pages/Category';
import Deals from '@/pages/Deals';
import BestSellers from '@/pages/BestSellers';
import NewArrivals from '@/pages/NewArrivals';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import TrackOrder from '@/pages/TrackOrder';
import Checkout from '@/pages/Checkout';
import AdminGuard from '@/pages/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminSales from '@/pages/admin/Sales';
import AdminOrders from '@/pages/admin/Orders';
import AdminAbandoned from '@/pages/admin/Abandoned';
import AdminProducts from '@/pages/admin/AdminProducts';
import ImportProducts from '@/pages/admin/ImportProducts';
import VideoFrames from '@/pages/admin/VideoFrames';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/produto/:slug" element={<ProductDetail />} />
        <Route path="/categoria/:slug" element={<Category />} />
        <Route path="/ofertas" element={<Deals />} />
        <Route path="/mais-vendidos" element={<BestSellers />} />
        <Route path="/novidades" element={<NewArrivals />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/rastrear-pedido" element={<TrackOrder />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/vendas" element={<AdminSales />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/abandonados" element={<AdminAbandoned />} />
          <Route path="/admin/produtos" element={<AdminProducts />} />
          <Route path="/admin/importar" element={<ImportProducts />} />
          <Route path="/admin/videos" element={<VideoFrames />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CartProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster position="top-center" />
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App