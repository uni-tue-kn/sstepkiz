#!/bin/sh

if [ -z "$1" ] || [ $1 == "-4" ]; then
  if [ -z "$EXTERNAL_IP" ]; then
    export EXTERNAL_IP="$(curl -4 https://icanhazip.com 2>/dev/null)"
  fi
  exec echo "$EXTERNAL_IP"
fi
if [ $1 == "-6" ]; then
  if [ -z "$EXTERNAL_IP6" ]; then
    export EXTERNAL_IP6="$(curl -6 https://icanhazip.com 2>/dev/null)"
  fi
  exec echo "$EXTERNAL_IP6"
fi
