import React from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/constants';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Meu Carrinho ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
            <div>
              <p className="font-heading font-semibold text-lg">Carrinho vazio</p>
              <p className="text-sm text-muted-foreground mt-1">Adicione produtos para continuar</p>
            </div>
            <Button onClick={() => setIsOpen(false)} asChild>
              <Link to="/produtos">Ver Produtos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.variation}`} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    {item.variation && (
                      <p className="text-xs text-muted-foreground">{item.variation}</p>
                    )}
                    <p className="font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.variation, item.quantity - 1)}
                        className="w-7 h-7 rounded-md bg-card border flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.variation, item.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-card border flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id, item.variation)}
                        className="ml-auto text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Frete calculado no checkout</p>
              <Button className="w-full h-12 text-base font-semibold" asChild onClick={() => setIsOpen(false)}>
                <Link to="/checkout">Finalizar Compra</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                Continuar Comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}