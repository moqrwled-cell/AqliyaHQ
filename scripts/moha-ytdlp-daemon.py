#!/usr/bin/env python3
"""
Moha Agent — Local Android Termux YT-DLP Daemon
Runs 100% locally on Android via Termux.
Zero server, zero laptop, zero cost, near-zero battery.
Listens on http://127.0.0.1:8765 and extracts live metadata from Instagram, TikTok, YouTube, and X.
"""

import sys
import json
import subprocess
import shutil
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8765
HOST = "127.0.0.1"

class YtDlpHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ["/", "/health"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            has_ytdlp = shutil.which("yt-dlp") is not None
            resp = {
                "status": "active",
                "engine": "yt-dlp",
                "ytdlp_installed": has_ytdlp,
                "version": "2.0.0",
                "message": "Moha Agent Local Engine Ready"
            }
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        if parsed.path == "/extract":
            qs = parse_qs(parsed.query)
            target_url = qs.get("url", [None])[0]
            if not target_url:
                self.send_error(400, "Missing 'url' parameter")
                return
            self._process_url(target_url)
            return

        self.send_error(404, "Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/extract":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self.send_error(400, "Empty Body")
                return
            body_bytes = self.rfile.read(content_length)
            try:
                payload = json.loads(body_bytes.decode("utf-8"))
                target_url = payload.get("url")
            except Exception:
                target_url = None

            if not target_url:
                self.send_error(400, "Missing 'url' in JSON body")
                return

            self._process_url(target_url)
            return

        self.send_error(404, "Not Found")

    def _process_url(self, target_url: str):
        # Verify yt-dlp executable
        ytdlp_bin = shutil.which("yt-dlp") or "yt-dlp"

        # Build yt-dlp command to extract metadata as JSON without downloading
        cmd = [
            ytdlp_bin,
            "--dump-json",
            "--skip-download",
            "--no-warnings",
            "--no-check-certificates",
            "--ignore-errors",
            target_url
        ]

        try:
            # 12 seconds timeout to ensure quick mobile response
            proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)
            stdout = proc.stdout.strip()

            if not stdout:
                # Fallback if yt-dlp returned nothing or failed
                err_msg = proc.stderr.strip()[:300] if proc.stderr else "No metadata returned"
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": err_msg}, ensure_ascii=False).encode("utf-8"))
                return

            # Sometimes multiple JSON objects are returned for playlists, pick the first
            first_line = stdout.splitlines()[0]
            meta = json.loads(first_line)

            # Extract subtitles text if available
            sub_text = None
            if "subtitles" in meta and isinstance(meta["subtitles"], dict):
                for lang in ["ar", "en"]:
                    if lang in meta["subtitles"]:
                        sub_text = f"Subtitles available in {lang}"
                        break

            # Clean and package response
            result = {
                "success": True,
                "title": meta.get("title"),
                "description": meta.get("description"),
                "uploader": meta.get("uploader") or meta.get("channel") or meta.get("uploader_id"),
                "thumbnail": meta.get("thumbnail"),
                "tags": meta.get("tags") or [],
                "duration": meta.get("duration"),
                "subtitles_text": sub_text,
                "url": target_url
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))

        except subprocess.TimeoutExpired:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": "yt-dlp extraction timed out"}, ensure_ascii=False).encode("utf-8"))

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False).encode("utf-8"))

    def log_message(self, format, *args):
        # Quiet logger for battery saving
        pass

def run():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, YtDlpHandler)
    print(f"🚀 Moha Agent YT-DLP Local Daemon started on http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping daemon...")
        httpd.server_close()

if __name__ == "__main__":
    run()
