import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import OrderDetailModal from '@/components/admin/OrderDetailModal';

const STATUS_MAP = {
  pending: ['Pendente', 'bg-amber-100 text-amber-700'],
  confirmed: ['Confirmado', 'bg-blue-100 text-blue-700'],
  processing: ['Preparando', 'bg-purple-100 text-purple-700'],
  shipped: ['Enviado', 'bg-cyan-100 text-cyan-700'],
  delivered: ['Entregue', 'bg-green-100 text-green-700'],
  cancelled: ['Cancelado', 'bg-red-100 text-red-700'],
};

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders-full'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
  });

  const orders = Array.isArray(data) ? data : [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders-full'] }),
  });

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Pedidos</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido ou cliente..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="processing">Preparando</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pedido</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Itens</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pagamento</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary animate-pulse rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum pedido encontrado</td></tr>
              ) : (
                filtered.map(o => {
                  const [label, cls] = STATUS_MAP[o.status] || ['–', 'bg-gray-100 text-gray-600'];
                  return (
                    <tr key={o.id} className="border-t hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                      </td>
                      <td className="px-4 py-3">{(o.items || []).length} item(s)</td>
                      <td className="px-4 py-3 font-bold">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3 capitalize">{o.payment_method?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3">
                        <Select value={o.status} onValueChange={val => updateStatus.mutate({ id: o.id, status: val })}>
                          <SelectTrigger className="w-36 h-7 text-xs">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_MAP).map(([val, [lbl]]) => (
                              <SelectItem key={val} value={val}>{lbl}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}