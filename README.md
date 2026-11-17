# VaultCraft Studio

Organizador **local** da tua coleção e backlog de jogos para Windows: biblioteca, wishlist, radar de atualizações, metas, estatísticas e roleta de decisão. Os teus dados ficam só no teu computador.

## Funcionalidades

- **Coleção**: jogos com estado, plataforma, origem (Steam, GOG, Epic, repack, emulador, físico), nota, horas jogadas, data de conclusão, análise pessoal, categorias e etiquetas.
- **Wishlist**: jogos desejados com prioridade, preço-alvo e estado (à espera de crack, de promoção, de lançamento).
- **Scanner de pastas**: deteta jogos numa pasta do PC ou de um NAS, com executável, tamanho e capa.
- **Ficha de jogo**: arranque direto (`.exe`, Steam, Epic), abrir pasta, backups de saves com restauro.
- **Radar de versões**: verifica patches recentes na Steam.
- **Metas de backlog**, **Roleta** para escolher o que jogar, **Estatísticas**, **Gamer Wrap-Up** e **Gamer Card** exportável.
- **Backups**: cópias JSON da base de dados e snapshots automáticos antes de operações destrutivas (mantém os 10 mais recentes).
- **Spotlight** (`Ctrl+K`): pesquisa rápida de jogos e comandos.

## Requisitos

- Windows 10 ou Windows 11, **x64**. Testado apenas em Windows 11 (ver a secção de testes da release).
- **Não é preciso** instalar Node.js, base de dados ou outro software: o pacote traz o runtime.
- Não é preciso permissões de administrador.
- Internet só para as pesquisas de metadados (Steam, HowLongToBeat) e para o radar de patches. Sem internet a app funciona, sem essas pesquisas.
- Recomendado: Microsoft Edge (já vem com o Windows) para abrir a app numa janela própria. Sem Edge, abre no browser predefinido.

## Instalação (utilizador)

1. Descarrega `VaultCraft-<versão>-win-x64.zip` da página de [Releases](https://github.com/eduams96-jpg/VaultCraft/releases).
2. Verifica a integridade (opcional, recomendado) no PowerShell:

   ```powershell
   Get-FileHash .\VaultCraft-1.0.0-win-x64.zip -Algorithm SHA256
   ```

   O valor tem de coincidir com o de `SHA256SUMS.txt` da mesma release.
3. Extrai o ZIP para uma pasta à tua escolha (por exemplo `Documentos\VaultCraft`). Não é preciso ser administrador.
4. Faz duplo clique em **`VaultCraft.vbs`** para abrir a app.
5. Opcional: faz duplo clique em **`Criar-Atalhos.vbs`** para criar atalhos no Ambiente de Trabalho e no Menu Iniciar. O script pede confirmação antes de criar seja o que for.

Na primeira execução a app cria a base de dados vazia em `%LOCALAPPDATA%\VaultCraft`. Essa pasta **não** está dentro da pasta do programa, por isso atualizar ou apagar a pasta do programa não apaga os teus dados.

### Desinstalar

Apaga a pasta do programa, os atalhos que criaste e, se quiseres apagar também os dados, a pasta `%LOCALAPPDATA%\VaultCraft`.

## Utilização

- `Ctrl+K`: pesquisa rápida e comandos.
- `/`: foca a pesquisa da coleção.
- `Alt+N`: novo jogo.
- `Esc`: fecha o modal aberto.
- Para parar o servidor, usa **`Parar-VaultCraft.bat`**.

## Privacidade e segurança

- A app escuta **só** em `127.0.0.1` (o próprio computador). Não fica acessível pela rede local.
- O servidor só aceita pedidos vindos da própria app, o que impede que outros sites abertos no browser usem a app.
- Não há telemetria nem contas de utilizador. Os dados ficam numa base de dados SQLite local.
- Nas pesquisas de metadados e na sincronização de horas da Steam, a app envia **apenas** o título ou o ID público do perfil que indicares, e só quando carregas no botão correspondente.
- O ID Steam é guardado localmente no browser da app; nunca é publicado.
- Para aceder a partir de outro dispositivo tens de definir `VAULTCRAFT_ALLOWED_HOSTS` e assumir o risco; por omissão isso não é possível.

## Desenvolvimento

Requisitos: Node.js 24 LTS e npm.

```bash
npm ci
copy .env.example .env   # base de dados de desenvolvimento em prisma/dev.db
npx prisma db push       # cria o esquema
npm run dev              # http://127.0.0.1:3000
```

Verificações antes de publicar:

```bash
npm run check            # lint + tsc + build
```

Gerar o pacote Windows (cria `release/`):

```bash
npm run package:win
```

O script de empacotamento **cancela a publicação** se encontrar dados pessoais, caminhos do programador ou bases de dados no pacote.

### Estrutura

- `src/app/` páginas e rotas da API local (`src/app/api/*`).
- `src/components/` interface.
- `src/lib/` lógica partilhada (backups, normalização de títulos, caminhos de dados).
- `src/proxy.ts` guarda de segurança das rotas `/api`.
- `prisma/schema.prisma` modelo de dados (SQLite; o caminho vem de `DATABASE_URL`).
- `packaging/windows/` lançadores e atalhos incluídos no pacote.
- `scripts/` build da base de dados modelo e do pacote.

## Licença

Ainda não definida. Até o titular publicar uma licença, todos os direitos estão reservados.
