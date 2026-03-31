import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { STORE_NAME, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/constants';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Mensagem enviada! Responderemos em breve.');
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Fale Conosco</h1>
        <p className="text-muted-foreground mb-10">Estamos aqui para te ajudar. Entre em contato pelo canal de sua preferência.</p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 space-y-5">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Resposta mais rápida</p>
                  <p className="text-sm text-primary font-medium mt-1">Clique aqui para conversar</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">E-mail</p>
                  <p className="text-sm text-muted-foreground">contato@rlmvariedades.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Horário de Atendimento</p>
                  <p className="text-sm text-muted-foreground">Seg a Sex: 9h às 18h</p>
                  <p className="text-sm text-muted-foreground">Sábado: 9h às 13h</p>
                </div>
              </div>
            </div>

            {/* FAQ preview */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="font-heading font-semibold mb-3">Dúvidas Frequentes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Qual o prazo de entrega? <strong>7 a 15 dias úteis</strong></li>
                <li>• Posso trocar ou devolver? <strong>Sim, garantia de 7 dias</strong></li>
                <li>• Quais formas de pagamento? <strong>Pix, Cartão e Boleto</strong></li>
                <li>• O site é seguro? <strong>Sim, 100% protegido com SSL</strong></li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border rounded-xl p-6">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="font-heading text-xl font-bold mb-2">Mensagem Enviada!</h3>
                <p className="text-muted-foreground">Responderemos o mais breve possível.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-heading text-lg font-semibold mb-2">Envie uma mensagem</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <Input placeholder="Seu nome" required />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="seu@email.com" required />
                  </div>
                </div>
                <div>
                  <Label>Assunto</Label>
                  <Input placeholder="Como podemos ajudar?" required />
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea placeholder="Descreva sua dúvida ou solicitação..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Enviar Mensagem</Button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}