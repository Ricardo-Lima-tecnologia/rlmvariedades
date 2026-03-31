import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductSection from '@/components/home/ProductSection';
import Testimonials from '@/components/home/Testimonials';
import NewsletterBanner from '@/components/home/NewsletterBanner';

export default function Home() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ active: true }, '-created_date', 50),
  });

  const bestSellers = products.filter(p => p.best_seller).slice(0, 8);
  const featured = products.filter(p => p.featured).slice(0, 8);
  const deals = products.filter(p => p.is_deal).slice(0, 8);
  const newProducts = products.filter(p => p.is_new).slice(0, 4);

  return (
    <div>
      <HeroBanner />
      <CategoryGrid />
      <ProductSection
        title="🔥 Mais Vendidos"
        subtitle="Os produtos que nossos clientes mais amam"
        products={bestSellers}
        linkTo="/mais-vendidos"
        isLoading={isLoading}
      />
      <ProductSection
        title="⭐ Produtos em Destaque"
        subtitle="Selecionados especialmente para você"
        products={featured}
        linkTo="/produtos?destaque=true"
        isLoading={isLoading}
      />
      {deals.length > 0 && (
        <div className="bg-destructive/5">
          <ProductSection
            title="💰 Ofertas do Dia"
            subtitle="Aproveite antes que acabe!"
            products={deals}
            linkTo="/ofertas"
            isLoading={isLoading}
          />
        </div>
      )}
      {newProducts.length > 0 && (
        <ProductSection
          title="🆕 Novidades"
          subtitle="Acabaram de chegar"
          products={newProducts}
          linkTo="/novidades"
          isLoading={isLoading}
        />
      )}
      <Testimonials />
      <NewsletterBanner />
    </div>
  );
}