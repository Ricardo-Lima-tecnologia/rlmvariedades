import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CATEGORIES } from '@/lib/constants';
import { X, Upload, Trash2, Plus, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

const BADGES = [
  { value: '', label: 'Nenhum' },
  { value: 'mais-vendido', label: 'Mais Vendido' },
  { value: 'oferta', label: 'Oferta' },
  { value: 'exclusivo', label: 'Exclusivo' },
  { value: 'novo', label: 'Novidade' },
  { value: 'frete-gratis', label: 'Frete Grátis' },
];

const EMPTY = {
  name: '', slug: '', category: 'eletronicos', price: '', compare_price: '',
  short_description: '', description: '', images: [], badge: '',
  stock_quantity: '', stock_status: 'in_stock', free_shipping: false,
  featured: false, best_seller: false, is_new: false, is_deal: false, active: true,
  shipping_days_min: 7, shipping_days_max: 15, rating: 5, review_count: 0,
};

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...product } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef();

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleNameChange = (name) => {
    set('name', name);
    if (!product) set('slug', slugify(name));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImg(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, images: [...f.images, file_url] }));
    }
    setUploadingImg(false);
    fileRef.current.value = '';
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Nome, preço e categoria são obrigatórios');
      return;
    }
    setSaving(true);
    const data = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock_quantity: form.stock_quantity !== '' ? parseInt(form.stock_quantity) : null,
      shipping_days_min: parseInt(form.shipping_days_min) || 7,
      shipping_days_max: parseInt(form.shipping_days_max) || 15,
      rating: parseFloat(form.rating) || 5,
      review_count: parseInt(form.review_count) || 0,
    };
    if (product?.id) {
      await base44.entities.Product.update(product.id, data);
      toast.success('Produto atualizado!');
    } else {
      await base44.entities.Product.create(data);
      toast.success('Produto criado!');
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6">
      <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-heading font-bold text-xl">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Imagens */}
          <div>
            <Label className="mb-2 block">Imagens do Produto</Label>
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current.click()}
                disabled={uploadingImg}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                {uploadingImg ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ImagePlus className="w-5 h-5" /><span className="text-xs">Adicionar</span></>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Dados básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Nome do Produto *</Label>
              <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ex: Fone Bluetooth Premium" />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="fone-bluetooth-premium" />
            </div>
            <div>
              <Label>Categoria *</Label>
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Preço (R$) *</Label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="99.90" />
            </div>
            <div>
              <Label>Preço Original (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.compare_price} onChange={e => set('compare_price', e.target.value)} placeholder="149.90" />
            </div>
          </div>

          {/* Descrições */}
          <div className="space-y-3">
            <div>
              <Label>Tagline (curta)</Label>
              <Input value={form.short_description} onChange={e => set('short_description', e.target.value)} placeholder="Slogan ou resumo do produto" />
            </div>
            <div>
              <Label>Descrição Completa</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Descrição detalhada dos benefícios..."
              />
            </div>
          </div>

          {/* Estoque */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label>Qtd. em Estoque</Label>
              <Input type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Status Estoque</Label>
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.stock_status} onChange={e => set('stock_status', e.target.value)}>
                <option value="in_stock">Em Estoque</option>
                <option value="low_stock">Estoque Baixo</option>
                <option value="out_of_stock">Sem Estoque</option>
              </select>
            </div>
            <div>
              <Label>Badge</Label>
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.badge} onChange={e => set('badge', e.target.value)}>
                {BADGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Frete Mín (dias)</Label>
              <Input type="number" min="1" value={form.shipping_days_min} onChange={e => set('shipping_days_min', e.target.value)} />
            </div>
            <div>
              <Label>Frete Máx (dias)</Label>
              <Input type="number" min="1" value={form.shipping_days_max} onChange={e => set('shipping_days_max', e.target.value)} />
            </div>
            <div>
              <Label>Avaliação (1-5)</Label>
              <Input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} />
            </div>
          </div>

          {/* Checkboxes */}
          <div>
            <Label className="mb-2 block">Configurações</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { field: 'active', label: 'Produto Ativo' },
                { field: 'featured', label: 'Destaque' },
                { field: 'best_seller', label: 'Mais Vendido' },
                { field: 'is_new', label: 'Novidade' },
                { field: 'is_deal', label: 'Oferta do Dia' },
                { field: 'free_shipping', label: 'Frete Grátis' },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!form[field]}
                    onChange={e => set(field, e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : 'Salvar Produto'}
          </Button>
        </div>
      </div>
    </div>
  );
}