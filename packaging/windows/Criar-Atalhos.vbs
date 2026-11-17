' Cria atalhos do VaultCraft Studio no Ambiente de Trabalho e no Menu Iniciar DA TUA CONTA.
' Não requer administrador. Pede confirmação antes de criar seja o que for.
' Teste/automação: cscript //nologo Criar-Atalhos.vbs /destino:"C:\pasta" (cria só nessa pasta, sem perguntar)
Option Explicit

Dim shell, fso, appDir, targets(), n, sw, dest, silent, i, s, lnk
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)

If WScript.Arguments.Named.Exists("destino") Then
  ReDim targets(0)
  targets(0) = WScript.Arguments.Named("destino")
Else
  Dim answer
  answer = MsgBox("Criar atalhos do VaultCraft Studio no Ambiente de Trabalho e no Menu Iniciar (só para a tua conta)?", vbYesNo + vbQuestion, "VaultCraft Studio")
  If answer <> vbYes Then WScript.Quit 0
  ReDim targets(1)
  targets(0) = shell.SpecialFolders("Desktop")
  targets(1) = shell.SpecialFolders("Programs")
End If

For Each dest In targets
  If Not fso.FolderExists(dest) Then fso.CreateFolder dest
  Set lnk = shell.CreateShortcut(dest & "\VaultCraft Studio.lnk")
  lnk.TargetPath = shell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\wscript.exe"
  lnk.Arguments = """" & appDir & "\VaultCraft.vbs"""
  lnk.WorkingDirectory = appDir
  lnk.IconLocation = appDir & "\app\public\vaultcraft.ico,0"
  lnk.Description = "VaultCraft Studio"
  lnk.Save
Next

If Not WScript.Arguments.Named.Exists("destino") Then
  MsgBox "Atalhos criados.", vbInformation, "VaultCraft Studio"
End If
