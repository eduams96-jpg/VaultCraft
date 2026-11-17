# VaultCraft Studio 1.0.0

Primeira versão estável: gestor local de coleção e backlog de jogos para Windows.

## Funcionalidades
- Coleção com estado, plataforma, origem, nota, horas, data de conclusão e análise.
- Wishlist com prioridade e preço-alvo; radar de patches da Steam.
- Scanner de pastas (PC/NAS) e importação em lote.
- Roleta, estatísticas, Gamer Wrap-Up, Gamer Card, metas de backlog.
- Backups JSON e snapshots automáticos; backups e restauro de saves.
- Spotlight (`Ctrl+K`).

## Instalação
Extrai o ZIP, faz duplo clique em `VaultCraft.vbs`. Não requer administrador nem Node.js instalado (o runtime vem incluído). Verifica o SHA-256 do ZIP com `SHA256SUMS.txt`.

## Requisitos
Windows 10 ou 11, x64. Microsoft Edge recomendado.

## Dados e privacidade
Os dados ficam em `%LOCALAPPDATA%\VaultCraft` e não são alterados pela atualização ou desinstalação do programa. A app escuta só em `127.0.0.1` e não tem telemetria.

## Limitações conhecidas
- Pacote ZIP, não um instalador; os atalhos são criados por `Criar-Atalhos.vbs`.
- Os executáveis não estão assinados digitalmente; o Windows pode mostrar avisos de "editor desconhecido".
- Testes end-to-end feitos no computador de desenvolvimento, com dados isolados (18 verificações: arranque, persistência, lançamento de jogos, atalhos, proteção de pedidos). **Não testado** numa instalação Windows limpa, em Windows 10, nem sem ligação à Internet.
