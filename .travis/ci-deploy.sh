#!/bin/bash
set -e

SSH_HOST="deploy@snowowl.mastermovies.uk"
REMOTE_PATH="/var/www/api.mastermovies.uk/app/"
DEPLOY_KEY=".travis/deploy_key"

# Upload to production server
echo "[DEPLOY] Deploying build files to production server"
rsync -rzm --delete-after --no-perms --no-owner --no-group --include 'build/' --include 'build/***' --include 'assets/' --include 'assets/***' --include 'node_modules/' --include 'node_modules/***' --include 'package*.json' --exclude '*' -e "ssh -o 'NumberOfPasswordPrompts 0' -o BatchMode=yes -i '${DEPLOY_KEY}'" . "${SSH_HOST}:${REMOTE_PATH}"
if [ "$?" != 0 ]; then
  exit "$?"
fi


# Restart the API
ssh -i "${DEPLOY_KEY}" "${SSH_HOST}" /home/deploy/restart_api.sh
if [ "$?" != 0 ]; then
  exit "$?"
fi
