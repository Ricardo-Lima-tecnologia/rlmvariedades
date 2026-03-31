import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, CreditCard, Headphones, Lock } from 'lucide-react';
import { STORE_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Trust bar */}
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: "Entrega Rápida", desc: "Para todo Brasil" },
            { icon: Shield, title: "Garantia 7 Dias", desc: "Devolução garantida" },
            { icon: CreditCard, title: "Pagamento Seguro", desc: "Pix, Cartão, Boleto" },
            { icon: Headphones, title: "Suporte 24h", desc: "Via WhatsApp" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs opacity-70">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">R</span>
            </div>
            <span className="font-heading font-bold text-lg">{STORE_NAME}</span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Sua loja online de produtos inovadores com os melhores preços do Brasil. Qualidade garantida e entrega rápida.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-heading font-semibold mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/sobre" className="hover:opacity-100 transition-opacity">Sobre Nós</Link></li>
            <li><Link to="/contato" className="hover:opacity-100 transition-opacity">Contato</Link></li>
            <li><Link to="/rastrear-pedido" className="hover:opacity-100 transition-opacity">Rastrear Pedido</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Categorias</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/categoria/casa-inteligente" className="hover:opacity-100 transition-opacity">Casa Inteligente</Link></li>
            <li><Link to="/categoria/automotivo" className="hover:opacity-100 transition-opacity">Automotivo</Link></li>
            <li><Link to="/categoria/eletronicos" className="hover:opacity-100 transition-opacity">Eletrônicos</Link></li>
            <li><Link to="/categoria/ferramentas" className="hover:opacity-100 transition-opacity">Ferramentas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Pagamento</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {["Pix", "Visa", "Master", "Elo", "Boleto"].map(m => (
              <span key={m} className="text-xs bg-background/10 px-3 py-1.5 rounded-md">{m}</span>
            ))}
          </div>
          <h4 className="font-heading font-semibold mb-3">Segurança</h4>
          <div className="flex items-center gap-2 text-sm opacity-70">
            <Lock className="w-4 h-4" />
            <span>Site 100% Seguro</span>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs opacity-50">
          © {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
        </div>
      </div>
    </footer>
  );
}