import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cartContext';
import { formatPrice, calcDiscount, BADGE_LABELS, BADGE_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const discount = calcDiscount(product.price, product.compare_price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <Link to={`/produto/${product.slug}`} className="relative aspect-square overflow-hidden bg-secondary/30">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {product.badge && BADGE_LABELS[product.badge] && (
            <span className={`${BADGE_COLORS[product.badge] || 'bg-primary text-primary-foreground'} text-xs font-semibold px-2 py-1 rounded-md`}>
              {BADGE_LABELS[product.badge]}
            </span>
          )}
        </div>

        {product.free_shipping && (
          <div className="absolute top-2 right-2">
            <span className="bg-success text-success-foreground text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              <Truck className="w-3 h-3" /> Frete Grátis
            </span>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="w-full text-xs font-semibold h-9"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.review_count})</span>
          </div>
        )}

        <Link to={`/produto/${product.slug}`} className="flex-1">
          <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          {product.compare_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          ou 3x de {formatPrice(product.price / 3)} sem juros
        </p>
      </div>
    </motion.div>
  );
}