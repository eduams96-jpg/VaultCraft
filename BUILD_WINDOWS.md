# Reconstruir a distribuição Windows 1.0.2

## A partir do arquivo completo

Extrai todo o ZIP. A pasta `portable` contém o servidor já compilado, Node.js, uma base de dados modelo vazia e as bibliotecas do SDK WebView2 1.0.2903.40. `tools/Inno` contém o compilador Inno Setup usado na distribuição.

No PowerShell, a partir da raiz do arquivo:

```powershell
& .\source\packaging\windows\build-installer.ps1 -PayloadDir .\portable -InnoCompiler .\tools\Inno\ISCC.exe -OutputDir .\rebuilt
```

É necessário Windows x64 com o compilador .NET Framework e WPF do sistema. O script recompila a janela e o serviço a partir dos ficheiros C#, atualiza o bootstrap e o texto de ajuda e gera o instalador. As bibliotecas WebView2 já presentes em `portable` são reutilizadas. Não necessita de npm nem de descarregar o SDK para este processo.

O instalador fica em `rebuilt/VaultCraft-Setup-1.0.2.exe`. Para executar a pasta portátil depois de recompilar, abre `VaultCraft.Desktop.exe`; a cópia `VaultCraft.exe` conserva a versão arquivada. O instalador instala sempre a janela recém-compilada como `VaultCraft.exe`.

## A partir do código, sem o arquivo

1. Instala Node.js 24, Inno Setup e obtém o SDK Microsoft.Web.WebView2 1.0.2903.40 do NuGet.
2. Executa `npm ci`, `npx prisma generate` e `npm run package:win`. O pacote base é criado em `release/VaultCraft-1.0.2-win-x64`.
3. Prepara uma pasta SDK com `Microsoft.Web.WebView2.Core.dll` e `Microsoft.Web.WebView2.Wpf.dll` de `lib/net462` e `WebView2Loader.dll` de `runtimes/win-x64/native`.
4. Executa:

```powershell
npm run package:installer -- -PayloadDir .\release\VaultCraft-1.0.2-win-x64 -InnoCompiler 'C:\Program Files (x86)\Inno Setup 6\ISCC.exe' -WebView2SdkDir 'C:\WebView2Sdk'
```

Adapta os caminhos ao local de instalação. O script recusa pastas de backups, distribuições aninhadas e ficheiros de dados locais no pacote. O workflow antigo de tags continua a gerar o pacote base ZIP; o instalador desktop e o arquivo completo são publicados pelo responsável da release depois de validados.

## Dados e verificação

O arquivo contém apenas a base de dados modelo vazia. Os jogos, saves, perfis WebView2 e backups pessoais em `%LOCALAPPDATA%/VaultCraft` não fazem parte do arquivo; devem ser guardados separadamente.

`SHA256SUMS.txt` permite verificar todos os ficheiros arquivados. `repository.bundle` guarda o histórico Git até ao commit indicado em `ARQUIVO.md`; pode ser aberto com `git clone repository.bundle VaultCraft`.

Executáveis sem assinatura digital podem provocar avisos do Windows. Windows 10, instalação limpa e ausência de WebView2 não foram novamente testados nesta atualização de arquivo.
