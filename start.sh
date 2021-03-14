cd server
if [ -e tmp/quiet.pid ]; then
  PROC=$(cat tmp/quiet.pid)
  kill $PROC 2> /dev/null || true
  rm tmp/quiet.pid 2> /dev/null || true
fi
if [ -e tmp/quiet.sock ]; then
  rm tmp/quiet.sock
fi

if [[ $NODE_ENV == "production" ]]; then
  node index.js >> log/server.access.log 2>> log/server.error.log &
else
  node index.js
fi
