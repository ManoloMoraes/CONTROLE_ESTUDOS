# Instruções de Deploy no Vercel - Controle de Estudos

## Problemas Resolvidos

Este projeto foi corrigido para resolver os seguintes problemas que causavam página em branco no Vercel:

1. **Configuração Base do Vite**: Removida a configuração `base: '/controle-estudos/'` que causava problemas de roteamento
2. **Conflitos de Dependências**: 
   - Atualizada versão do `date-fns` de v4.1.0 para v3.6.0
   - Atualizada versão do `react-day-picker` de 8.10.1 para ^9.4.4 (compatível com React 19)
3. **Configuração SPA**: Adicionado arquivo `vercel.json` para roteamento correto de Single Page Application

## Como fazer o deploy no Vercel

### Opção 1: Deploy via CLI do Vercel

1. Instale o Vercel CLI globalmente:
   ```bash
   npm install -g vercel
   ```

2. No diretório do projeto, execute:
   ```bash
   vercel
   ```

3. Siga as instruções do CLI para conectar com sua conta e configurar o projeto.

### Opção 2: Deploy via GitHub (Recomendado)

1. Faça push do projeto corrigido para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "New Project"
4. Importe seu repositório GitHub
5. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Configurações Importantes

- **Node.js Version**: Use Node.js 18.x ou superior
- **Package Manager**: npm (recomendado devido ao package-lock.json)
- **Environment Variables**: Não são necessárias para este projeto (Firebase configurado diretamente)

## Estrutura de Arquivos Importantes

```
controle-estudos/
├── vercel.json          # Configuração do Vercel para SPA
├── vite.config.js       # Configuração corrigida do Vite
├── package.json         # Dependências corrigidas
├── .env.example         # Exemplo de variáveis de ambiente
└── dist/               # Arquivos de build (gerados automaticamente)
```

## Verificação Pós-Deploy

Após o deploy, verifique se:

1. A página inicial carrega corretamente (não mais em branco)
2. O sistema de login funciona
3. As rotas da aplicação funcionam corretamente
4. Os assets (CSS, JS) são carregados sem erro 404

## Solução de Problemas

Se ainda houver problemas:

1. **Página em branco**: Verifique se o arquivo `vercel.json` está presente
2. **Erro 404 em assets**: Confirme que a configuração `base: '/'` está no `vite.config.js`
3. **Problemas de build**: Execute `npm run build` localmente para verificar erros

## Suporte

Se encontrar problemas, verifique:
- Logs de build no painel do Vercel
- Console do navegador para erros JavaScript
- Configurações de domínio e DNS (se usando domínio customizado)

