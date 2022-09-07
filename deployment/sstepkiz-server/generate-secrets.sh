#!/bin/bash

if [ -z "$1" ]; then
  if [ -z "$SECRETS_DIR" ]; then
    echo 'Secrets directory missing'
    exit 1
  else
    SECRETS_DIR="$SECRETS_DIR"
  fi
else
  SECRETS_DIR="$1"
fi

# Load Environment Variables.
export $(cat .env | sed 's/#.*//g' | xargs)

# $1 = secret name
# $2 = length
function generate_secret {
  FILE_NAME="$SECRETS_DIR/$1.txt"
  if [[ ! -e $FILE_NAME ]]; then
    echo "Generating secret \"$1\"..."
    head /dev/urandom | tr -dc A-Za-z0-9 | head -c $2 > $FILE_NAME
  else
    echo "Secret \"$1\" already exists"
  fi
}

# Generate secrets directory if not exists.
mkdir -p $SECRETS_DIR

# Generate secrets if they do not exist.
generate_secret db_username 10
generate_secret db_password 20
generate_secret db_name 10

echo "Secrets generated"
