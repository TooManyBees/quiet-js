kill -s SIGUSR1 $(cat server/tmp/quiet.pid) && cat server/tmp/quiet.state | jq
