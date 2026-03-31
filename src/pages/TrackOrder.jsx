import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  Package, Search, Truck, CheckCircle, Clock, MapPin, AlertCircle, RefreshCw
} from 'lucide-react';

const ORDER_STATUS_MAP = {
  pending:    { label: 'Aguardando Pagamento', icon: Clock,         color: 'text-amber-500' },
  confirmed:  { label: 'Pagamento Confirmado', icon: CheckCircle,   color: 'text-primary' },
  processing: { label: 'Em Preparação',        icon: Package,       color: 'text-primary' },
  shipped:    { label: 'Enviado',              icon: Truck,         color: 'text-success' },
  delivered:  { label: 'Entregue',             icon: MapPin,        color: 'text-success' },
  cancelled:  { label: 'Cancelado',            icon: AlertCircle,   color: 'text-destructive' },
};

function TrackingTimeline({ events }) {
  if (!events?.length) return (
    <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento de rastreamento disponível ainda.</p>
  );

  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4 relative"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${i === 0 ? 'bg-primary' : 'bg-secondary border border-border'}`}>
              {i === 0
                ? <Truck className="w-4 h-4 text-white" />
                : <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              }
            </div>
            <div className={`flex-1 pb-2 ${i === 0 ? '' : 'opacity-70'}`}>
              <p className={`font-semibold text-sm ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {event.description}
              </p>
              {event.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {event.location}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.date} {event.time && `às ${event.time}`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [trackingEvents, setTrackingEvents] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [searched, setSearched] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoadingOrder(true);
    setSearched(true);
    setOrder(null);
    setTrackingEvents(null);
    setTrackingError('');

    const orders = await base44.entities.Order.filter({ order_number: query.trim().toUpperCase() });
    const found = orders[0] || null;
    setOrder(found);
    setLoadingOrder(false);

    if (found?.tracking_code) {
      fetchTracking(found.tracking_code);
    }
  };

  const fetchTracking = async (code) => {
    setLoadingTracking(true);
    setTrackingError('');
    const res = await base44.functions.invoke('trackOrder', { trackingCode: code });
    if (res.data?.error) {
      setTrackingError(res.data.error);
    } else {
      setTrackingEvents(res.data?.events || []);
    }
    setLoadingTracking(false);
  };

  const status = order ? ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <Package className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-2">Rastrear Pedido</h1>
          <p className="text-muted-foreground">Digite o número do seu pedido para acompanhar</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder="Ex: RLM-00001"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="text-center text-lg h-12"
          />
          <Button type="submit" className="h-12 px-6" disabled={loadingOrder}>
            <Search className="w-4 h-4 mr-2" /> Buscar
          </Button>
        </form>

        {loadingOrder && (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loadingOrder && searched && !order && (
          <div className="text-center py-10 bg-secondary/50 rounded-xl">
            <p className="text-muted-foreground">Nenhum pedido encontrado com esse número.</p>
            <p className="text-sm text-muted-foreground mt-1">Verifique o número e tente novamente.</p>
          </div>
        )}

        {order && status && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Resumo do pedido */}
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pedido</p>
                  <p className="font-bold text-lg">{order.order_number}</p>
                </div>
                <div className={`flex items-center gap-2 ${status.color}`}>
                  <status.icon className="w-5 h-5" />
                  <span className="font-semibold">{status.label}</span>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-bold">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pagamento</p>
                  <p className="font-medium capitalize">{order.payment_method?.replace('_', ' ') || '—'}</p>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <p className="font-medium text-sm">Itens do pedido:</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                      <span className="flex-1">{item.product_name} x{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rastreamento Correios */}
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Rastreamento Correios
                </h2>
                {order.tracking_code && (
                  <button
                    onClick={() => fetchTracking(order.tracking_code)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    disabled={loadingTracking}
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingTracking ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>
                )}
              </div>

              {!order.tracking_code ? (
                <div className="text-center py-6 bg-blue-50 rounded-lg border border-blue-200">
                  <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-900 font-medium">Código de rastreio será enviado por email</p>
                  <p className="text-xs text-blue-700 mt-1">Assim que seu pedido for enviado, você receberá um email com o código de rastreio dos Correios.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4 bg-secondary/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">Código:</p>
                    <p className="font-mono font-bold text-sm">{order.tracking_code}</p>
                  </div>

                  {loadingTracking ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      Consultando Correios...
                    </div>
                  ) : trackingError ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{trackingError}</p>
                    </div>
                  ) : (
                    <TrackingTimeline events={trackingEvents} />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}