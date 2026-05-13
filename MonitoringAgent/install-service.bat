@echo off
setlocal EnableDelayedExpansion
title Monitoring Agent Windows - Service Installer

net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo.
    echo  [HATA] Bu script Yonetici olarak calistirilmalidir.
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
echo   Monitoring Agent Windows - Servis Kurulumu
echo  ================================================
echo.

if not exist "%JAR%" (
    echo  [HATA] monitoring-agent.jar bulunamadi!
    pause
    exit /b 1
)
echo  [OK] monitoring-agent.jar bulundu.

if not exist "%PROPS%" (
    echo  [HATA] agent.properties bulunamadi!
    pause
    exit /b 1
)
echo  [OK] agent.properties bulundu.

if not exist "%WINSW_XML%" (
    echo  [HATA] monitoring-agent-service.xml bulunamadi!
    pause
    exit /b 1
)
echo  [OK] monitoring-agent-service.xml bulundu.

echo  En yuksek Java 17+ surumu aranıyor...
set "JAVA_EXE="
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d='C:\Program Files\Java','C:\Program Files\Eclipse Adoptium','C:\Program Files\Microsoft','C:\Program Files\BellSoft','C:\Program Files\Amazon Corretto','C:\Program Files\Zulu','C:\Program Files\OpenJDK','C:\Program Files\Semeru'; $b=$null; $bv=0; $d | ForEach-Object { if(Test-Path $_){ Get-ChildItem $_ -Directory -EA 0 | ForEach-Object { $j=Join-Path $_.FullName 'bin\java.exe'; if(Test-Path $j){ $r=& $j -version 2>&1 | Select-String '(\d+)'; if($r){ $v=[int]$r.Matches[0].Value; if($v -ge 17 -and $v -gt $bv){ $bv=$v; $b=$j } } } } } }; if($b){ $b } else { exit 1 }" > "%TEMP%\_javapath.txt" 2>nul
set /p JAVA_EXE=<"%TEMP%\_javapath.txt"
del "%TEMP%\_javapath.txt" >nul 2>&1
if not defined JAVA_EXE (
    echo  [HATA] Java 17+ bulunamadi! Java 17+ yukleyin: https://adoptium.net
    pause
    exit /b 1
)
echo  [OK] Java bulundu: %JAVA_EXE%

if not exist "%WINSW_EXE%" (
    echo  WinSW indiriliyor...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe' -OutFile '%WINSW_EXE%' -UseBasicParsing"
    if not exist "%WINSW_EXE%" (
        echo  [HATA] WinSW indirilemedi.
        pause
        exit /b 1
    )
    echo  [OK] WinSW indirildi.
) else (
    echo  [OK] WinSW zaten mevcut.
)

sc query "%SERVICE_ID%" >nul 2>&1
if %errorLevel% EQU 0 (
    echo  Mevcut servis kaldiriliyor...
    "%WINSW_EXE%" stop  >nul 2>&1
    "%WINSW_EXE%" uninstall >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo  Servis kuruluyor...
"%WINSW_EXE%" install
if %errorLevel% NEQ 0 (
    echo  [HATA] Servis kurulamadi!
    pause
    exit /b 1
)
echo  [OK] Servis kuruldu.

echo  Servis baslatiliyor...
"%WINSW_EXE%" start
if %errorLevel% NEQ 0 (
    echo  [HATA] Servis baslatilamadi!
    pause
    exit /b 1
)
echo  [OK] Servis baslatildi.

echo.
echo  ================================================
echo   KURULUM TAMAMLANDI!
echo  ================================================
echo.
echo  Servis ID  : %SERVICE_ID%
echo  Log klasoru: %DIR%logs\
echo.
sc query "%SERVICE_ID%" | findstr "STATE"
echo.
pause