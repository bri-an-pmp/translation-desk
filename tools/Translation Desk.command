#!/bin/zsh
# Double-click to start Translation Desk and open it in the browser.
# Closing this window stops the app.

APP_DIR="$HOME/projects/translation-desk"
URL="http://localhost:4321"

cd "$APP_DIR" || { echo "Couldn't find $APP_DIR"; read -k1 "?Press any key to close."; exit 1; }

# Already running? Just open the page.
if curl -s -o /dev/null "$URL/api/status"; then
  open "$URL"
  echo "Translation Desk is already running. It's open in your browser."
  exit 0
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null
if ! node -v 2>/dev/null | grep -q '^v2[2-9]'; then
  echo "Translation Desk needs Node 22. Open Terminal and run: nvm install 22"
  read -k1 "?Press any key to close."
  exit 1
fi

# Open the page as soon as the app is ready
( for i in {1..30}; do curl -s -o /dev/null "$URL/api/status" && open "$URL" && break; sleep 0.5; done ) &

echo "Starting Translation Desk… (close this window to stop it)"
npm start --silent
