#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="/Library/MonitoringAgent"
PLIST_NAME="com.yourteam.monitoringagent"
PLIST_SRC="$SCRIPT_DIR/$PLIST_NAME.plist"
PLIST_DEST="/Library/LaunchDaemons/$PLIST_NAME.plist"
JAR="$SCRIPT_DIR/monitoring-agent.jar"
PROPS="$SCRIPT_DIR/agent.properties"

if [ "$EUID" -ne 0 ]; then
    echo ""
    echo "  [HATA] Bu script sudo ile calistirilmalidir."
    echo "  Kullanim: sudo bash install-service.sh"
    echo ""
    exit 1
fi

echo ""
echo "  ================================================"
echo "   Monitoring Agent macOS - Servis Kurulumu"
echo "  ================================================"
echo ""

if [ ! -f "$JAR" ]; then
    echo "  [HATA] monitoring-agent.jar bulunamadi!"
    echo "  Beklenen konum: $JAR"
    echo ""
    exit 1
fi
echo "  [OK] monitoring-agent.jar bulundu."

if [ ! -f "$PROPS" ]; then
    echo "  [HATA] agent.properties bulunamadi!"
    echo "  agent.properties dosyasini olusturup backend-url, machine-id ve machine-token degerlerini gir."
    echo ""
    exit 1
fi
echo "  [OK] agent.properties bulundu."

if [ ! -f "$PLIST_SRC" ]; then
    echo "  [HATA] $PLIST_NAME.plist bulunamadi!"
    echo ""
    exit 1
fi
echo "  [OK] Plist dosyasi bulundu."

# macOS'ta /usr/libexec/java_home, sudo altında da doğru JVM yolunu bulur
JAVA_HOME_DIR="$(/usr/libexec/java_home -v 17+ 2>/dev/null)"
if [ -z "$JAVA_HOME_DIR" ]; then
    echo "  [HATA] Java 17+ bulunamadi!"
    echo "  Java 17+ kur: https://adoptium.net"
    echo ""
    exit 1
fi
JAVA_REAL="$JAVA_HOME_DIR/bin/java"
echo "  [OK] Java bulundu: $("$JAVA_REAL" -version 2>&1 | head -1) ($JAVA_REAL)"

if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    echo ""
    echo "  [BILGI] Mevcut servis kaldiriliyor..."
    launchctl unload "$PLIST_DEST" 2>/dev/null
    sleep 1
fi

echo ""
echo "  Dosyalar kopyalaniyor: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR/logs"
cp "$JAR"   "$INSTALL_DIR/monitoring-agent.jar"
cp "$PROPS" "$INSTALL_DIR/agent.properties"

# Plist'teki /usr/bin/java'yı gerçek Java yoluyla değiştirerek yaz
sed "s|<string>/usr/bin/java</string>|<string>$JAVA_REAL</string>|" "$PLIST_SRC" > "$PLIST_DEST"
chmod 644 "$PLIST_DEST"
chown root:wheel "$PLIST_DEST"
echo "  [OK] Dosyalar kopyalandi. (Java: $JAVA_REAL)"

echo ""
echo "  Servis baslatiliyor..."
launchctl load -w "$PLIST_DEST"
sleep 2

if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    echo "  [OK] Servis baslatildi."
else
    echo "  [HATA] Servis baslatılamadi!"
    echo "  Loglara bak: $INSTALL_DIR/logs/stderr.log"
    echo ""
    exit 1
fi

echo ""
echo "  ================================================"
echo "   KURULUM TAMAMLANDI!"
echo "  ================================================"
echo ""
echo "  Servis adi : Monitoring Agent macOS"
echo "  Plist      : $PLIST_DEST"
echo "  Kurulum    : $INSTALL_DIR"
echo "  Log klasoru: $INSTALL_DIR/logs/"
echo ""
echo "  Mac kapatip actiktan sonra bile servis otomatik baslar."
echo "  Servisi kaldirmak icin: sudo bash uninstall-service.sh"
echo ""
