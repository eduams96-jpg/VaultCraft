@echo off
title Parar GameTracker Vault
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Servidor GameTracker encerrado com sucesso.
timeout /t 2 >nul
