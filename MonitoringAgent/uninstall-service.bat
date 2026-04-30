@echo off
setlocal EnableDelayedExpansion
title Monitoring Agent - Service Uninstaller

:: ─────────────────────────────────────────────────────────────
:: 1. Yönetici yetkisi kontrolü
:: ─────────────────────────────────────────────────────────────
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo.
    echo  [HATA] Bu script Yonetici (Administrator) olarak calistirilmalidir.
    echo  Dosyaya sag tikla ^> "Yonetici olarak calistir" secenegini sec.
    echo.
    pause
    exit /b 1
)

set "DIR=%~dp0"
set "WINSW_EXE=%DIR%monitoring-agent-service.exe"
set "SERVICE_ID=MonitoringAgent"

echo.
echo  ================================================
echo   Monitoring Agent - Windows Service Kaldirma
echo  ================================================
echo.

:: ─────────────────────────────────────────────────────────────
:: 2. Servis kayitli mi?
:: ─────────────────────────────────────────────────────────────
sc query "%SERVICE_ID%" >nul 2>&1
if %errorLevel% NEQ 0 (
    echo  [BILGI] Servis zaten kayitli degil.
    echo.
    pause
    exit /b 0
)

:: ─────────────────────────────────────────────────────────────
:: 3. Servisi durdur
:: ─────────────────────────────────────────────────────────────
echo  Servis durduruluyor...
"%WINSW_EXE%" stop
timeout /t 3 /nobreak >nul

:: ─────────────────────────────────────────────────────────────
:: 4. Servisi kaldır
:: ─────────────────────────────────────────────────────────────
echo  Servis kaldiriliyor...
"%WINSW_EXE%" uninstall
if %errorLevel% NEQ 0 (
    echo  [HATA] Servis kaldirilirken hata olustu!
    pause
    exit /b 1
)

echo.
echo  ================================================
echo   SERVIS KALDIRILDI.
echo  ================================================
echo.
echo  Machine backend'de hala kayitli. Verileri silmek icin
echo  backend uzerinden makinayi sil.
echo.
pause
