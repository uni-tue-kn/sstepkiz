#!/bin/sh

# $1 = target file
# $2 = key length (default 2048)
# $3 = owner

TARGET_FILE=$1
KEY_LENGTH=$2
OWNER=$3

# Create directory to file if not exists
mkdir -p "${TARGET_FILE%/*}"

# Use OpenSSL to generate DH parameters
openssl dhparam -out $DH_KEY_FILE $DH_KEY_LENGTH

# Set permissions for file
chmod 600 $DH_KEY_FILE
chown $3 $DH_KEY_FILE
