import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/constants';
import { Lock, ChevronLeft, CheckCircle, CreditCard, QrCode, FileText, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PixPayment from '@/components/checkout/PixPayment';
import CardPayment from '@/components/checkout/CardPayment';

const STEPS = { FORM: 'form', PAYMENT: 'payment', DONE: 'done' };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [step, setStep] = useState(STEPS.FORM);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const pixTotal = paymentMethod === 'pix' ? subtotal * 0.95 : subtotal;
  const shipping = pixTotal >= 199 ? 0 : 15.00;
  const total = pixTotal - discount + shipping;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    const coupons = await base44.entities.Coupon.filter({ code: couponCode.trim().toUpperCase(), active: true });
    if (coupons.length > 0) {
      const c = coupons[0];
      const d = c.discount_type === 'percentage' ? subtotal * (c.discount_value / 100) : c.discount_value;
      setDiscount(d);
      toast.success(`Cupom aplicado! Desconto de ${formatPrice(d)}`);
    } else {
      toast.error('Cupom inválido ou expirado');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const orderNumber = `RLM-${String(Date.now()).slice(-5)}`;

    const order = await base44.entities.Order.create({
      order_number: orderNumber,
      customer_name: formData.get('name'),
      customer_email: formData.get('email'),
      customer_phone: formData.get('phone'),
      customer_cpf: formData.get('cpf'),
      shipping_address: {
        street: formData.get('street'),
        number: formData.get('number'),
        complement: formData.get('complement'),
        neighborhood: formData.get('neighborhood'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('zip'),
      },
      items: items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        price: i.price,
        variation: i.variation,
        image: i.image,
      })),
      subtotal,
      shipping_cost: shipping,
      discount,
      total,
      coupon_code: couponCode || '',
      payment_method: paymentMethod,
      status: 'pending',
    });

    setCreatedOrder({
      id: order.id,
      order_number: orderNumber,
      total,
      customer_email: formData.get('email'),
      customer_cpf: formData.get('cpf'),
    });

    setLoading(false);

    if (paymentMethod === 'boleto') {
      clearCart();
      setStep(STEPS.DONE);
    } else {
      setStep(STEPS.PAYMENT);
    }
  };

  if (step === STEPS.DONE) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-2">Seu pedido foi realizado com sucesso.</p>
          <p className="font-bold text-xl text-primary mb-6">{createdOrder?.order_number}</p>
          <p className="text-sm text-muted-foreground mb-8">
            Você receberá as instruções de pagamento e rastreamento por email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild><Link to="/">Voltar à Loja</Link></Button>
            <Button variant="outline" asChild><Link to="/rastrear-pedido">Rastrear Pedido</Link></Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === STEPS.PAYMENT && createdOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="font-heading text-2xl font-bold mb-6 text-center">Finalizar Pagamento</h1>
        <div className="bg-card border rounded-xl p-6">
          {paymentMethod === 'pix' ? (
            <PixPayment
              orderId={createdOrder.id}
              orderNumber={createdOrder.order_number}
              total={createdOrder.total}
              customerEmail={createdOrder.customer_email}
              customerCpf={createdOrder.customer_cpf}
              onSuccess={() => { clearCart(); setStep(STEPS.DONE); }}
            />
          ) : (
            <CardPayment
              orderId={createdOrder.id}
              orderNumber={createdOrder.order_number}
              total={createdOrder.total}
              customerEmail={createdOrder.customer_email}
              customerCpf={createdOrder.customer_cpf}
              onSuccess={() => { clearCart(); setStep(STEPS.DONE); }}
            />
          )}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
          <Lock className="w-3 h-3" />
          <span>Pagamento processado pelo Mercado Pago — 100% seguro</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg mb-4">Seu carrinho está vazio</p>
        <Button asChild><Link to="/produtos">Ver Produtos</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Continuar comprando
      </Link>
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">Finalizar Compra</h1>

      <form onSubmit={handleFormSubmit}>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg">Dados Pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Nome Completo *</Label><Input name="name" required /></div>
                <div><Label>CPF *</Label><Input name="cpf" placeholder="000.000.000-00" required /></div>
                <div><Label>E-mail *</Label><Input name="email" type="email" required /></div>
                <div><Label>Telefone *</Label><Input name="phone" placeholder="(00) 00000-0000" required /></div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Endereço de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>CEP *</Label><Input name="zip" placeholder="00000-000" required /></div>
                <div><Label>Estado *</Label><Input name="state" required /></div>
                <div className="sm:col-span-2"><Label>Rua *</Label><Input name="street" required /></div>
                <div><Label>Número *</Label><Input name="number" required /></div>
                <div><Label>Complemento</Label><Input name="complement" /></div>
                <div><Label>Bairro *</Label><Input name="neighborhood" required /></div>
                <div><Label>Cidade *</Label><Input name="city" required /></div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Forma de Pagamento
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                  <RadioGroupItem value="pix" />
                  <QrCode className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Pix</p>
                    <p className="text-xs text-success font-semibold">5% de desconto • Aprovação instantânea</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                  <RadioGroupItem value="credit_card" />
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Até 3x sem juros</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                  <RadioGroupItem value="boleto" />
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Boleto Bancário</p>
                    <p className="text-xs text-muted-foreground">Compensação em 1-3 dias úteis</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>

          {/* Resumo */}
          <div>
            <div className="bg-card border rounded-xl p-6 sticky top-24 space-y-4">
              <h2 className="font-heading font-semibold text-lg">Resumo</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={`${item.product_id}-${item.variation}`} className="flex gap-3 text-sm">
                    {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-2 mb-3">
                  <Input placeholder="Cupom de desconto" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="text-sm" />
                  <Button type="button" variant="outline" size="sm" onClick={handleCoupon}>Aplicar</Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {paymentMethod === 'pix' && (
                  <div className="flex justify-between text-success font-semibold">
                    <span>Desconto Pix (5%)</span>
                    <span>-{formatPrice(subtotal * 0.05)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Cupom</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? 'text-success font-semibold' : ''}>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? 'Processando...' : 'Ir para Pagamento →'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Mercado Pago — Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}