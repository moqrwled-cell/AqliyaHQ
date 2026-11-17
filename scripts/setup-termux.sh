#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Moha Agent — 1-Click Termux Local YT-DLP Setup
# تشغيل محرك YT-DLP المحلي على هاتف أندرويد بلمسة واحدة
# ==============================================================================

echo "⚡ [1/4] تحديث حزم تيرموكس..."
pkg update -y && pkg install -y python ffmpeg curl

echo "⚡ [2/4] تثبيت أحدث إصدار من yt-dlp..."
pip install -U yt-dlp

echo "⚡ [3/4] تحميل سكربت Moha Local Daemon..."
curl -sSL "https://raw.githubusercontent.com/moqrwled-cell/AqliyaHQ/main/scripts/moha-ytdlp-daemon.py" -o "$HOME/moha-ytdlp-daemon.py"
chmod +x "$HOME/moha-ytdlp-daemon.py"

echo "⚡ [4/4] إضافة التشغيل التلقائي واختصار التشغيل..."
if ! grep -q "moha-start" "$HOME/.bashrc" 2>/dev/null; then
    echo "alias moha-start='python \$HOME/moha-ytdlp-daemon.py &'" >> "$HOME/.bashrc"
fi

echo ""
echo "=========================================================="
echo "✅ تم تثبيت محرك YT-DLP بنجاح على هاتفك يا قائد محمد!"
echo "🚀 لتشغيل المحرك في الخلفية الآن، اكتب:"
echo "python ~/moha-ytdlp-daemon.py &"
echo "=========================================================="

python "$HOME/moha-ytdlp-daemon.py"
