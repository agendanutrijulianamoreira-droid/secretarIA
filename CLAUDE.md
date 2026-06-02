# SecretarIA — Instruções para o agente

## Fluxo de Git obrigatório

Após **toda** edição concluída:

1. Commit das alterações no branch atual com mensagem descritiva
2. Merge no `main` (fast-forward quando possível)
3. Push do `main` para o remoto
4. Deletar o branch de feature local e remoto

```bash
git checkout main
git merge --ff-only <branch> || git merge <branch>
git push origin main
git branch -d <branch>
git push origin --delete <branch>
```

Nunca deixar branches pendentes após o trabalho estar pronto.

## Estrutura do projeto

- `src/lib/` — fonte canônica: `supabase.js`, `db.js`, `api.js`
- `src/design-system/tokens.js` — única fonte de cores, planos e constantes de negócio
- `src/types/index.js` — JSDoc de todos os tipos de dados (ler antes de criar hooks/services)
- `src/hooks/` — hooks React (nunca importam JSX)
- `src/components/shared/` — componentes reutilizáveis entre features
- `src/pages/` — orquestradores, máx ~50 linhas, sem lógica de negócio
- `src/views/` — views por domínio (cliente/admin)

## Regras de componentização

- Nenhum arquivo passa de 150 linhas
- Uma responsabilidade por arquivo
- Páginas não fazem fetch direto — delegam para hooks
- Componentes recebem dados via props, não buscam do contexto global
- Antes de criar componente novo, verificar se já existe em `shared/`
