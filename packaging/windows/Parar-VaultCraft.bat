@echo off
rem Termina o servidor do VaultCraft (processo que escuta na porta 3000).
title Parar VaultCraft Studio
set "FOUND="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set "FOUND=1"
    taskkill /F /PID %%a >nul 2>&1
)
if defined FOUND (echo VaultCraft Studio parado.) else (echo O VaultCraft nao estava a correr.)

