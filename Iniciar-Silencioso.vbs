' Arranca Iniciar-GameTracker.bat sem janela, na pasta onde este ficheiro está.
Set WshShell = CreateObject("WScript.Shell")
Dim folder
folder = Left(WScript.ScriptFullName, Len(WScript.ScriptFullName) - Len(WScript.ScriptName))
WshShell.CurrentDirectory = folder
WshShell.Run "cmd.exe /c """ & folder & "Iniciar-GameTracker.bat""", 0, False
