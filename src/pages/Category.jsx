import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { CATEGORIES } from '@/lib/constants';

export default function Category() {
  const { slug } = useParams();
  const cat = CATEGORIES.find(c => c.slug === slug);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: () => base44.entities.Product.filter({ active: true, category: slug }, '-created_date', 100),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Início</Link>
        <span>/</span>
        <span className="text-foreground">{cat?.name || slug}</span>
      </div>

      <h1 className="font-heading text-3xl font-bold mb-2">{cat?.name || slug}</h1>
      <p className="text-muted-foreground mb-8">
        {products.length} produto(s) encontrado(s)
      </p>

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
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Nenhum produto nesta categoria ainda</p>
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