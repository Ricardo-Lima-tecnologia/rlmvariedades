import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function useMercadoPago() {
  const [mp, setMp] = useState(null);
  useEffect(() => {
    if (window.MercadoPago) {
      setMp(new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || ''));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => setMp(new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || ''));
    document.head.appendChild(script);
  }, []);
  return mp;
}

export default function CardPayment({ orderId, orderNumber, total, customerEmail, customerCpf, onSuccess }) {
  const mp = useMercadoPago();
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [form, setForm] = useState({ number: '', name: '', expiry: '', cvv: '', installments: '1' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!mp) {
        toast.error('SDK do Mercado Pago não carregado. Recarregue a página.');
        setLoading(false);
        return;
      }

      const [expMonth, expYear] = form.expiry.split('/');
      const cardToken = await mp.createCardToken({
        cardNumber: form.number.replace(/\s/g, ''),
        cardholderName: form.name,
        cardExpirationMonth: expMonth,
        cardExpirationYear: '20' + expYear,
        securityCode: form.cvv,
        identificationType: 'CPF',
        identificationNumber: customerCpf?.replace(/\D/g, ''),
      });

      if (!cardToken?.id) {
        toast.error('Não foi possível tokenizar o cartão. Verifique os dados.');
        setLoading(false);
        return;
      }

      const res = await base44.functions.invoke('createPayment', {
        orderId,
        paymentMethod: 'credit_card',
        cardToken: cardToken.id,
        installments: parseInt(form.installments),
        payerEmail: customerEmail,
        payerDocument: customerCpf,
      });

      if (res.data?.approved) {
        setApproved(true);
        toast.success('Pagamento aprovado!');
        onSuccess?.();
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        toast.error('Pagamento não aprovado. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Erro ao processar pagamento.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (approved) {
    return (
      <div className="text-center space-y-3 py-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <p className="font-bold text-lg">Pagamento Aprovado!</p>
        <p className="text-muted-foreground text-sm">Pedido <strong>{orderNumber}</strong> confirmado.</p>
      </div>
    );
  }

  const installmentOptions = [1, 2, 3].map(n => ({
    value: String(n),
    label: n === 1
      ? `1x de R$ ${total.toFixed(2).replace('.', ',')} sem juros`
      : `${n}x de R$ ${(total / n).toFixed(2).replace('.', ',')} sem juros`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-secondary/50 border rounded-xl p-4">
        <p className="text-sm font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Dados do Cartão
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Número do Cartão</Label>
          <Input
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            value={form.number}
            onChange={e => setForm(f => ({ ...f, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() }))}
            required
          />
        </div>
        <div>
          <Label>Nome no Cartão</Label>
          <Input
            placeholder="Como está impresso"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Validade</Label>
            <Input
              placeholder="MM/AA"
              maxLength={5}
              value={form.expiry}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                setForm(f => ({ ...f, expiry: v }));
              }}
              required
            />
          </div>
          <div>
            <Label>CVV</Label>
            <Input
              placeholder="123"
              maxLength={4}
              value={form.cvv}
              onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '') }))}
              required
            />
          </div>
        </div>
        <div>
          <Label>Parcelas</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            value={form.installments}
            onChange={e => setForm(f => ({ ...f, installments: e.target.value }))}
          >
            {installmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
        {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2).replace('.', ',')}`}
      </Button>
    </form>
  );
}