' VaultCraft Studio - arranque sem consola.
' Não requer administrador nem software instalado: usa o runtime Node.js incluído em runtime\.
' Os dados do utilizador ficam em %LOCALAPPDATA%\VaultCraft (sobrevivem a atualizações).
Option Explicit

Dim fso, shell, appDir, dataDir, nodeExe, url, port, i, edge, logFile, dbUrl
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
nodeExe = appDir & "\runtime\node.exe"
port = 3000
url = "http://127.0.0.1:" & port & "/"
dataDir = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\VaultCraft"

If Not fso.FileExists(nodeExe) Then
  MsgBox "Não encontrei " & nodeExe & "." & vbCrLf & "Extrai o ZIP completo (com a pasta runtime) antes de arrancar.", vbCritical, "VaultCraft Studio"
  WScript.Quit 1
End If

If Not fso.FolderExists(dataDir) Then fso.CreateFolder dataDir
If Not fso.FolderExists(dataDir & "\backups") Then fso.CreateFolder dataDir & "\backups"
If Not fso.FileExists(dataDir & "\vaultcraft.db") Then
  fso.CopyFile appDir & "\app\prisma\template.db", dataDir & "\vaultcraft.db"
End If

' Variáveis só para o processo do servidor (não ficam no sistema)
dbUrl = "file:" & Replace(dataDir & "\vaultcraft.db", "\", "/")
shell.Environment("PROCESS")("NODE_ENV") = "production"
shell.Environment("PROCESS")("HOSTNAME") = "127.0.0.1"
shell.Environment("PROCESS")("PORT") = CStr(port)
shell.Environment("PROCESS")("DATABASE_URL") = dbUrl
shell.Environment("PROCESS")("VAULTCRAFT_DATA_DIR") = dataDir

If Not IsUp(url) Then
  logFile = dataDir & "\servidor.log"
  shell.CurrentDirectory = appDir & "\app"
  shell.Run "cmd /c """"" & nodeExe & """ server.js >> """ & logFile & """ 2>&1""", 0, False

  For i = 1 To 60
    WScript.Sleep 1000
    If IsUp(url) Then Exit For
  Next
  If Not IsUp(url) Then
    MsgBox "O VaultCraft não arrancou dentro de 60 segundos." & vbCrLf & _
           "Porta " & port & " ocupada por outra aplicação, ou erro de arranque." & vbCrLf & _
           "Detalhes em: " & logFile, vbCritical, "VaultCraft Studio"
    WScript.Quit 1
  End If
End If

edge = shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe"
If fso.FileExists(edge) Then
  shell.Run """" & edge & """ --app=" & url & " --class=VaultCraft", 1, False
Else
  ' Edge vem com o Windows 10/11; sem ele, abre no browser predefinido
  shell.Run url, 1, False
End If

Function IsUp(target)
  Dim http
  IsUp = False
  On Error Resume Next
  Set http = CreateObject("MSXML2.XMLHTTP")
  http.open "GET", target, False
  http.setTimeouts 1000, 1000, 1000, 1000
  http.send
  If Err.Number = 0 Then IsUp = (http.Status = 200)
  Err.Clear
  On Error GoTo 0
End Function
