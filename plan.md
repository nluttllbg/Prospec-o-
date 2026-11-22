# Prospecta — plano de implementação

## Abordagem

A primeira entrega será uma aplicação web funcional e responsiva para operação diária de prospecção. O produto terá um shell de dashboard premium, busca por empresas com filtros, CRM de leads, gerador de mensagem com saudação baseada em `America/Sao_Paulo`, abertura segura do WhatsApp, biblioteca de sites gerados e editor/preview inicial. A persistência do primeiro corte usa armazenamento local para manter a experiência utilizável no Preview; o backend já permanece preparado para persistir em Drizzle/MySQL e para chamar as integrações oficiais sem expor credenciais.

A busca real será encapsulada em um procedimento de servidor que usa o proxy Maps do Manus quando configurado. O app não apresentará resultados inventados como reais. Para validar a interface sem credenciais, haverá uma ação explícita de “Carregar demonstração”, com dados marcados como demonstração e nunca misturados à busca real.

A lógica de qualificação será determinística e auditável: website institucional, redes sociais, nota, quantidade de avaliações e telefone serão normalizados antes do cálculo de Lead Score. A mensagem de abordagem não será gerada livremente por IA: será montada por uma função pura com a estrutura obrigatória do briefing, evitando alterações acidentais de texto.

## Estrutura do projeto

- `client/src/pages/Home.tsx`: shell do dashboard, navegação, visão geral, busca, CRM e sites.
- `client/src/index.css`: tokens visuais, layout e componentes customizados da experiência Prospecta.
- `client/src/lib/prospecting.ts`: tipos, regras de score, classificação de site, saudação e link de WhatsApp.
- `server/routers.ts`: contratos tRPC para busca real e geração de mensagem/site.
- `server/_core/map.ts`: proxy oficial de Google Maps/Places já fornecido pelo starter.
- `drizzle/schema.ts`: base existente de usuários; a evolução de leads/sites poderá ser migrada depois que o modelo de ownership for definido.
- `public/manus-routes.json`: manifesto das rotas entregues.

## Direção visual escolhida

### Opções consideradas

- **Editorial SaaS / Swiss Modernism** — probabilidade 0,06.
- **Dark command center** — probabilidade 0,04.
- **Warm neo-brutalist** — probabilidade 0,03.

### Escolha: Editorial SaaS / Swiss Modernism

- **Movimento**: editorial suíço contemporâneo aplicado a produto B2B.
- **Princípios**: hierarquia tipográfica forte, informação escaneável, contraste controlado e superfícies com função clara.
- **Filosofia de cor**: azul-marinho quase preto para confiança e concentração; ciano como assinatura operacional; verdes e âmbar apenas para estados de negócio.
- **Paradigma de layout**: sidebar compacta e área de trabalho assimétrica, com hero editorial, rail lateral de contexto e painéis que se reorganizam no mobile.
- **Elementos de assinatura**: marca em monograma “P”, pílulas de status com ponto vivo e cartões com linha de acento lateral.
- **Interação**: cada ação dá feedback local e mantém o usuário no contexto; ações irreversíveis não existem no primeiro corte.
- **Animação**: entradas curtas de 180–240ms, elevação mínima, brilho sutil em CTAs e nenhum movimento decorativo contínuo.
- **Tipografia**: Manrope para interface e títulos, com tracking apertado em números; IBM Plex Mono para scores, IDs e metadados.
- **Essência da marca**: “encontre a próxima conversa certa antes que ela passe”; direto, criterioso e ambicioso.
- **Voz**: clara, comercial e sem exagero. Exemplos: “Priorize quem já tem reputação.” / “Transforme oportunidade em próxima ação.”
- **Wordmark**: “Prospecta” em peso 800 com o “P” reduzido a um monograma quadrado no símbolo.
- **Cor proprietária**: `#20D9C4`, um ciano menta usado apenas para ações primárias e sinais de avanço.

## Escopo técnico desta entrega

- Dashboard com indicadores calculados a partir dos leads salvos.
- Busca e filtros com estado real de loading, erro e vazio.
- Modo demonstração opt-in, claramente rotulado.
- CRM com status, busca, ordenação, notas, proposta e histórico local.
- Mensagem exata e botão copiar.
- Link `wa.me` com normalização e validação do telefone; sem envio automático.
- Catálogo de sites com status de geração/publicação e preview editorial.
- Rotas `/`, `/leads`, `/mensagens`, `/sites` e `/configuracoes` com navegação sem reload.
- Manifesto de rotas e diagnóstico TypeScript registrados.

## Evolução prevista

A próxima etapa deve substituir o armazenamento local por tabelas Drizzle com `ownerId`, `leads`, `activities` e `generatedSites`, além de adicionar OAuth obrigatório, Places Details com dados reais e fila assíncrona para geração de sites. As credenciais devem entrar por configuração segura do projeto, nunca pelo bundle do navegador.
