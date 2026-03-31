import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Film, Loader2, CheckCircle, Play, RefreshCw, Trash2 } from 'lucide-react';

export default function VideoFrames() {
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState({}); // { productId: true }
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products-videoframes'],
    queryFn: () => base44.entities.Product.list('-created_date', 300),
  });

  const products = Array.isArray(data) ? data : [];

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = async (product) => {
    setGenerating(g => ({ ...g, [product.id]: true }));
    toast.info(`Gerando frames para "${product.name}"... Isso pode levar alguns minutos.`);
    try {
      const res = await base44.functions.invoke('generateProductVideoFrames', {
        productIds: [product.id],
      });
      const result = res.data?.results?.[0];
      if (result?.error) {
        toast.error(`Erro: ${result.error}`);
      } else {
        toast.success(`✅ ${result?.framesGenerated || 0} frames gerados para "${product.name}"!`);
        qc.invalidateQueries({ queryKey: ['admin-products-videoframes'] });
      }
    } catch (err) {
      toast.error('Erro ao gerar frames: ' + err.message);
    }
    setGenerating(g => ({ ...g, [product.id]: false }));
  };

  const handleClearFrames = async (product) => {
    if (!confirm(`Remover todos os frames de "${product.name}"?`)) return;
    await base44.entities.Product.update(product.id, { video_frames: [] });
    qc.invalidateQueries({ queryKey: ['admin-products-videoframes'] });
    toast.success('Frames removidos!');
  };

  const totalWithFrames = products.filter(p => p.video_frames?.length > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" /> Vídeos de Produto (IA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere 30 frames de demonstração por produto via IA — exibidos como vídeo animado na página do produto.
          </p>
        </div>
        <div className="bg-secondary/60 rounded-lg px-4 py-2 text-sm text-center">
          <div className="font-bold text-lg text-primary">{totalWithFrames}/{products.length}</div>
          <div className="text-muted-foreground">com vídeo</div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        ⚠️ Cada geração consome créditos de IA (30 imagens por produto). Gere um por vez ou em pequenos lotes.
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar produto..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-secondary animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary animate-pulse rounded w-1/2" />
                <div className="h-3 bg-secondary animate-pulse rounded w-1/4" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum produto encontrado.</div>
        ) : (
          filtered.map(p => {
            const hasFrames = p.video_frames?.length > 0;
            const isGen = generating[p.id];
            return (
              <div key={p.id} className="bg-card border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
                {/* Thumbnail */}
                <div className="shrink-0 relative">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                    : <div className="w-14 h-14 rounded-lg bg-secondary border" />
                  }
                  {hasFrames && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  {hasFrames ? (
                    <p className="text-xs text-green-600 font-semibold mt-0.5">
                      ✓ {p.video_frames.length} frames gerados
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Sem vídeo</p>
                  )}
                </div>

                {/* Preview mini-frames */}
                {hasFrames && (
                  <div className="hidden sm:flex gap-1 shrink-0">
                    {p.video_frames.slice(0, 3).map((frame, i) => (
                      <img key={i} src={frame} alt="" className="w-10 h-10 rounded object-cover border" />
                    ))}
                    {p.video_frames.length > 3 && (
                      <div className="w-10 h-10 rounded border bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                        +{p.video_frames.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {hasFrames && (
                    <button
                      onClick={() => handleClearFrames(p)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remover frames"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    size="sm"
                    variant={hasFrames ? 'outline' : 'default'}
                    onClick={() => handleGenerate(p)}
                    disabled={isGen}
                    className="gap-2 min-w-32"
                  >
                    {isGen ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
                    ) : hasFrames ? (
                      <><RefreshCw className="w-4 h-4" /> Regenerar</>
                    ) : (
                      <><Play className="w-4 h-4" /> Gerar Vídeo</>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}