#!/bin/sh

# $1 = acme file name.
# $2 = certificate resolver name.
# $3 = domain name.
# $4 = certificate file name.
# $5 = private key file name.
# $6 = certificate an private key owner.

# Ensure that file exists.
if ! [ -f $1 ]; then
  echo "Cannot find ACME file"
  exit 1
fi

# Search for certificate with matching domain.
I=0
DOMAIN_NAME=$(jq -r .$2.Certificates[$I].domain.main $1)
while [ $DOMAIN_NAME != $3 ]; do
  if [ $DOMAIN_NAME = "null" ]; then
    echo "Domain not found"
    exit 2
  fi
  I=$(($I+1))
  DOMAIN_NAME=$(jq -r .$2.Certificates[$I].domain.main $1)
done

# Extract certificate and private key.
CERTIFICATE=$(jq -r .$2.Certificates[$I].certificate $1)
PRIVATE_KEY=$(jq -r .$2.Certificates[$I].key $1)

# Ensure that certificate and private key were extracted.
if [ CERTIFICATE = "null" ] | [ PRIVATE_KEY = "null" ]; then
  echo "Certificate or private key not found in file at certificate index $I"
  exit 3
fi

# Write certificate
echo $CERTIFICATE | base64 -d >> $4
chmod 644 $4
chown $6 $4
# Write private key
echo $PRIVATE_KEY | base64 -d >> $5
chmod 600 $5
chown $6 $5
