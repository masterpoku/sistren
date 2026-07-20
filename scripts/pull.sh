#!/usr/bin/env bash
# Tarik log Passenger dari server Rumahweb untuk debug.
set -euo pipefail

REMOTE_USER_HOST="cpanel-sistren"
REMOTE_APP_DIR="~/sistren"

ssh "$REMOTE_USER_HOST" "cat $REMOTE_APP_DIR/tmp/passenger.log 2>/dev/null || echo 'no passenger.log'"
