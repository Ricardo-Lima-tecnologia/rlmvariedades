import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      toast.success('Cadastro realizado! Você receberá as melhores ofertas.');
    }
  };

  return (
    <section className="bg-primary text-primary-foreground py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Mail className="w-10 h-10 mx-auto mb-4 opacity-80" />
        <h2 className="font-heading text-2xl font-bold mb-2">Ganhe 10% de Desconto</h2>
        <p className="opacity-80 mb-6">Cadastre seu email e receba um cupom exclusivo + as melhores ofertas</p>
        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <CheckCircle className="w-5 h-5" /> Cadastrado com sucesso!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 border-white/30 placeholder:text-white/60 text-white"
              required
            />
            <Button type="submit" className="bg-white text-primary hover:bg-white/90 font-semibold shrink-0">
              Cadastrar
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}