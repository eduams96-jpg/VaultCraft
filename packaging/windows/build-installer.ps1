param(
  [Parameter(Mandatory=$true)][string]$PayloadDir,
  [Parameter(Mandatory=$true)][string]$InnoCompiler,
  [string]$WebView2SdkDir,
  [string]$OutputDir = (Join-Path $PSScriptRoot '..\..\release')
)
$ErrorActionPreference = 'Stop'
$payload = (Resolve-Path -LiteralPath $PayloadDir).Path
$compiler = (Resolve-Path -LiteralPath $InnoCompiler).Path
foreach ($file in @('runtime\node.exe', 'app\server.js', 'app\prisma\template.db')) {
  if (!(Test-Path -LiteralPath (Join-Path $payload $file))) { throw "Pacote incompleto: $file" }
}
foreach ($folder in @('app\backups', 'app\release')) {
  if (Test-Path -LiteralPath (Join-Path $payload $folder)) { throw "Retira a pasta de dados ou artefactos antes de publicar: $folder" }
}
$unexpected = Get-ChildItem -LiteralPath $payload -Recurse -File -Force | Where-Object {
  $_.Name -eq '.env' -or $_.Name -eq 'instance.json' -or $_.Name -like '*.log' -or
  $_.Name -like '*.backup*' -or ($_.Name -like '*.db*' -and $_.FullName -ne (Join-Path $payload 'app\prisma\template.db'))
}
if ($unexpected) { throw "O pacote contém dados locais: $($unexpected.Name -join ', ')" }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'bootstrap.cjs') -Destination $payload
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'LEIA-ME.txt') -Destination $payload
& (Join-Path $PSScriptRoot 'build-desktop.ps1') -PayloadDir $payload -WebView2SdkDir $WebView2SdkDir
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$output = (Resolve-Path -LiteralPath $OutputDir).Path
& $compiler "/DPayloadDir=$payload" "/O$output" (Join-Path $PSScriptRoot 'installer.iss')
if ($LASTEXITCODE -ne 0) { throw 'Falhou a criação do instalador.' }
Write-Output "Instalador criado em $output"
