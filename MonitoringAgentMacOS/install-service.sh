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

# Tum JVM'leri tara, en yuksek Java 17+ surumunu sec (JAVA_HOME baz alinmaz)
JAVA_REAL=""
JAVA_BEST_VER=0
for jvm_home in /Library/Java/JavaVirtualMachines/*/Contents/Home; do
    java_bin="$jvm_home/bin/java"
    if [ -x "$java_bin" ]; then
        ver=$("$java_bin" -version 2>&1 | head -1 | sed 's/[^0-9]*\([0-9]*\).*/\1/')
        if [ "$ver" -ge 17 ] 2>/dev/null && [ "$ver" -gt "$JAVA_BEST_VER" ] 2>/dev/null; then
            JAVA_BEST_VER=$ver
            JAVA_REAL="$java_bin"
        fi
    fi
done

if [ -z "$JAVA_REAL" ]; then
    echo "  [HATA] /Library/Java/JavaVirtualMachines/ icinde Java 17+ bulunamadi!"
    echo "  Java 17+ kur: https://adoptium.net"
    echo "  Kurulduktan sonra tekrar dene."
    echo ""
    exit 1
fi
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
