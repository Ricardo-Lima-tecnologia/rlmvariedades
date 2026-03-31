import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Mariana Silva",
    location: "São Paulo, SP",
    rating: 5,
    text: "Produto chegou rápido e com qualidade incrível! Já é minha segunda compra e vou continuar comprando.",
  },
  {
    name: "Rafael Santos",
    location: "Rio de Janeiro, RJ",
    rating: 5,
    text: "Melhor custo-benefício que já encontrei. O atendimento pelo WhatsApp foi super rápido e atencioso.",
  },
  {
    name: "Juliana Oliveira",
    location: "Belo Horizonte, MG",
    rating: 5,
    text: "Comprei o kit de limpeza automotiva e superou minhas expectativas. Recomendo demais!",
  },
  {
    name: "Carlos Mendes",
    location: "Curitiba, PR",
    rating: 4,
    text: "Produtos muito bons e entrega dentro do prazo. Com certeza voltarei a comprar na RLM Variedades.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-secondary/50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">O que nossos clientes dizem</h2>
          <p className="text-muted-foreground mt-2">Milhares de clientes satisfeitos em todo Brasil</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}