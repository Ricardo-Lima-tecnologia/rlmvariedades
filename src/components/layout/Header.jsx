import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/lib/cartContext';
import { STORE_NAME, CATEGORIES } from '@/lib/constants';

export default function Header() {
  const { itemCount, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="hidden sm:inline">🚚 Frete Grátis acima de R$ 199 | Entrega para todo Brasil</span>
          <span className="sm:hidden text-center w-full">🚚 Frete Grátis acima de R$ 199</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/rastrear-pedido" className="hover:underline">Rastrear Pedido</Link>
            <Link to="/contato" className="hover:underline">Ajuda</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Mobile menu */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">R</span>
            </div>
            <span className="font-heading font-bold text-lg hidden sm:inline">{STORE_NAME}</span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input
                placeholder="Buscar produtos..."
                className="pr-10 bg-secondary/50 border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="w-5 h-5" />
            </button>
            <button
              className="relative p-2"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch}>
              <Input
                placeholder="Buscar produtos..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        )}

        {/* Desktop nav */}
        <nav className="hidden lg:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-1 h-10 text-sm">
              <li>
                <Link to="/produtos" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors font-medium">
                  Todos os Produtos
                </Link>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/ofertas" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors text-destructive font-semibold">
                  🔥 Ofertas
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(4rem+1.75rem)] z-40 bg-card border-t border-border overflow-y-auto">
          <nav className="p-4 space-y-1">
            <Link to="/produtos" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-secondary font-medium">
              Todos os Produtos
            </Link>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/categoria/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg hover:bg-secondary"
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/ofertas" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-secondary text-destructive font-semibold">
              🔥 Ofertas do Dia
            </Link>
            <div className="border-t border-border my-3" />
            <Link to="/sobre" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-secondary">
              Sobre Nós
            </Link>
            <Link to="/contato" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-secondary">
              Contato
            </Link>
            <Link to="/rastrear-pedido" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-secondary">
              Rastrear Pedido
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}