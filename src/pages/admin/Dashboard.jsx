import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, DollarSign, Package, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });
  const { data: productsData } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];
  const products = Array.isArray(productsData) ? productsData : [];

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeProducts = products.filter(p => p.active).length;

  // Vendas por dia (últimos 7 dias)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const dayOrders = orders.filter(o => {
      const od = new Date(o.created_date);
      return od.toDateString() === d.toDateString() && o.status !== 'cancelled';
    });
    return { label, total: dayOrders.reduce((s, o) => s + (o.total || 0), 0) };
  });

  const stats = [
    { label: 'Receita Total', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Total de Pedidos', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pedidos Pendentes', value: pendingOrders, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: 'Produtos Ativos', value: activeProducts, icon: Package, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Vendas — Últimos 7 dias</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last7}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
            <Tooltip formatter={v => formatPrice(v)} />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Últimos Pedidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Pedido</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Total</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map(o => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2 font-mono font-semibold">{o.order_number}</td>
                  <td className="py-2">{o.customer_name}</td>
                  <td className="py-2 font-semibold">{formatPrice(o.total)}</td>
                  <td className="py-2">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: ['Pendente', 'bg-amber-100 text-amber-700'],
    confirmed: ['Confirmado', 'bg-blue-100 text-blue-700'],
    processing: ['Preparando', 'bg-purple-100 text-purple-700'],
    shipped: ['Enviado', 'bg-cyan-100 text-cyan-700'],
    delivered: ['Entregue', 'bg-green-100 text-green-700'],
    cancelled: ['Cancelado', 'bg-red-100 text-red-700'],
  };
  const [label, cls] = map[status] || ['–', 'bg-gray-100 text-gray-600'];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}