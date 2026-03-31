import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { Sparkles } from 'lucide-react';

export default function NewArrivals() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => base44.entities.Product.filter({ active: true, is_new: true }, '-created_date', 50),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-8 h-8 text-accent" />
        <h1 className="font-heading text-3xl font-bold">Novidades</h1>
      </div>
      <p className="text-muted-foreground mb-8">Acabaram de chegar na loja</p>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border overflow-hidden">
              <div className="aspect-square bg-secondary animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-secondary animate-pulse rounded w-3/4" />
                <div className="h-4 bg-secondary animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}