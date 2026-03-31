# 🚀 Guia de Migração — RLM Variedades
## Base44 → Supabase + Netlify

---

## 1. Configurar o Supabase

1. Acesse https://supabase.com e crie um projeto
2. No SQL Editor, execute o conteúdo de `supabase/schema.sql`
3. Copie as credenciais em **Settings > API**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (para as funções)

---

## 2. Variáveis de Ambiente

### Frontend (arquivo `.env`):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_MP_PUBLIC_KEY=TEST-xxxx
```

### Netlify Functions (painel Netlify > Environment Variables):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx
RESEND_API_KEY=re_xxxx
OPENAI_API_KEY=sk-xxxx (opcional, para geração de vídeos)
```

---

## 3. Instalar pacotes

```bash
npm install @supabase/supabase-js
npm uninstall @base44/sdk
```

---

## 4. Substituições no Frontend

| Antes (Base44)                              | Depois (Novo)                            |
|---------------------------------------------|------------------------------------------|
| `import { base44 } from '@/api/base44Client'` | `import { db } from '@/lib/db'`       |
| `base44.entities.Product.list()`            | `db.Product.list()`                      |
| `base44.entities.Order.filter({...})`       | `db.Order.filter({...})`                 |
| `base44.entities.Product.create({...})`     | `db.Product.create({...})`               |
| `base44.entities.Product.update(id, {...})` | `db.Product.update(id, {...})`           |
| `base44.entities.Product.delete(id)`        | `db.Product.delete(id)`                  |
| `base44.auth.me()`                          | `auth.me()` (de `@/lib/auth`)            |
| `base44.auth.logout('/')`                   | `auth.logout('/')`                       |
| `base44.functions.invoke('fn', payload)`    | `invokeFn('fn', payload)` (de `@/lib/functions`) |

---

## 5. Deploy no Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Inicializar projeto
netlify init

# Deploy
netlify deploy --prod
```

---

## 6. Exportar dados do Base44

Antes de migrar, exporte os dados das entidades pelo painel do Base44
e importe via Supabase Dashboard > Table Editor > Import CSV.

---

## 7. Email com Resend

1. Acesse https://resend.com e crie uma conta
2. Verifique seu domínio `rlmvariedades.com.br`
3. Gere uma API Key e adicione como `RESEND_API_KEY`

---

## Estrutura de arquivos novos

```
lib/
  supabaseClient.js   ← cliente Supabase
  db.js               ← substituto de base44.entities
  auth.js             ← substituto de base44.auth
  functions.js        ← substituto de base44.functions.invoke

netlify/
  functions/
    createPayment.js
    onNewOrder.js
    sendTrackingNotification.js
    trackOrder.js
    generateProductVideoFrames.js

supabase/
  schema.sql          ← schema completo do banco

netlify.toml          ← configuração de build e deploy
``