import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminSales() {
  const [period, setPeriod] = useState(30);

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders-sales'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);
  const periodOrders = orders.filter(o => new Date(o.created_date) >= cutoff && o.status !== 'cancelled');

  const totalRevenue = periodOrders.reduce((s, o) => s + (o.total || 0), 0);
  const avgTicket = periodOrders.length ? totalRevenue / periodOrders.length : 0;

  // Série diária
  const dailyData = Array.from({ length: period }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (period - 1 - i));
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const dayOrders = periodOrders.filter(o => new Date(o.created_date).toDateString() === d.toDateString());
    return { label, total: dayOrders.reduce((s, o) => s + (o.total || 0), 0), pedidos: dayOrders.length };
  });

  // Vendas por método de pagamento
  const byPayment = periodOrders.reduce((acc, o) => {
    acc[o.payment_method] = (acc[o.payment_method] || 0) + (o.total || 0);
    return acc;
  }, {});
  const paymentData = Object.entries(byPayment).map(([name, value]) => ({
    name: name === 'pix' ? 'Pix' : name === 'credit_card' ? 'Cartão' : 'Boleto',
    value: Math.round(value * 100) / 100,
  }));

  const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Vendas</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period === d ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            >
              {d} dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Receita no Período', value: formatPrice(totalRevenue) },
          { label: 'Total de Vendas', value: periodOrders.length },
          { label: 'Ticket Médio', value: formatPrice(avgTicket) },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Receita por dia</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={Math.floor(period / 7)} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
            <Tooltip formatter={v => formatPrice(v)} />
            <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {paymentData.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Vendas por método de pagamento</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatPrice(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}