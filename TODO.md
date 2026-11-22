# TODO — Prospecta

## Entrega inicial

- [x] A área “Encontrar Empresas” deve aceitar nicho, localização, nota mínima, mínimo de avaliações, quantidade desejada e filtros de site/telefone/duplicidade.
- [x] A busca real usa o proxy Google Maps/Places do servidor quando configurado e informa claramente quando a integração não está disponível.
- [x] Os resultados exibem nome, segmento, endereço, nota, avaliações, telefone, WhatsApp, situação do site, link do Maps e Lead Score.
- [x] O sistema classifica website institucional, presença social, ausência de site e situação não confirmada sem inventar dados.
- [x] Os leads são persistidos no cliente entre recarregamentos no primeiro corte e preparados para migração posterior a Drizzle/MySQL.
- [x] O CRM permite status, observações, histórico, filtros e ordenação por score.
- [x] A mensagem segue exatamente o texto definido no briefing e usa o horário de Brasília para bom dia, boa tarde ou boa noite.
- [x] “Copiar mensagem” copia sem alterar o conteúdo e exibe feedback discreto.
- [x] “Enviar pelo WhatsApp” abre somente o link `wa.me` com o telefone validado do lead e mensagem URL-encoded; nunca envia automaticamente.
- [x] A aplicação mantém estados de carregamento, erro, vazio e número ausente.
- [x] O catálogo de sites mostra briefing, preview, publicação/exportação preparadas, sem alegar publicação real sem integração configurada.
- [x] A navegação é responsiva e contém dashboard, descoberta, CRM, mensagens, sites e configurações.

## Evolução de integração

- [ ] Adicionar tabelas Drizzle de leads, atividades e sites com ownership por usuário.
- [ ] Adicionar Places Details e busca paginada no servidor.
- [ ] Adicionar geração de sites por LLM com schema estruturado e preservação de Design System.
- [ ] Adicionar storage durável para assets e exportação de projetos.
- [ ] Adicionar publicação isolada via GitHub/Vercel/Netlify após credenciais do usuário.
