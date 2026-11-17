#ifndef PayloadDir
  #error PayloadDir is required
#endif
[Setup]
AppId={{325D01A2-C3ED-4F76-83C2-B3E0B861BC50}
AppName=VaultCraft Studio
AppVersion=1.0.2
AppPublisher=VaultCraft
DefaultDirName={localappdata}\Programs\VaultCraft
DefaultGroupName=VaultCraft Studio
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
OutputDir=..\..\..\..\deliverables
OutputBaseFilename=VaultCraft-Setup-1.0.2
SetupIconFile={#PayloadDir}\app\public\vaultcraft.ico
UninstallDisplayIcon={app}\VaultCraft.exe
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no
DisableProgramGroupPage=yes
UninstallDisplayName=VaultCraft Studio
[Languages]
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl"
[Tasks]
Name: "desktopicon"; Description: "Criar atalho no Ambiente de Trabalho"; Flags: checkedonce
[Files]
Source: "{#PayloadDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "VaultCraft.exe,VaultCraft.Desktop.exe,*.vbs,*.bat,Launcher.cs,installer.iss,*.backup,*.tar.gz,app\release\*,app\backups\*"
Source: "{#PayloadDir}\VaultCraft.Desktop.exe"; DestDir: "{app}"; DestName: "VaultCraft.exe"; Flags: ignoreversion
[Icons]
Name: "{group}\VaultCraft Studio"; Filename: "{app}\VaultCraft.exe"; WorkingDir: "{app}"
Name: "{autodesktop}\VaultCraft Studio"; Filename: "{app}\VaultCraft.exe"; WorkingDir: "{app}"; Tasks: desktopicon
Name: "{group}\Desinstalar VaultCraft Studio"; Filename: "{uninstallexe}"
[Run]
Filename: "{app}\VaultCraft.exe"; Description: "Abrir VaultCraft Studio"; Flags: nowait postinstall skipifsilent
[UninstallRun]
Filename: "{app}\VaultCraft.exe"; Parameters: "--stop"; Flags: runhidden waituntilterminated; RunOnceId: "StopVaultCraft"
[Code]
function WebView2Installed: Boolean;
var Version: String;
begin
  Result := False;
  if RegQueryStringValue(HKLM32, 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Version) then
    Result := (Version <> '') and (Version <> '0.0.0.0');
  if not Result then
    if RegQueryStringValue(HKCU, 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Version) then
      Result := (Version <> '') and (Version <> '0.0.0.0');
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var ResultCode: Integer;
begin
  Result := '';
  if not WebView2Installed then begin
    try
      WizardForm.StatusLabel.Caption := 'A preparar o componente Microsoft WebView2...';
      DownloadTemporaryFile('https://go.microsoft.com/fwlink/p/?LinkId=2124703', 'MicrosoftEdgeWebview2Setup.exe', '', nil);
      if not Exec(ExpandConstant('{tmp}\MicrosoftEdgeWebview2Setup.exe'), '/silent /install', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
        RaiseException('Não foi possível iniciar a instalação do Microsoft WebView2.');
      if not WebView2Installed then
        RaiseException('Não foi possível instalar o Microsoft WebView2. Verifica a ligação à Internet e tenta novamente.');
    except
      Result := GetExceptionMessage;
      Exit;
    end;
  end;
  if FileExists(ExpandConstant('{app}\VaultCraft.exe')) then
    Exec(ExpandConstant('{app}\VaultCraft.exe'), '--stop', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;
