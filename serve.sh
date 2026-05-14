#!/bin/sh
# Serve typeflux locally (also works as a plain file:// open)
PORT=${1:-8080}
echo "typeflux running at http://localhost:$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
