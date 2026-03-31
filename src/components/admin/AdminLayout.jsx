import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, TrendingUp, Package, ShoppingCart, LogOut, Menu, X, Upload, MapPin, Film } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/vendas', label: 'Vendas', icon: TrendingUp },
  { path: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { path: '/admin/abandonados', label: 'Abandonados', icon: ShoppingCart },
  { path: '/admin/produtos', label: 'Produtos', icon: Package },
  { path: '/admin/importar', label: 'Importar', icon: Upload },
  { path: '/admin/videos', label: 'Vídeos IA', icon: Film },
  { path: '/rastrear-pedido', label: 'Rastrear Pedido', icon: MapPin },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (nav) => nav.exact ? pathname === nav.path : pathname.startsWith(nav.path);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-60 bg-card border-r flex-col shrink-0">
        <div className="p-5 border-b">
          <div className="font-heading font-bold text-lg text-primary">RLM Admin</div>
          <div className="text-xs text-muted-foreground mt-0.5">Painel de Controle</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <Link
              key={n.path}
              to={n.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(n) ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'}`}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-card flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="font-heading font-bold text-lg text-primary">RLM Admin</div>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV.map(n => (
                <Link
                  key={n.path}
                  to={n.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(n) ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'}`}
                >
                  <n.icon className="w-4 h-4" />
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t">
              <button
                onClick={() => base44.auth.logout('/')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b px-4 md:px-6 py-3 flex items-center gap-3">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Ver loja</Link>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}