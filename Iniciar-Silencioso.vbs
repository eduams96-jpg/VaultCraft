Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\projeto"
WshShell.Run "cmd.exe /c Iniciar-GameTracker.bat", 0, False
