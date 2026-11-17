# VaultCraft Studio 1.0.2

Atualização da distribuição Windows: instalador em português e janela própria com Microsoft WebView2, sem barra de endereços.

- Inclui os fontes C# da janela e do serviço local, o bootstrap e os scripts de compilação.
- Instala para o utilizador atual, com atalhos no menu Iniciar e opção de atalho no Ambiente de Trabalho.
- Fecha o serviço local ao fechar a janela; preserva os dados em `%LOCALAPPDATA%\VaultCraft` ao atualizar ou desinstalar.
- O instalador obtém o WebView2 Runtime da Microsoft se estiver em falta; nesse caso necessita de Internet.
- Inclui instruções para reconstruir o instalador e um arquivo completo com código, histórico Git, pacote executável, bibliotecas WebView2 e compilador Inno Setup.

## Instalação

Descarrega e executa `VaultCraft-Setup-1.0.2.exe`. Confere o SHA-256 com o ficheiro publicado junto ao instalador. Abre VaultCraft Studio pelo menu Iniciar.

O ZIP `VaultCraft-1.0.2-arquivo-completo.zip` serve para arquivo e reconstrução; não inclui coleções ou backups pessoais.

## Validação e limites

Compilação da janela e do serviço, criação do instalador e teste automático isolado de inicialização da janela com WebView2 em Windows 11 x64. Servidor verificado com página e API de jogos HTTP 200, base vazia e encerramento confirmado. Verificação integral dos ficheiros do arquivo por SHA-256. Esta atualização não altera a lógica de coleção e não repete os testes funcionais da versão 1.0.0.

Executáveis sem assinatura digital. Não testado novamente em Windows 10, num Windows limpo ou sem WebView2 previamente instalado.
