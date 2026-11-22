#!/usr/bin/env bash
# Motores de la auditoría autorizada para Ubuntu.
# Uso: sudo bash scripts/install-audit-tools.sh [usuario-que-ejecuta-PM2]
# Opcional: NUCLEI_VERSION=x.y.z para fijar la versión; INSTALL_CHROME=1 instala Google Chrome (rastreo con navegador).
set -euo pipefail

[[ $EUID -eq 0 ]] || { echo "Ejecuta con sudo." >&2; exit 1; }
APP_USER="${1:-${SUDO_USER:-root}}"
id "$APP_USER" >/dev/null

apt-get update
apt-get install -y ca-certificates curl unzip cron nmap testssl.sh bsdextrautils
command -v docker >/dev/null || apt-get install -y docker.io

case "$(dpkg --print-architecture)" in
  amd64) ARCH=amd64 ;;
  arm64) ARCH=arm64 ;;
  *) echo "Arquitectura no soportada." >&2; exit 1 ;;
esac

REPO=https://github.com/projectdiscovery/nuclei/releases
VERSION="${NUCLEI_VERSION:-$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$REPO/latest" | sed 's#.*/v##')}"
[[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Versión de Nuclei inválida: $VERSION" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ZIP="nuclei_${VERSION}_linux_${ARCH}.zip"
curl -fsSL -o "$TMP/$ZIP" "$REPO/download/v$VERSION/$ZIP"
curl -fsSL -o "$TMP/sums" "$REPO/download/v$VERSION/nuclei_${VERSION}_checksums.txt"
# Aborta si el binario no coincide con la suma publicada
(cd "$TMP" && grep -F " $ZIP" sums | sha256sum -c -)
unzip -q "$TMP/$ZIP" nuclei -d "$TMP"
install -m 0755 "$TMP/nuclei" /usr/local/bin/nuclei

runuser -u "$APP_USER" -- env HOME="$(getent passwd "$APP_USER" | cut -d: -f6)" /usr/local/bin/nuclei -update-templates
echo "17 4 * * * $APP_USER /usr/local/bin/nuclei -update-templates -silent >/dev/null 2>&1" > /etc/cron.d/defensati-nuclei
chmod 0644 /etc/cron.d/defensati-nuclei

docker pull zaproxy/zap-stable

if [[ "${INSTALL_CHROME:-0}" == "1" ]]; then
  [[ "$(dpkg --print-architecture)" == "amd64" ]] || { echo "Chrome estable solo existe para amd64: instala un Chromium propio y define CHROME_PATH." >&2; exit 1; }
  apt-get install -y gnupg
  install -d -m 0755 /usr/share/keyrings
  curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor --yes -o /usr/share/keyrings/google-chrome.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
  apt-get update
  apt-get install -y google-chrome-stable
fi

echo
echo "== Verificación =="
nuclei -version
nmap --version | head -n1
command -v testssl
docker --version
command -v google-chrome-stable >/dev/null && google-chrome-stable --version || echo "Chrome no instalado: el rastreo con navegador queda desactivado (INSTALL_CHROME=1 lo instala)"

NODE="$(runuser -u "$APP_USER" -- bash -lc 'node -v' 2>/dev/null || echo desconocido)"
echo "Node de $APP_USER: $NODE (el modo full exige >= 22.13; compruébalo también con: pm2 describe <app>)"

MEM_MB="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"
if (( MEM_MB < 2500 )); then
  echo "AVISO: ${MEM_MB} MB de RAM. ZAP usa hasta 1500 MB: corre el worker en otro servidor o amplía este."
fi
if [[ $APP_USER != root ]] && ! id -nG "$APP_USER" | grep -qw docker; then
  echo "AVISO: $APP_USER no puede usar Docker y ZAP quedará en error."
  echo "El grupo docker equivale a root y la web corre con ese usuario: usa Docker rootless (dockerd-rootless-setuptool.sh install)."
fi
