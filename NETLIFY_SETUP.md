# Configuração de Deploy Automático no Netlify

## ⚠️ IMPORTANTE: Configurar Variáveis de Ambiente

A aplicação está apresentando **tela em branco** porque as variáveis de ambiente do Base44 não estão configuradas no Netlify.

## Passos para Configurar:

### 1. Acesse o Netlify Dashboard
- Vá para https://app.netlify.com
- Selecione seu site (rlmvariedadesonline)

### 2. Configure as Variáveis de Ambiente
- Vá em **Site settings** → **Environment variables**
- Clique em **Add a variable**
- Adicione as seguintes variáveis:

```
VITE_BASE44_APP_ID=seu_app_id_aqui
VITE_BASE44_APP_BASE_URL=seu_backend_url_aqui
VITE_BASE44_FUNCTIONS_VERSION=latest
```

### 3. Obtenha os Valores Corretos
- Acesse https://app.base44.com
- Vá para as configurações do seu projeto
- Copie o **App ID** e **Backend URL**

### 4. Faça Redeploy
Após adicionar as variáveis:
- Vá em **Deploys** → **Trigger deploy** → **Deploy site**
- Ou simplesmente faça um novo push para o GitHub (deploy automático)

## Verificação

Após configurar as variáveis e fazer redeploy:
- ✅ O site deve carregar normalmente
- ✅ Os produtos devem aparecer
- ✅ Não haverá mais erros de `.filter is not a function`

## Deploy Automático

Uma vez configurado, **cada push para a branch `main`** irá automaticamente:
1. Acionar um build no Netlify
2. Executar `npm run build`
3. Fazer deploy da pasta `dist`
4. Atualizar https://rlmvariedadesonline.netlify.app

## Arquivos de Configuração

- `netlify.toml` - Configurações de build e redirects
- `env.example` - Exemplo das variáveis necessárias
