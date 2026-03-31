import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PixPayment({ orderId, orderNumber, total, customerEmail, customerCpf, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generatePix = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await base44.functions.invoke('createPayment', {
        orderId,
        paymentMethod: 'pix',
        payerEmail: customerEmail,
        payerDocument: customerCpf,
      });
      if (res.data?.error) {
        setErrorMsg(res.data.error);
        toast.error(res.data.error);
      } else {
        setPixData(res.data);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erro ao processar pagamento. Tente novamente.';
      setErrorMsg(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(pixData.pixQrCode);
    setCopied(true);
    toast.success('Código Pix copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (pixData) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-800 mb-1">QR Code Pix gerado!</p>
          <p className="text-sm text-green-700">Escaneie ou copie o código abaixo. Válido por 30 minutos.</p>
        </div>

        {pixData.pixQrCodeBase64 && (
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${pixData.pixQrCodeBase64}`}
              alt="QR Code Pix"
              className="w-48 h-48 rounded-xl border"
            />
          </div>
        )}

        {pixData.pixQrCode && (
          <div className="bg-secondary rounded-lg p-3 text-xs font-mono break-all text-left">
            {pixData.pixQrCode.slice(0, 60)}...
          </div>
        )}

        <Button onClick={copyCode} variant="outline" className="w-full gap-2">
          {copied ? <><CheckCircle className="w-4 h-4 text-green-600" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar código Pix</>}
        </Button>

        <p className="text-xs text-muted-foreground">
          Após o pagamento, você receberá a confirmação por email. Pedido: <strong>{orderNumber}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-blue-800">Pagar com Pix</p>
        <p className="text-sm text-blue-700 mt-1">5% de desconto aplicado • Confirmação instantânea</p>
      </div>
      <div className="text-center font-bold text-2xl text-primary">
        R$ {total.toFixed(2).replace('.', ',')}
      </div>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Erro no pagamento</p>
            <p className="text-red-700 text-sm mt-0.5">{errorMsg}</p>
            {errorMsg.toLowerCase().includes('unauthorized') && (
              <p className="text-red-600 text-xs mt-2">⚠️ Verifique se sua conta Mercado Pago está habilitada para receber pagamentos em produção.</p>
            )}
          </div>
        </div>
      )}
      <Button onClick={generatePix} disabled={loading} className="w-full h-12 text-base font-semibold gap-2">
        {loading ? 'Gerando QR Code...' : 'Gerar QR Code Pix'}
      </Button>
    </div>
  );
}