#!/usr/bin/env sh

# Install acme.sh via curl or wget.
_exists() {
  cmd="$1"
  if [ -z "$cmd" ]; then
    echo "Usage: _exists <cmd>" >&2
    return 1
  fi

  if command -v "$cmd" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

if _exists curl && [ "${ACME_USE_WGET:-0}" = "0" ]; then
  curl -fsSL https://raw.githubusercontent.com/acmesh-official/acme.sh/master/acme.sh | \
    INSTALLONLINE=1 sh
elif _exists wget; then
  wget -qO- https://raw.githubusercontent.com/acmesh-official/acme.sh/master/acme.sh | \
    INSTALLONLINE=1 sh
else
  echo "curl or wget is required" >&2
  exit 1
fi
