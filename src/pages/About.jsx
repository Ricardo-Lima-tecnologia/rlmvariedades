import React from 'react';
import { Shield, Truck, Heart, Award, Users, ThumbsUp } from 'lucide-react';
import { STORE_NAME } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">Sobre a {STORE_NAME}</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            A <strong className="text-foreground">{STORE_NAME}</strong> nasceu com a missão de trazer os melhores produtos inovadores com preços acessíveis para todos os brasileiros. Trabalhamos incansavelmente para selecionar produtos de alta qualidade que fazem a diferença no dia a dia dos nossos clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-12">
          {[
            { icon: Award, title: "Qualidade Garantida", desc: "Todos os produtos passam por rigoroso controle de qualidade antes de chegar até você." },
            { icon: Truck, title: "Entrega Nacional", desc: "Enviamos para todas as regiões do Brasil com rastreamento completo." },
            { icon: Shield, title: "Compra Segura", desc: "Site 100% seguro com certificado SSL e proteção de dados." },
            { icon: Heart, title: "Atendimento Humanizado", desc: "Nossa equipe está sempre pronta para te ajudar via WhatsApp." },
            { icon: Users, title: "+10.000 Clientes", desc: "Milhares de clientes satisfeitos em todo o Brasil confiam na gente." },
            { icon: ThumbsUp, title: "Garantia 7 Dias", desc: "Não gostou? Devolvemos seu dinheiro em até 7 dias." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border rounded-xl p-6"
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-heading font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-xl p-8 text-center">
          <h2 className="font-heading text-2xl font-bold mb-3">Nossa Missão</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Democratizar o acesso a produtos inovadores e de qualidade, oferecendo uma experiência de compra segura, rápida e acessível para todos os brasileiros.
          </p>
        </div>
      </motion.div>
    </div>
  );
}