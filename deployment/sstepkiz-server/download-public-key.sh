#!/bin/bash

if [ -z "$1" ]; then
  if [ -z "$SSO_ISSUER" ]; then
    echo 'SSO issuer missing'
    exit 1
  else
    SSO_ISSUER="$SSO_ISSUER"
    if [ -z "$SECRETS_DIR" ]; then
      echo 'Secrets directory missing'
      exit 1
    else
      SECRETS_DIR="$SECRETS_DIR"
    fi
  fi
else
  SSO_ISSUER="$1"
  if [ -z "$2" ]; then
    if [ -z "$SECRETS_DIR" ]; then
      echo 'Secrets directory missing'
      exit 1
    else
      SECRETS_DIR="$SECRETS_DIR"
    fi
  else
    SECRETS_DIR="$2"
  fi
fi

# Load Environment Variables.
export $(cat .env | sed 's/#.*//g' | xargs)

# Download OIDC info.
OIDC_INFO=$(curl -s ${SSO_ISSUER}) || exit 1

if [ $? == 0 ]
then
  # Extract public key from OIDC info.
  PUBLIC_KEY=$(echo ${OIDC_INFO} | sed -n 's|.*"public_key":"\([^"]*\)".*|\1|p')
  if [ ${#PUBLIC_KEY} -gt 0 ]
  then    
    # Generate secrets directory if not exists.
    mkdir -p $SECRETS_DIR

    # Write public key to file in PEM format.
    echo -e "-----BEGIN PUBLIC KEY-----\n${PUBLIC_KEY}\n-----END PUBLIC KEY-----" > ${SECRETS_DIR}/sso_public_key.pem
    echo 'Done'
  else
    echo 'Public key not found'
  fi
else
  echo 'Failed to download public key'
  exit 1
fi
