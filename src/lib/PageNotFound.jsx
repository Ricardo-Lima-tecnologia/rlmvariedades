import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-bold text-primary/20 mb-4">404</div>
        <h1 className="font-heading text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi removida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/"><Home className="w-4 h-4 mr-2" /> Voltar ao Início</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/produtos">Ver Produtos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}