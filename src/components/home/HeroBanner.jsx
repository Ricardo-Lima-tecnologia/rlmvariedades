import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Ofertas Imperdíveis
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              Produtos Inovadores com os{' '}
              <span className="text-amber-300">Melhores Preços</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Descubra a RLM Variedades — sua loja de produtos incríveis com entrega rápida para todo o Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 h-13 px-8 text-base font-bold shadow-lg">
                <Link to="/produtos">
                  Ver Produtos <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white h-13 px-8 text-base">
                <Link to="/ofertas">
                  🔥 Ofertas do Dia
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
          {[
            { icon: Truck, text: "Entrega Rápida", sub: "Todo Brasil" },
            { icon: Shield, text: "Garantia 7 Dias", sub: "Ou seu dinheiro de volta" },
            { icon: Zap, text: "Compra Segura", sub: "Dados protegidos" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-2 justify-center text-center sm:text-left">
              <Icon className="w-5 h-5 shrink-0 hidden sm:block" />
              <div>
                <p className="font-semibold text-xs sm:text-sm">{text}</p>
                <p className="text-[10px] sm:text-xs opacity-70 hidden sm:block">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}