#!/bin/sh
# Serve typeflux locally — ES modules require HTTP
PORT=${1:-8080}
echo "typeflux running at http://localhost:$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
