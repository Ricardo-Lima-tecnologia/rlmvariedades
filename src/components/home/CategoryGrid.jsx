import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, Heart, Wrench, Smartphone, Dumbbell, ChefHat, PawPrint } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';

const iconMap = {
  Home, Car, Heart, Wrench, Smartphone, Dumbbell, ChefHat, PawPrint,
};

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold">Compre por Categoria</h2>
        <p className="text-muted-foreground mt-2">Encontre exatamente o que você precisa</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((cat, i) => {
          const Icon = iconMap[cat.icon] || Home;
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-3 p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm text-center">{cat.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}