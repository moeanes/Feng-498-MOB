#!/bin/bash

PLIST_NAME="com.yourteam.monitoringagent"
PLIST_DEST="/Library/LaunchDaemons/$PLIST_NAME.plist"
INSTALL_DIR="/Library/MonitoringAgent"

if [ "$EUID" -ne 0 ]; then
    echo ""
    echo "  [HATA] Bu script sudo ile calistirilmalidir."
    echo "  Kullanim: sudo bash uninstall-service.sh"
    echo ""
    exit 1
fi

echo ""
echo "  ================================================"
echo "   Monitoring Agent macOS - Servis Kaldirma"
echo "  ================================================"
echo ""

if ! launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    echo "  [BILGI] Servis zaten kayitli degil."
    echo ""
    exit 0
fi

echo "  Servis durduruluyor..."
launchctl unload "$PLIST_DEST" 2>/dev/null
sleep 1

echo "  Plist dosyasi kaldiriliyor..."
rm -f "$PLIST_DEST"

echo ""
echo "  ================================================"
echo "   SERVIS KALDIRILDI."
echo "  ================================================"
echo ""
echo "  NOT: $INSTALL_DIR klasoru silinmedi."
echo "  Manuel silmek icin: sudo rm -rf $INSTALL_DIR"
echo ""
