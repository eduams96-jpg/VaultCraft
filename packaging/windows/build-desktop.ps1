param(
  [Parameter(Mandatory=$true)][string]$PayloadDir,
  [string]$WebView2SdkDir
)
$ErrorActionPreference = 'Stop'
$payload = (Resolve-Path -LiteralPath $PayloadDir).Path
if ($WebView2SdkDir) {
  foreach ($name in @('Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.Wpf.dll','WebView2Loader.dll')) {
    Copy-Item -LiteralPath (Join-Path $WebView2SdkDir $name) -Destination $payload
  }
}
foreach ($name in @('Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.Wpf.dll','WebView2Loader.dll')) {
  if (!(Test-Path -LiteralPath (Join-Path $payload $name))) { throw "Falta o componente do SDK Microsoft WebView2: $name" }
}
$framework = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319'
$compiler = Join-Path $framework 'csc.exe'
$wpf = Join-Path $framework 'WPF'
& $compiler /nologo /target:winexe /platform:x64 "/out:$payload\VaultCraft.Server.exe" /r:System.Windows.Forms.dll /r:System.Web.Extensions.dll (Join-Path $PSScriptRoot 'Launcher.cs')
if ($LASTEXITCODE -ne 0) { throw 'Falhou a compilação do serviço local.' }
& $compiler /nologo /target:winexe /platform:x64 "/out:$payload\VaultCraft.Desktop.exe" "/win32icon:$payload\app\public\vaultcraft.ico" /r:System.Web.Extensions.dll /r:System.Xaml.dll "/r:$wpf\PresentationFramework.dll" "/r:$wpf\PresentationCore.dll" "/r:$wpf\WindowsBase.dll" "/r:$payload\Microsoft.Web.WebView2.Core.dll" "/r:$payload\Microsoft.Web.WebView2.Wpf.dll" (Join-Path $PSScriptRoot 'DesktopHost.cs')
if ($LASTEXITCODE -ne 0) { throw 'Falhou a compilação da janela da aplicação.' }
Write-Output 'Janela desktop e serviço local compilados.'
