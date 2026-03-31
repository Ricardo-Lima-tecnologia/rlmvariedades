import React, { useState } from 'react';
import { X, MapPin, Package, User, Phone, Mail, CreditCard, FileText, Truck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function OrderDetailModal({ order, onClose }) {
  const [trackingCode, setTrackingCode] = useState(order?.tracking_code || '');
  const [saving, setSaving] = useState(false);

  if (!order) return null;

  const addr = order.shipping_address || {};

  const handleSaveTracking = async () => {
    if (!trackingCode.trim()) {
      toast.error('Digite um código de rastreio');
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Order.update(order.id, { tracking_code: trackingCode });
      toast.success('Código de rastreio salvo! Email enviado ao cliente.');
      onClose();
    } catch (err) {
      toast.error('Erro ao salvar código de rastreio');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-heading font-bold text-lg">{order.order_number}</h2>
            <p className="text-xs text-muted-foreground">Detalhes completos do pedido</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Dados do Cliente */}
          <div>
            <p className="font-semibold text-sm flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" /> Dados do Cliente
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                <span className="font-medium">{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</span>
                <span className="font-medium">{order.customer_phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF</span>
                <span className="font-medium">{order.customer_cpf || '—'}</span>
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div>
            <p className="font-semibold text-sm flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" /> Endereço de Entrega
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
              {addr.street ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rua</span>
                    <span className="font-medium">{addr.street}, {addr.number}</span>
                  </div>
                  {addr.complement && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complemento</span>
                      <span className="font-medium">{addr.complement}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bairro</span>
                    <span className="font-medium">{addr.neighborhood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cidade/UF</span>
                    <span className="font-medium">{addr.city} — {addr.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CEP</span>
                    <span className="font-medium">{addr.zip_code}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Endereço não informado</p>
              )}
            </div>
          </div>

          {/* Itens */}
          <div>
            <p className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" /> Itens do Pedido
            </p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 text-sm">
                  {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product_name}</p>
                    {item.variation && <p className="text-xs text-muted-foreground">{item.variation}</p>}
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-primary shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamento e Totais */}
          <div>
            <p className="font-semibold text-sm flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" /> Pagamento
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método</span>
                <span className="font-medium capitalize">{order.payment_method?.replace('_', ' ') || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className={order.shipping_cost === 0 ? 'text-green-600 font-semibold' : ''}>
                  {order.shipping_cost === 0 ? 'Grátis' : formatPrice(order.shipping_cost || 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {order.notes && (
            <div>
              <p className="font-semibold text-sm flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" /> Observações
              </p>
              <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4">{order.notes}</p>
            </div>
          )}

          {/* Código de Rastreio */}
          <div>
            <p className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-primary" /> Código de Rastreio
            </p>
            <div className="space-y-3">
              <Input
                placeholder="Ex: AA123456789BR"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="text-sm font-mono"
              />
              {trackingCode && !order.tracking_code && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                  ⚠️ Um email com o código de rastreio será enviado ao cliente ao salvar.
                </p>
              )}
              {trackingCode !== (order.tracking_code || '') && (
                <Button
                  onClick={handleSaveTracking}
                  disabled={saving}
                  className="w-full h-9"
                  size="sm"
                >
                  {saving ? 'Salvando...' : 'Salvar Código de Rastreio'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}