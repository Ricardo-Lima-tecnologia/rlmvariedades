import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, Check, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/lib/cartContext';
import { formatPrice, calcDiscount, BADGE_LABELS, BADGE_COLORS, CATEGORIES } from '@/lib/constants';
import ProductSection from '@/components/home/ProductSection';
import VideoCarousel from '@/components/products/VideoCarousel';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState('');
  const { addItem } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['product-detail-all'],
    queryFn: () => base44.entities.Product.filter({ active: true }, '-created_date', 200),
  });

  const products = Array.isArray(data) ? data : [];
  const product = products.find(p => p.slug === slug);
  const related = products.filter(p => p.id !== product?.id && p.category === product?.category).slice(0, 4);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-secondary animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-secondary animate-pulse rounded w-3/4" />
            <div className="h-10 bg-secondary animate-pulse rounded w-1/2" />
            <div className="h-20 bg-secondary animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">Produto não encontrado</p>
        <Button asChild className="mt-4"><Link to="/produtos">Ver Produtos</Link></Button>
      </div>
    );
  }

  const discount = calcDiscount(product.price, product.compare_price);
  const categoryName = CATEGORIES.find(c => c.slug === product.category)?.name || product.category;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariation);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span>/</span>
          <Link to={`/categoria/${product.category}`} className="hover:text-foreground">{categoryName}</Link>
          <span>/</span>
          <span className="text-foreground truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary/30 border">
              {product.images?.[selectedImage] && (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-lg">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                      i === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {product.badge && BADGE_LABELS[product.badge] && (
              <Badge className={BADGE_COLORS[product.badge]}>{BADGE_LABELS[product.badge]}</Badge>
            )}
            <h1 className="font-heading text-2xl md:text-3xl font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.review_count || 0} avaliações)</span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.compare_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ou 3x de {formatPrice(product.price / 3)} sem juros
              </p>
              <p className="text-xs text-success font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> À vista no Pix com 5% de desconto: {formatPrice(product.price * 0.95)}
              </p>
            </div>

            {product.short_description && (
              <p className="text-muted-foreground">{product.short_description}</p>
            )}

            {/* Variations */}
            {product.variations?.map((v, vi) => (
              <div key={vi}>
                <p className="font-medium text-sm mb-2">{v.name}:</p>
                <div className="flex flex-wrap gap-2">
                  {v.options?.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariation(opt)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        selectedVariation === opt ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3"><Plus className="w-4 h-4" /></button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 h-12 text-base font-semibold">
                <ShoppingCart className="w-5 h-5 mr-2" /> Comprar Agora
              </Button>
            </div>

            {/* Stock */}
            {product.stock_status === 'low_stock' && (
              <p className="text-destructive text-sm font-semibold">⚠️ Últimas unidades! Restam poucas</p>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-1 gap-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="font-medium">
                    {product.free_shipping ? 'Frete Grátis' : 'Entrega para todo Brasil'}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    • {product.shipping_days_min || 7}-{product.shipping_days_max || 15} dias úteis
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-primary shrink-0" />
                <span>Garantia de 7 dias — devolução grátis</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <span>Compra 100% segura — dados protegidos</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Video Carousel */}
        {product.video_frames && product.video_frames.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-xl font-bold mb-4">Vídeo de Demonstração</h2>
            <VideoCarousel frames={product.video_frames} />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Descrição</TabsTrigger>
            <TabsTrigger value="specs">Especificações</TabsTrigger>
            <TabsTrigger value="shipping">Entrega</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="prose prose-sm max-w-none mt-4">
            <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {product.description || 'Sem descrição disponível.'}
            </div>
          </TabsContent>
          <TabsContent value="specs" className="mt-4">
            {product.specifications?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between py-2 px-3 bg-secondary/50 rounded-lg text-sm">
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Especificações não disponíveis.</p>
            )}
          </TabsContent>
          <TabsContent value="shipping" className="mt-4 space-y-3 text-sm">
            <p>📦 Enviamos para todo o Brasil via transportadora</p>
            <p>⏱️ Prazo estimado: {product.shipping_days_min || 7}-{product.shipping_days_max || 15} dias úteis</p>
            <p>🚚 {product.free_shipping ? 'Este produto possui frete grátis!' : 'Frete grátis para compras acima de R$ 199'}</p>
            <p>🔄 Garantia de 7 dias para trocas e devoluções</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <ProductSection
          title="Produtos Relacionados"
          subtitle="Você também pode gostar"
          products={related}
        />
      )}
    </div>
  );
}