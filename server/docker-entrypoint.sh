#!/bin/sh
# Startet als root, übergibt das Datenverzeichnis an den Benutzer "node"
# (klappt so mit benannten Volumes und mit Synology-Ordnern) und läuft dann ohne root.
set -e
DATA_DIR="${DATA_DIR:-/data}"
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR"
  exec su-exec node "$@"
fi
exec "$@"
