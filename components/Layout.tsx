import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Monitor, ShoppingBag, BookOpen, BarChart2, Shield, Home, HelpCircle, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Sobre', path: '/about', icon: <Monitor size={18} /> },
    { name: 'Loja VIP', path: '/shop', icon: <ShoppingBag size={18} /> },
    { name: 'Regras', path: '/rules', icon: <BookOpen size={18} /> },
    { name: 'Rastrear', path: '/track', icon: <Search size={18} /> },
    { name: 'Rankings', path: '/rankings', icon: <BarChart2 size={18} /> },
    { name: 'Suporte', path: '/support', icon: <HelpCircle size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                C
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                CAPITAL <span className="text-brand-500">CITY</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-baseline space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10 mx-2"></div>

            <div className="flex items-center gap-4">
               {profile && (
                 <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User size={16} className="text-brand-400" />
                    <span className="font-bold text-white">{profile.rp_nick}</span>
                 </div>
               )}
               
               <Link 
                to="/admin"
                className="text-gray-400 hover:text-brand-400 transition-colors p-2 rounded-full hover:bg-white/5"
                title="Painel Admin"
               >
                 <Shield size={18} />
               </Link>

               <button 
                onClick={signOut}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5" 
                title="Sair"
               >
                 <LogOut size={18} />
               </button>
            </div>
          </div>

          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-dark-800 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {profile && (
               <div className="px-3 py-4 flex items-center gap-3 border-b border-white/5 mb-2">
                 <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-400">
                    <User size={20} />
                 </div>
                 <div>
                   <p className="text-white font-bold">{profile.rp_nick}</p>
                   <p className="text-xs text-gray-500">{profile.discord}</p>
                 </div>
               </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
             <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Shield size={18} />
                Painel Admin
              </Link>
             <button
                onClick={() => { signOut(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium text-red-400 hover:bg-gray-700"
              >
                <LogOut size={18} />
                Sair da Conta
              </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-dark-900 border-t border-white/10 pt-12 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-4">Capital City RP</h3>
          <p className="text-gray-400 max-w-sm">
            O melhor servidor de Roleplay do Brasil. Uma experiência imersiva, moderna e otimizada para você construir sua história.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/about" className="hover:text-brand-400">Sobre nós</Link></li>
            <li><Link to="/rules" className="hover:text-brand-400">Regras</Link></li>
            <li><Link to="/shop" className="hover:text-brand-400">Loja VIP</Link></li>
            <li><Link to="/track" className="hover:text-brand-400">Rastrear Pedido</Link></li>
            <li><Link to="/admin" className="hover:text-brand-400 text-xs flex items-center gap-1 mt-4"><Shield size={12}/> Área Administrativa</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Social</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-brand-400">Discord</a></li>
            <li><a href="#" className="hover:text-brand-400">Instagram</a></li>
            <li><a href="#" className="hover:text-brand-400">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Capital City Roleplay. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-gray-100 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};