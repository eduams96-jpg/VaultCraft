@echo off
rem Arranque para desenvolvimento: usa a pasta onde este ficheiro está (sem caminhos fixos).
title VaultCraft Launcher (desenvolvimento)
cd /d "%~dp0"

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 goto :openapp

powershell -NoProfile -WindowStyle Hidden -Command "Start-Process cmd.exe -ArgumentList '/c npm run dev' -WorkingDirectory '%~dp0' -WindowStyle Hidden"

:waitloop
timeout /t 1 /nobreak >nul
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 goto :waitloop

:openapp
set "APP_URL=http://localhost:3000"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=%APP_URL% --class=VaultCraft
    exit /b 0
)
start "" "%APP_URL%"
exit /b 0
