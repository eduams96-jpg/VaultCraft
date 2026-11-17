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
- Microsoft WebView2 Runtime para a janela própria. Se faltar, o instalador obtém-no da Microsoft; nesse caso é necessária Internet.

## Instalação (utilizador)

1. Descarrega `VaultCraft-Setup-1.0.2.exe` da página de [Releases](https://github.com/eduams96-jpg/VaultCraft/releases).
2. Verifica a integridade (opcional, recomendado) no PowerShell:

   ```powershell
   Get-FileHash .\VaultCraft-Setup-1.0.2.exe -Algorithm SHA256
   ```

   O valor tem de coincidir com o de `SHA256SUMS.txt` da mesma release.
3. Executa o instalador. Não é preciso ser administrador.
4. Abre **VaultCraft Studio** pelo menu Iniciar ou pelo atalho do Ambiente de Trabalho. A aplicação abre numa janela própria, sem barra de endereços.
5. Ao fechar a janela, o serviço local é terminado. Para atualizar, instala a nova versão na mesma pasta.

Na primeira execução a app cria a base de dados vazia em `%LOCALAPPDATA%\VaultCraft`. Essa pasta **não** está dentro da pasta do programa, por isso atualizar ou apagar a pasta do programa não apaga os teus dados.

### Desinstalar

Usa a opção de desinstalação do Windows ou do menu Iniciar. Se quiseres apagar também os dados, apaga a pasta `%LOCALAPPDATA%\VaultCraft`.

## Utilização

- `Ctrl+K`: pesquisa rápida e comandos.
- `/`: foca a pesquisa da coleção.
- `Alt+N`: novo jogo.
- `Esc`: fecha o modal aberto.
- Para parar o servidor, fecha a janela. Para diagnóstico, executa `VaultCraft.exe --stop`.

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

Gerar o pacote base Windows (cria `release/`; inclui o servidor e Node.js):

```bash
npm run package:win
```

O script de empacotamento **cancela a publicação** se encontrar dados pessoais, caminhos do programador ou bases de dados no pacote.

Para gerar o instalador com a janela desktop, segue [BUILD_WINDOWS.md](BUILD_WINDOWS.md). O arquivo completo da release inclui o pacote já preparado, as bibliotecas WebView2 e o compilador Inno Setup, para reconstruir o instalador sem voltar a obter esses componentes.

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
