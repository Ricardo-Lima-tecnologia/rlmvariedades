import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from '@/lib/constants';

const TEMPLATE_HEADERS = [
  'name','slug','category','price','compare_price','short_description','description',
  'badge','stock_quantity','stock_status','free_shipping','featured','best_seller',
  'is_new','is_deal','active','shipping_days_min','shipping_days_max','rating','review_count'
];

const TEMPLATE_EXAMPLE = [
  'Produto Exemplo','produto-exemplo','eletronicos','99.90','149.90',
  'Tagline do produto','Descrição completa aqui',
  'oferta','50','in_stock','false','false','true','false','false','true','7','15','4.5','100'
];

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(','), TEMPLATE_EXAMPLE.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'template_produtos.csv'; a.click();
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

function coerce(row) {
  return {
    name: row.name,
    slug: row.slug || row.name?.toLowerCase().replace(/\s+/g, '-'),
    category: row.category || 'eletronicos',
    price: parseFloat(row.price) || 0,
    compare_price: row.compare_price ? parseFloat(row.compare_price) : null,
    short_description: row.short_description || '',
    description: row.description || '',
    badge: row.badge || '',
    stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : null,
    stock_status: row.stock_status || 'in_stock',
    free_shipping: row.free_shipping === 'true',
    featured: row.featured === 'true',
    best_seller: row.best_seller === 'true',
    is_new: row.is_new === 'true',
    is_deal: row.is_deal === 'true',
    active: row.active !== 'false',
    shipping_days_min: parseInt(row.shipping_days_min) || 7,
    shipping_days_max: parseInt(row.shipping_days_max) || 15,
    rating: parseFloat(row.rating) || 5,
    review_count: parseInt(row.review_count) || 0,
    images: [],
  };
}

export default function ImportProducts() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rows = parseCSV(ev.target.result);
      let ok = 0, fail = 0;
      for (const row of rows) {
        if (!row.name) { fail++; continue; }
        await base44.entities.Product.create(coerce(row));
        ok++;
      }
      setResult({ ok, fail, total: rows.length });
      setImporting(false);
      if (ok > 0) toast.success(`${ok} produto(s) importado(s) com sucesso!`);
      if (fail > 0) toast.error(`${fail} linha(s) ignorada(s) (sem nome).`);
    };
    reader.readAsText(file);
  };

  const reset = () => { setFile(null); setPreview([]); setResult(null); };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Importar Produtos</h1>

      {/* Download template */}
      <div className="bg-card border rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-semibold">1. Baixe o template CSV</p>
          <p className="text-sm text-muted-foreground mt-1">Preencha o arquivo com seus produtos e faça o upload abaixo.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2 shrink-0">
          <Download className="w-4 h-4" /> Baixar Template
        </Button>
      </div>

      {/* Categorias válidas */}
      <div className="bg-secondary/40 border rounded-xl p-4">
        <p className="text-sm font-semibold mb-2">Categorias válidas (usar no campo <code className="bg-secondary px-1 rounded">category</code>):</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <span key={c.slug} className="text-xs bg-card border rounded px-2 py-1 font-mono">{c.slug}</span>
          ))}
        </div>
      </div>

      {/* Upload area */}
      {!result ? (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <p className="font-semibold">2. Faça o upload do CSV preenchido</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary rounded-xl p-10 cursor-pointer transition-colors group">
            <FileSpreadsheet className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
            <span className="font-medium text-sm">{file ? file.name : 'Clique para selecionar o arquivo CSV'}</span>
            <span className="text-xs text-muted-foreground mt-1">Apenas arquivos .csv</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </label>

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pré-visualização (primeiras {preview.length} linhas):</p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="text-xs w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      {Object.keys(preview[0]).slice(0, 6).map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                      ))}
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).slice(0, 6).map((v, j) => (
                          <td key={j} className="px-3 py-2 truncate max-w-[120px]">{v || '—'}</td>
                        ))}
                        <td className="px-3 py-2 text-muted-foreground">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={!file || importing} className="gap-2">
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Upload className="w-4 h-4" /> Importar Produtos</>}
            </Button>
            {file && <Button variant="outline" onClick={reset} className="gap-2"><X className="w-4 h-4" /> Limpar</Button>}
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-xl p-8 text-center space-y-4">
          {result.ok > 0 ? (
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          ) : (
            <AlertCircle className="w-14 h-14 text-destructive mx-auto" />
          )}
          <div>
            <p className="font-bold text-xl">Importação concluída!</p>
            <p className="text-muted-foreground mt-1">
              <span className="text-green-600 font-semibold">{result.ok} importado(s)</span>
              {result.fail > 0 && <span className="text-destructive font-semibold ml-2">{result.fail} ignorado(s)</span>}
              <span className="ml-2">de {result.total} linha(s)</span>
            </p>
          </div>
          <Button onClick={reset} variant="outline">Importar mais</Button>
        </div>
      )}
    </div>
  );
}