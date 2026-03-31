import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatPrice, calcDiscount, CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import ProductFormModal from '@/components/admin/products/ProductFormModal';

const STOCK_LABELS = {
  in_stock: ['Em Estoque', 'bg-green-100 text-green-700'],
  low_stock: ['Estoque Baixo', 'bg-amber-100 text-amber-700'],
  out_of_stock: ['Sem Estoque', 'bg-red-100 text-red-700'],
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortField, setSortField] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');
  const qc = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products-full'],
    queryFn: () => base44.entities.Product.list('-created_date', 300),
  });

  const handleDelete = async (p) => {
    if (!confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return;
    await base44.entities.Product.delete(p.id);
    qc.invalidateQueries({ queryKey: ['admin-products-full'] });
    toast.success('Produto excluído!');
  };

  const handleToggleActive = async (p) => {
    await base44.entities.Product.update(p.id, { active: !p.active });
    qc.invalidateQueries({ queryKey: ['admin-products-full'] });
  };

  const openCreate = () => { setEditingProduct(null); setModalOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setModalOpen(true); };
  const handleSaved = () => {
    setModalOpen(false);
    qc.invalidateQueries({ queryKey: ['admin-products-full'] });
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const filtered = products
    .filter(p => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv?.toLowerCase() ?? '';
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Produtos</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar produto..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas as Categorias</option>
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Produto</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('category')}>
                  Categoria <SortIcon field="category" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('price')}>
                  Preço <SortIcon field="price" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('stock_quantity')}>
                  Estoque <SortIcon field="stock_quantity" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ativo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="space-y-2">
                      <p>Nenhum produto encontrado.</p>
                      <Button variant="outline" size="sm" onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-1" /> Criar primeiro produto
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const discount = calcDiscount(p.price, p.compare_price);
                  const catName = CATEGORIES.find(c => c.slug === p.category)?.name || p.category;
                  const [stockLabel, stockCls] = STOCK_LABELS[p.stock_status] || ['—', 'bg-gray-100 text-gray-500'];
                  return (
                    <tr key={p.id} className="border-t hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border" />
                            : <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 border" />
                          }
                          <div>
                            <div className="font-medium line-clamp-1">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{catName}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-primary">{formatPrice(p.price)}</div>
                        {discount > 0 && (
                          <div className="text-xs text-muted-foreground line-through">{formatPrice(p.compare_price)}</div>
                        )}
                        {discount > 0 && <span className="text-xs text-destructive font-semibold">-{discount}%</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${p.stock_quantity <= 5 && p.stock_quantity !== null ? 'text-destructive' : ''}`}>
                          {p.stock_quantity ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stockCls}`}>{stockLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${p.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {p.active ? <><Check className="w-3 h-3" /> Ativo</> : <><X className="w-3 h-3" /> Inativo</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">
          {filtered.length} produto(s) • {products.filter(p => p.active).length} ativo(s)
        </div>
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}