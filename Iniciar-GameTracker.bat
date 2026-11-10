@echo off
title GameTracker Vault Launcher
cd /d "d:\projeto"

echo ========================================================
echo         GameTracker Vault - Inicializador Local
echo ========================================================
echo.
echo A abrir o navegador em http://localhost:3000 ...
start "" "http://localhost:3000"

echo A iniciar o servidor GameTracker Vault...
npm run dev
