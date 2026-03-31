import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

export default function ProductSection({ title, subtitle, products, linkTo, linkLabel = "Ver Todos", isLoading }) {
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-secondary animate-pulse rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border overflow-hidden">
              <div className="aspect-square bg-secondary animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-secondary animate-pulse rounded w-3/4" />
                <div className="h-4 bg-secondary animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {linkTo && (
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link to={linkTo}>
              {linkLabel} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
      {linkTo && (
        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link to={linkTo}>
              {linkLabel} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}