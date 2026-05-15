#!/bin/sh
# Serve typeflux locally (the app also opens fine as a plain file://).
# Sends no-cache headers so the browser never serves a stale JS/CSS
# file after an edit — no hard refresh needed.
PORT=${1:-8080}
echo "typeflux running at http://localhost:$PORT"
python3 -c "
import sys, http.server, socketserver
port = int(sys.argv[1])
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', port), NoCache) as httpd:
    httpd.serve_forever()
" "$PORT"
