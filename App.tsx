import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Rules } from './pages/Rules';
import { Rankings } from './pages/Rankings';
import { Support } from './pages/Support';
import { Admin } from './pages/Admin';
import { Start } from './pages/Start';
import { About } from './pages/About';
import { Checkout } from './pages/Checkout';
import { NewsPage } from './pages/News';
import { TrackOrder } from './pages/TrackOrder';
import { ToastProvider } from './components/ToastSystem';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/Auth';
import { Loader2 } from 'lucide-react';

// Componente para rotas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-brand-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Componente para rota pública (Auth) - redireciona se já logado
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            
            <Route path="*" element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/start" element={<Start />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/checkout/:itemId" element={<Checkout />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/track/:orderId" element={<TrackOrder />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;