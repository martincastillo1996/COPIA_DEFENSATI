#!/usr/bin/env bash
# Herramientas de la revisión interna (--internal): Semgrep, Gitleaks y Trivy.
# Uso: sudo bash scripts/install-internal-tools.sh
# Opcional: GITLEAKS_VERSION=x.y.z TRIVY_VERSION=x.y.z SEMGREP_VERSION=x.y.z para fijar versiones.
# Lynis no se instala aquí: se ejecuta en el servidor del cliente y se importa su informe.
set -euo pipefail

[[ $EUID -eq 0 ]] || { echo "Ejecuta con sudo." >&2; exit 1; }
apt-get update
apt-get install -y ca-certificates curl tar pipx

case "$(dpkg --print-architecture)" in
  amd64) G_ARCH=x64; T_ARCH=64bit ;;
  arm64) G_ARCH=arm64; T_ARCH=ARM64 ;;
  *) echo "Arquitectura no soportada." >&2; exit 1 ;;
esac

latest() { curl -fsSLI -o /dev/null -w '%{url_effective}' "https://github.com/$1/releases/latest" | sed 's#.*/v##'; }
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Cada binario se instala solo si coincide con la suma que publica el proyecto
fetch() { # repo version archivo archivo-de-sumas
  curl -fsSL -o "$TMP/$3" "https://github.com/$1/releases/download/v$2/$3"
  curl -fsSL -o "$TMP/sums" "https://github.com/$1/releases/download/v$2/$4"
  (cd "$TMP" && grep -F " $3" sums | sha256sum -c -)
}

G="${GITLEAKS_VERSION:-$(latest gitleaks/gitleaks)}"
[[ $G =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Versión de Gitleaks inválida: $G" >&2; exit 1; }
fetch gitleaks/gitleaks "$G" "gitleaks_${G}_linux_${G_ARCH}.tar.gz" "gitleaks_${G}_checksums.txt"
tar -xzf "$TMP/gitleaks_${G}_linux_${G_ARCH}.tar.gz" -C "$TMP" gitleaks
install -m 0755 "$TMP/gitleaks" /usr/local/bin/gitleaks

T="${TRIVY_VERSION:-$(latest aquasecurity/trivy)}"
[[ $T =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Versión de Trivy inválida: $T" >&2; exit 1; }
fetch aquasecurity/trivy "$T" "trivy_${T}_Linux-${T_ARCH}.tar.gz" "trivy_${T}_checksums.txt"
tar -xzf "$TMP/trivy_${T}_Linux-${T_ARCH}.tar.gz" -C "$TMP" trivy
install -m 0755 "$TMP/trivy" /usr/local/bin/trivy

# Semgrep en su propio entorno, disponible para todos
PIPX_HOME=/opt/pipx PIPX_BIN_DIR=/usr/local/bin pipx install "semgrep${SEMGREP_VERSION:+==$SEMGREP_VERSION}"

echo
echo "== Verificación =="
gitleaks version
trivy --version | head -n1
semgrep --version
echo "Las reglas de Semgrep y la base de Trivy se descargan en el primer uso: el servidor necesita salida a Internet."
