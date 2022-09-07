#!/bin/sh

# Detect external IPv4 and IPv6 address
EXTERNAL_IP=$(/usr/local/bin/detect-external-ip -4)
EXTERNAL_IP6=$(/usr/local/bin/detect-external-ip -6)

# Generate DH params if not given
if [ ! -f $DH_KEY_FILE ]; then
  echo "Generating Diffie-Hellman parameter file $DH_KEY_FILE..."
  /usr/local/bin/generate-dh-params $DH_KEY_FILE $DH_KEY_LENGTH turnserver:turnserver > /dev/null
  echo "Diffie-Hellman parameter file created!"
fi

# Import certificate files if acme storage, certificate and private key file are given and not exist
if [ ! -z $ACME_FILE ] && [ ! -z $CERTIFICATE_FILE ] && [ ! -f $CERTIFICATE_FILE ] && [ ! -z $PRIVATE_KEY_FILE ] && [ ! -f $PRIVATE_KEY_FILE ]; then
  echo "Importing certificates from ACME storage..."
  /usr/local/bin/import-traefik-cert $ACME_FILE $TLS_CERT_RESOLVER $DOMAIN_NAME $CERTIFICATE_FILE $PRIVATE_KEY_FILE turnserver:turnserver > /dev/null
  echo "Certificates imported!"
fi

PARAMETERS=$(eval "echo \"${@}\"")
CMD=$(echo "turnserver $PARAMETERS")

exec $CMD
