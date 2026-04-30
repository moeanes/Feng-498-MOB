@echo off
setlocal EnableDelayedExpansion
title Monitoring Agent - Service Installer

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
set "WINSW_XML=%DIR%monitoring-agent-service.xml"
set "JAR=%DIR%monitoring-agent.jar"
set "PROPS=%DIR%agent.properties"
set "SERVICE_ID=MonitoringAgent"

echo.
echo  ================================================
echo   Monitoring Agent - Windows Service Kurulumu
echo  ================================================
echo.

:: ─────────────────────────────────────────────────────────────
:: 2. Gerekli dosya kontrolleri
:: ─────────────────────────────────────────────────────────────
if not exist "%JAR%" (
    echo  [HATA] monitoring-agent.jar bulunamadi!
    echo  Beklenen konum: %JAR%
    echo.
    pause
    exit /b 1
)
echo  [OK] monitoring-agent.jar bulundu.

if not exist "%PROPS%" (
    echo  [HATA] agent.properties bulunamadi!
    echo  agent.properties dosyasini olusturup backend-url, machine-id ve machine-token degerlerini gir.
    echo.
    pause
    exit /b 1
)
echo  [OK] agent.properties bulundu.

if not exist "%WINSW_XML%" (
    echo  [HATA] monitoring-agent-service.xml bulunamadi!
    echo.
    pause
    exit /b 1
)
echo  [OK] monitoring-agent-service.xml bulundu.

:: ─────────────────────────────────────────────────────────────
:: 3. Java kontrolü
:: ─────────────────────────────────────────────────────────────
java -version >nul 2>&1
if %errorLevel% NEQ 0 (
    echo  [HATA] Java bulunamadi! PATH'e Java ekle veya JDK kur.
    echo.
    pause
    exit /b 1
)
echo  [OK] Java bulundu.

:: ─────────────────────────────────────────────────────────────
:: 4. WinSW indir (yoksa)
:: ─────────────────────────────────────────────────────────────
if not exist "%WINSW_EXE%" (
    echo.
    echo  WinSW (Windows Service Wrapper) indiriliyor...
    echo  Kaynak: GitHub/winsw v2.12.0
    echo.
    powershell -NoProfile -Command ^
        "Invoke-WebRequest -Uri 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe' -OutFile '%WINSW_EXE%' -UseBasicParsing"
    if not exist "%WINSW_EXE%" (
        echo  [HATA] WinSW indirilemedi. Internet baglantini kontrol et.
        echo.
        pause
        exit /b 1
    )
    echo  [OK] WinSW indirildi.
) else (
    echo  [OK] WinSW zaten mevcut.
)

:: ─────────────────────────────────────────────────────────────
:: 5. Servis zaten kayitli mi?
:: ─────────────────────────────────────────────────────────────
sc query "%SERVICE_ID%" >nul 2>&1
if %errorLevel% EQU 0 (
    echo.
    echo  [BILGI] Servis zaten kayitli. Once durdurulup kaldiriliyor...
    "%WINSW_EXE%" stop  >nul 2>&1
    "%WINSW_EXE%" uninstall >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: ─────────────────────────────────────────────────────────────
:: 6. Servisi kur ve baslat
:: ─────────────────────────────────────────────────────────────
echo.
echo  Servis kuruluyor...
"%WINSW_EXE%" install
if %errorLevel% NEQ 0 (
    echo  [HATA] Servis kurulamadi!
    pause
    exit /b 1
)
echo  [OK] Servis kuruldu.

echo.
echo  Servis baslatiliyor...
"%WINSW_EXE%" start
if %errorLevel% NEQ 0 (
    echo  [HATA] Servis baslatılamadi! Loglara bak: %DIR%logs\
    pause
    exit /b 1
)
echo  [OK] Servis baslatildi.

:: ─────────────────────────────────────────────────────────────
:: 7. Durum
:: ─────────────────────────────────────────────────────────────
echo.
echo  ================================================
echo   KURULUM TAMAMLANDI!
echo  ================================================
echo.
echo  Servis adi : Monitoring Agent
echo  Servis ID  : %SERVICE_ID%
echo  Log klasoru: %DIR%logs\
echo.
echo  PC kapatip actiktan sonra bile servis otomatik baslar.
echo  Servisi durdurmak icin: uninstall-service.bat (Yonetici olarak)
echo.
echo  Servis durumu:
sc query "%SERVICE_ID%" | findstr "STATE"
echo.
pause
