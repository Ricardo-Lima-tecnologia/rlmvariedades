import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/lib/constants';
import { ShoppingCart, Mail, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Carrinhos abandonados = pedidos com status "pending" há mais de 2 horas
export default function AdminAbandoned() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-abandoned'],
    queryFn: () => base44.entities.Order.filter({ status: 'pending' }, '-created_date', 100),
  });

  const orders = Array.isArray(data) ? data : [];

  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const abandoned = orders.filter(o => {
    const age = Date.now() - new Date(o.created_date).getTime();
    return age > TWO_HOURS;
  });

  const filtered = abandoned.filter(o =>
    !search ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    o.order_number?.toLowerCase().includes(search.toLowerCase())
  );

  const totalLost = filtered.reduce((s, o) => s + (o.total || 0), 0);

  const sendRecoveryEmail = async (order) => {
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `Seu pedido ${order.order_number} está esperando por você!`,
      body: `Olá ${order.customer_name},\n\nNotamos que você iniciou um pedido conosco mas não finalizou o pagamento.\n\nSeu pedido ${order.order_number} no valor de R$ ${order.total?.toFixed(2).replace('.', ',')} ainda está reservado.\n\nFinalize agora e garanta seus produtos!\n\nAcesse: ${window.location.origin}/checkout\n\nEquipe RLM Variedades`,
    });
    toast.success(`E-mail de recuperação enviado para ${order.customer_email}`);
  };

  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d atrás`;
    return `${h}h atrás`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Carrinhos Abandonados</h1>
        {filtered.length > 0 && (
          <div className="text-sm text-muted-foreground bg-card border rounded-lg px-4 py-2">
            Receita perdida estimada: <span className="font-bold text-destructive">{formatPrice(totalLost)}</span>
          </div>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, e-mail ou pedido..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-muted-foreground">Nenhum carrinho abandonado</p>
            <p className="text-sm text-muted-foreground mt-1">
              {abandoned.length === 0
                ? 'Pedidos pendentes há mais de 2h aparecerão aqui.'
                : 'Nenhum resultado para a busca.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Abandonado</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pagamento</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-t hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                      {o.customer_phone && <div className="text-xs text-muted-foreground">{o.customer_phone}</div>}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{o.order_number}</td>
                    <td className="px-4 py-3 font-bold text-primary">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" /> {timeAgo(o.created_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {o.payment_method?.replace('_', ' ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => sendRecoveryEmail(o)}
                        disabled={!o.customer_email}
                      >
                        <Mail className="w-3 h-3" /> Recuperar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t text-sm text-muted-foreground">
              {filtered.length} carrinho(s) abandonado(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}